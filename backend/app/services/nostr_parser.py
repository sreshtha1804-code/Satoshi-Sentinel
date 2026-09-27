"""
Local Nostr event parsing. Reads NIP-01 event JSON structurally and
extracts references (pubkeys, e/p tags, URLs, embedded Bitcoin addresses).
It does not connect to any relay and does not cryptographically verify the
event signature — that requires secp256k1 Schnorr verification, which is
out of scope for this phase and is called out explicitly rather than
silently skipped.

Mirrors frontend/src/utils/detectors/nostrParser.js.
"""

import json
import re
import time
from dataclasses import dataclass, field
from typing import Any

from app.services.bech32 import bech32_decode, convert_bits
from app.services.bitcoin_address import AddressClassification, extract_bitcoin_addresses
from app.services.findings import Finding, make_finding
from app.services.url_analyzer import ParsedUrl, build_url_findings, extract_urls

HEX64 = re.compile(r"^[0-9a-f]{64}$", re.IGNORECASE)
NPUB_PATTERN = re.compile(r"\bnpub1[a-z0-9]{20,90}\b", re.IGNORECASE)

KNOWN_KINDS = {
    0: "Metadata (profile)",
    1: "Text note",
    3: "Contact list",
    4: "Encrypted direct message",
    5: "Event deletion",
    6: "Repost",
    7: "Reaction",
    9734: "Zap request",
    9735: "Zap receipt",
    10002: "Relay list",
    30023: "Long-form content",
}


@dataclass
class DecodedPubkey:
    npub: str
    hex: str | None
    checksum_verified: bool


def _decode_bech32_to_hex(token: str, expected_hrp: str) -> str | None:
    decoded = bech32_decode(token)
    if not decoded or decoded.hrp != expected_hrp:
        return None
    bytes_ = convert_bits(decoded.data, 5, 8, False)
    if bytes_ is None:
        return None
    return "".join(f"{b:02x}" for b in bytes_)


def extract_nostr_pubkeys(text: str) -> list[DecodedPubkey]:
    if not text:
        return []
    tokens = NPUB_PATTERN.findall(text)
    seen: set[str] = set()
    results: list[DecodedPubkey] = []
    for t in tokens:
        if t in seen:
            continue
        seen.add(t)
        hex_ = _decode_bech32_to_hex(t, "npub")
        results.append(DecodedPubkey(npub=t, hex=hex_, checksum_verified=bool(hex_)))
    return results


@dataclass
class ParsedNostrEvent:
    is_event: bool
    identifier_type: str | None = None
    raw: str = ""
    pubkey_hex: str | None = None
    event_id_hex: str | None = None
    checksum_verified: bool | None = None

    id: str | None = None
    id_valid_hex: bool = False
    pubkey: str | None = None
    pubkey_valid_hex: bool = False
    kind: int | None = None
    kind_label: str | None = None
    created_at: int | None = None
    has_sig: bool = False
    content: str = ""
    tags: list = field(default_factory=list)
    urls_in_content: list[ParsedUrl] = field(default_factory=list)
    urls_in_tags: list[ParsedUrl] = field(default_factory=list)
    addresses_in_content: list[AddressClassification] = field(default_factory=list)


def _parse_as_url_safe(value: Any) -> ParsedUrl | None:
    found = extract_urls(str(value))
    return found[0] if found else None


def _analyze_event_object(evt: dict, raw_text: str) -> ParsedNostrEvent:
    tags = evt.get("tags") if isinstance(evt.get("tags"), list) else []
    r_tags = [t[1] for t in tags if isinstance(t, list) and len(t) > 1 and t[0] == "r"]

    content = evt.get("content") if isinstance(evt.get("content"), str) else ""
    urls_in_content = extract_urls(content)
    urls_in_tags = [u for u in (_parse_as_url_safe(v) for v in r_tags) if u]
    addresses_in_content = extract_bitcoin_addresses(content)

    kind = evt.get("kind") if isinstance(evt.get("kind"), int) else None

    return ParsedNostrEvent(
        is_event=True,
        raw=raw_text,
        id=evt.get("id") if isinstance(evt.get("id"), str) else None,
        id_valid_hex=isinstance(evt.get("id"), str) and bool(HEX64.match(evt["id"])),
        pubkey=evt.get("pubkey") if isinstance(evt.get("pubkey"), str) else None,
        pubkey_valid_hex=isinstance(evt.get("pubkey"), str) and bool(HEX64.match(evt["pubkey"])),
        kind=kind,
        kind_label=(KNOWN_KINDS.get(kind, "Unrecognized kind") if kind is not None else None),
        created_at=evt.get("created_at") if isinstance(evt.get("created_at"), int) else None,
        has_sig=isinstance(evt.get("sig"), str) and len(evt["sig"]) > 0,
        content=content,
        tags=tags,
        urls_in_content=urls_in_content,
        urls_in_tags=urls_in_tags,
        addresses_in_content=addresses_in_content,
    )


