"""
Satoshi Sentinel — local signal extraction engine (server-side).

This mirrors frontend/src/services/signalEngine.js exactly in shape and
behavior, so the same input produces the same findings and score whether
computed in the browser or on the server. Nothing here calls an external
API, a model, or the blockchain — see bitcoin_service.py and
nostr_service.py for the endpoints that do, separately and explicitly.
"""

import time
from typing import TypedDict

from app.services.bitcoin_address import classify_address, extract_bitcoin_addresses
from app.services.findings import Finding, make_finding
from app.services.message_detectors import analyze_message_text
from app.services.nostr_parser import build_nostr_findings, extract_nostr_pubkeys, parse_nostr_input
from app.services.scoring import compute_local_score
from app.services.url_analyzer import build_url_findings, extract_urls, parse_url


class Extracted(TypedDict):
    bitcoin_addresses: list[str]
    urls: list[str]
    nostr_pubkeys: list[str]


class AnalysisResult(TypedDict):
    input_type: str
    signals: list[str]
    extracted: Extracted
    local_score: int
    findings: list[Finding]
    meta: dict


def _empty_extracted() -> Extracted:
    return {"bitcoin_addresses": [], "urls": [], "nostr_pubkeys": []}


def _analyze_message(content: str) -> dict:
    if not content:
        return {"signals": [], "findings": [], "extracted": _empty_extracted()}
    return analyze_message_text(content)


def _analyze_address(content: str) -> dict:
    if not content:
        return {"signals": [], "findings": [], "extracted": _empty_extracted()}

    primary = classify_address(content)
    scanned = extract_bitcoin_addresses(content)
    all_addrs = scanned if scanned else [primary]

    findings: list[Finding] = []
    signals: set[str] = set()
    for a in all_addrs:
        if a.is_valid_format:
            signals.add("bitcoin_address_valid_format")
            findings.append(
                make_finding(
                    type="bitcoin_address_detected",
                    severity="low",
                    title="Bitcoin address detected",
                    description=f"A structurally valid {a.type} address ({a.network}) was found in the submitted address. This is a neutral, factual observation — presence of an address is not itself a risk signal.",
                    evidence=a.address,
                )
            )
        else:
            signals.add("bitcoin_address_malformed")
            findings.append(
                make_finding(
                    type="bitcoin_address_malformed",
                    severity="medium",
                    title="Address-like string does not match a known format",
                    description=f"A string resembling a Bitcoin address was found in the submitted address, but {a.notes.lower()}",
                    evidence=a.address,
                )
            )

    return {
        "signals": list(signals),
        "findings": findings,
        "extracted": {
            "bitcoin_addresses": [a.address for a in all_addrs],
            "urls": [],
            "nostr_pubkeys": [],
        },
    }


def _analyze_url(content: str) -> dict:
    if not content:
        return {"signals": [], "findings": [], "extracted": _empty_extracted()}

    primary = parse_url(content)
    scanned = extract_urls(content)
    all_urls = scanned if scanned else ([primary] if primary else [])

    if not all_urls:
        return {
            "signals": ["url_unparseable"],
            "findings": [
                make_finding(
                    type="url_unparseable",
                    severity="medium",
                    title="Input could not be parsed as a URL",
                    description="The submitted content does not structurally resemble a URL Sentinel can parse.",
                    evidence=content[:120],
                )
            ],
            "extracted": _empty_extracted(),
        }

    findings: list[Finding] = []
    for u in all_urls:
        findings.extend(build_url_findings(u, context="submitted URL"))

    if not findings:
        findings.append(
            make_finding(
                type="url_no_flags",
                severity="low",
                title="No structural red flags detected",
                description="The URL structure does not match any of the local heuristic patterns Sentinel currently checks (shorteners, lookalike domains, raw IP hosts, punycode, insecure protocol). This does not confirm the destination is safe.",
                evidence=all_urls[0].hostname,
            )
        )

    signals = list({f["type"] for f in findings})

    return {
        "signals": signals,
        "findings": findings,
        "extracted": {
            "bitcoin_addresses": [],
            "urls": [u.original for u in all_urls],
            "nostr_pubkeys": [],
        },
    }


def _analyze_nostr(content: str) -> dict:
    if not content:
        return {"signals": [], "findings": [], "extracted": _empty_extracted()}

    parsed = parse_nostr_input(content)
    findings = build_nostr_findings(parsed)
    signals = list({f["type"] for f in findings})
    extracted = _empty_extracted()

    if parsed.is_event:
        if parsed.pubkey:
            extracted["nostr_pubkeys"].append(parsed.pubkey)

        seen_url_key: set[str] = set()
        deduped_urls = []
        for u in [*parsed.urls_in_content, *parsed.urls_in_tags]:
            key = u.hostname + u.pathname
            if key in seen_url_key:
                continue
            seen_url_key.add(key)
            deduped_urls.append(u)
        extracted["urls"].extend(u.original for u in deduped_urls)
        extracted["bitcoin_addresses"].extend(a.address for a in parsed.addresses_in_content)

        if parsed.addresses_in_content:
            for a in parsed.addresses_in_content:
                if a.is_valid_format:
                    findings.append(
                        make_finding(
                            type="bitcoin_address_detected",
                            severity="low",
                            title="Bitcoin address detected",
                            description=f"A structurally valid {a.type} address ({a.network}) was found in the event content.",
                            evidence=a.address,
                        )
                    )
                else:
                    findings.append(
                        make_finding(
                            type="bitcoin_address_malformed",
                            severity="medium",
                            title="Address-like string does not match a known format",
                            description=f"A string resembling a Bitcoin address was found in the event content, but {a.notes.lower()}",
                            evidence=a.address,
                        )
                    )
            signals.append("bitcoin_address_in_event")

        if deduped_urls:
            for u in deduped_urls:
                findings.extend(build_url_findings(u, context="event content or tags"))
            signals.append("url_in_event")

    elif parsed.identifier_type == "npub" and parsed.pubkey_hex:
        extracted["nostr_pubkeys"].append(parsed.raw)
    else:
        pubkeys = extract_nostr_pubkeys(content)
        addresses = extract_bitcoin_addresses(content)
        urls = extract_urls(content)
        extracted["nostr_pubkeys"].extend(p.npub for p in pubkeys)
        extracted["bitcoin_addresses"].extend(a.address for a in addresses)
        extracted["urls"].extend(u.original for u in urls)

    return {"signals": list(dict.fromkeys(signals)), "findings": findings, "extracted": extracted}


_ANALYZERS = {
    "message": _analyze_message,
    "address": _analyze_address,
    "url": _analyze_url,
    "nostr": _analyze_nostr,
}


def analyze_input(input_type: str, content: str) -> AnalysisResult:
    """
    Run the full local signal extraction pipeline on a piece of content.
    Deterministic: the same (input_type, content) always yields the same
    signals, findings, and local_score.
    """
    trimmed = (content or "").strip()
    analyzer = _ANALYZERS.get(input_type, lambda _c: {"signals": [], "findings": [], "extracted": _empty_extracted()})
    result = analyzer(trimmed)
    local_score = compute_local_score(result["findings"])

    return {
        "input_type": input_type,
        "signals": result["signals"],
        "extracted": result["extracted"],
        "local_score": local_score,
        "findings": result["findings"],
        "meta": {
            "analyzed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "raw_input_preview": trimmed[:400],
        },
    }