def parse_nostr_input(raw: str) -> ParsedNostrEvent:
    trimmed = (raw or "").strip()

    parsed_json = None
    try:
        candidate = json.loads(trimmed)
        if isinstance(candidate, dict):
            parsed_json = candidate
    except (json.JSONDecodeError, TypeError):
        parsed_json = None

    if parsed_json is not None:
        return _analyze_event_object(parsed_json, trimmed)

    if re.match(r"^npub1", trimmed, re.IGNORECASE):
        hex_ = _decode_bech32_to_hex(trimmed, "npub")
        return ParsedNostrEvent(
            is_event=False, identifier_type="npub", raw=trimmed,
            pubkey_hex=hex_, checksum_verified=bool(hex_),
        )
    if re.match(r"^note1", trimmed, re.IGNORECASE):
        hex_ = _decode_bech32_to_hex(trimmed, "note")
        return ParsedNostrEvent(
            is_event=False, identifier_type="note", raw=trimmed,
            event_id_hex=hex_, checksum_verified=bool(hex_),
        )
    if re.match(r"^(nevent1|nprofile1|naddr1)", trimmed, re.IGNORECASE):
        return ParsedNostrEvent(is_event=False, identifier_type="complex-nip19", raw=trimmed, checksum_verified=None)

    return ParsedNostrEvent(is_event=False, identifier_type="unrecognized", raw=trimmed)


def build_nostr_findings(parsed: ParsedNostrEvent) -> list[Finding]:
    findings: list[Finding] = []

    if not parsed.is_event:
        if parsed.identifier_type == "npub":
            findings.append(
                make_finding(
                    type="nostr_identifier_parsed",
                    severity="low",
                    title="Valid npub identifier" if parsed.checksum_verified else "npub failed checksum verification",
                    description=(
                        "The input is a single npub public-key identifier with a valid bech32 checksum."
                        if parsed.checksum_verified
                        else "The input looks like an npub identifier, but its bech32 checksum does not verify — it may be mistyped or corrupted."
                    ),
                    evidence=parsed.raw,
                )
            )
        elif parsed.identifier_type == "unrecognized":
            findings.append(
                make_finding(
                    type="nostr_unrecognized_input",
                    severity="medium",
                    title="Input is not a recognized Nostr event or identifier",
                    description="The submitted content is neither valid NIP-01 event JSON nor a recognized NIP-19 identifier (npub/note/nevent/nprofile/naddr).",
                    evidence=parsed.raw[:120],
                )
            )
        return findings

    if not parsed.has_sig:
        findings.append(
            make_finding(
                type="nostr_missing_signature",
                severity="medium",
                title="Event has no signature field",
                description='A valid Nostr event should carry a "sig" field. Its absence means this event cannot be authenticated at all, structurally or cryptographically.',
                evidence="sig field missing or empty",
            )
        )
    else:
        findings.append(
            make_finding(
                type="nostr_signature_not_verified",
                severity="low",
                title="Signature present but not cryptographically verified",
                description='A "sig" field is present, but this phase only checks for its presence — it does not perform secp256k1 Schnorr signature verification.',
                evidence="sig field present (not shown)",
            )
        )

    if not parsed.pubkey_valid_hex:
        findings.append(
            make_finding(
                type="nostr_malformed_pubkey",
                severity="medium",
                title="Pubkey is not a valid 64-character hex string",
                description="A Nostr event pubkey should be 64 lowercase hex characters. This one does not match that structure.",
                evidence=str(parsed.pubkey or "missing"),
            )
        )

    if parsed.kind is not None and parsed.kind not in KNOWN_KINDS:
        findings.append(
            make_finding(
                type="nostr_unrecognized_kind",
                severity="low",
                title="Uncommon or unrecognized event kind",
                description=f"Kind {parsed.kind} is not among the commonly recognized Nostr event kinds checked in this phase. This is informational, not necessarily a risk signal.",
                evidence=f"kind: {parsed.kind}",
            )
        )

    if parsed.created_at is not None:
        now_seconds = int(time.time())
        one_day = 86400
        if parsed.created_at > now_seconds + one_day:
            findings.append(
                make_finding(
                    type="nostr_future_timestamp",
                    severity="medium",
                    title="Event timestamp is in the future",
                    description="The created_at timestamp is more than a day ahead of the current time, which is unusual for a genuinely created event.",
                    evidence=f"created_at: {parsed.created_at}",
                )
            )

    return findings
