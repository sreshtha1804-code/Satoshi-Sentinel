"""
Local heuristic analysis of free-form message text. Every detector here is
a plain pattern match against the text the user submitted — nothing is
sent anywhere, and nothing here claims certainty. Findings describe what
was observed and why that pattern is commonly associated with risk; they
do not assert that the message is fraudulent.

Mirrors frontend/src/utils/detectors/messageDetectors.js.
"""

import re
from dataclasses import dataclass
from typing import Pattern

from app.services.findings import Finding, make_finding
from app.services.url_analyzer import build_url_findings, extract_urls
from app.services.bitcoin_address import extract_bitcoin_addresses
from app.services.nostr_parser import extract_nostr_pubkeys


@dataclass(frozen=True)
class PatternDetector:
    type: str
    severity: str
    title: str
    description: str
    pattern: Pattern


PATTERN_DETECTORS: list[PatternDetector] = [
    PatternDetector(
        type="urgency_language",
        severity="medium",
        title="Urgency or time-pressure language",
        description="The message uses language designed to create time pressure, which discourages the careful verification a legitimate request can usually withstand.",
        pattern=re.compile(
            r"\b(act now|immediately|urgent(ly)?|right away|as soon as possible|24 hours?|expires? (soon|today|in)|final notice|account (will be|has been) (suspend|lock|restrict)|limited time|before it'?s too late|last chance)\b",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="giveaway_reward_claim",
        severity="high",
        title="Giveaway or reward claim",
        description="The message references a giveaway, airdrop, or reward. Unsolicited crypto giveaways are one of the most common scam formats.",
        pattern=re.compile(
            r"\b(giveaway|airdrop|you'?ve won|you have won|claim your (reward|prize|bonus)|free bitcoin|free btc|double your (btc|bitcoin|crypto|money)|lucky winner)\b",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="seed_phrase_request",
        severity="high",
        title="Seed phrase request",
        description="The message asks for a recovery/seed phrase. No legitimate service, wallet, or support team ever needs this — it is the single most damaging piece of information you can hand over.",
        pattern=re.compile(r"\b(seed phrase|recovery phrase|mnemonic( phrase)?|12[- ]word|24[- ]word)\b", re.IGNORECASE),
    ),
    PatternDetector(
        type="private_key_request",
        severity="high",
        title="Private key request",
        description="The message asks for a private key, WIF, or keystore file. Handing this over gives immediate and irreversible control of the associated funds.",
        pattern=re.compile(r"\b(private key|priv(?:ate)? ?key|wif key|keystore file|export (your )?key)\b", re.IGNORECASE),
    ),
    PatternDetector(
        type="credential_request",
        severity="high",
        title="Login credential or code request",
        description="The message asks for a password, login details, or a one-time verification code. Legitimate support channels do not need these to help you.",
        pattern=re.compile(
            r"(password|login details|log[- ]?in credentials|2fa code|two[- ]factor code|verification code|one[- ]time (code|passcode)|otp\b)",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="impersonation_indicator",
        severity="high",
        title="Impersonation of official support",
        description="The message presents itself as official support or staff from a known service. Real support teams generally do not initiate contact through DMs asking you to act on your wallet.",
        pattern=re.compile(
            r"\b(official (support|team)|this is (coinbase|binance|kraken|ledger|metamask|trezor) support|customer (support|service) team|verified (agent|account)|wallet support team)\b",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="unrealistic_returns",
        severity="high",
        title="Unrealistic investment return claim",
        description="The message promises guaranteed or outsized returns. No legitimate investment can guarantee profit, let alone doubling or multiplying funds quickly.",
        pattern=re.compile(
            r"\b(guaranteed (return|profit)s?|100% profit|risk[- ]free (investment|return)|\d{2,}x returns?|double your (money|investment|btc|bitcoin)|triple your)\b",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="send_funds_request",
        severity="high",
        title="Direct request to send funds",
        description='The message directly asks the reader to send cryptocurrency, most often framed as a "verification" or "processing" step.',
        pattern=re.compile(
            r"\b(send (bitcoin|btc|crypto|funds|payment) to|please send \d|small (fee|amount|deposit) to (verify|unlock|process)|make a payment to)\b",
            re.IGNORECASE,
        ),
    ),
    PatternDetector(
        type="platform_migration_request",
        severity="medium",
        title="Request to move the conversation off-platform",
        description="The message asks to continue on Telegram, Discord, or WhatsApp. Moving to a less-moderated channel is a common step before a scam attempt escalates.",
        pattern=re.compile(
            r"\b(telegram\.me|t\.me/|discord\.gg|join (my|our) telegram|message me on (telegram|whatsapp|discord)|add me on (telegram|whatsapp))\b",
            re.IGNORECASE,
        ),
    ),
]


def _first_match_snippet(text: str, pattern: Pattern, max_len: int = 90) -> str | None:
    m = pattern.search(text)
    if not m:
        return None
    start = max(0, m.start() - 15)
    end = min(len(text), m.end() + 30)
    snippet = text[start:end].strip()
    return f"{snippet[:max_len]}…" if len(snippet) > max_len else snippet


def _run_pattern_detectors(text: str) -> tuple[list[str], list[Finding]]:
    signals: list[str] = []
    findings: list[Finding] = []
    for d in PATTERN_DETECTORS:
        if d.pattern.search(text):
            signals.append(d.type)
            findings.append(
                make_finding(
                    type=d.type,
                    severity=d.severity,
                    title=d.title,
                    description=d.description,
                    evidence=_first_match_snippet(text, d.pattern) or d.title,
                )
            )
    return signals, findings


def analyze_message_text(text: str) -> dict:
    content = text or ""
    signals, findings = _run_pattern_detectors(content)

    addresses = extract_bitcoin_addresses(content)

    address_findings: list[Finding] = []
    for a in addresses:
        if a.is_valid_format:
            address_findings.append(
                make_finding(
                    type="bitcoin_address_detected",
                    severity="low",
                    title="Bitcoin address detected",
                    description=f"A structurally valid {a.type} address ({a.network}) was found in the message. This is a neutral, factual observation — presence of an address is not itself a risk signal.",
                    evidence=a.address,
                )
            )
        else:
            address_findings.append(
                make_finding(
                    type="bitcoin_address_malformed",
                    severity="medium",
                    title="Address-like string does not match a known format",
                    description=f"A string resembling a Bitcoin address was found in the message, but {a.notes.lower()}",
                    evidence=a.address,
                )
            )
    if addresses:
        signals.append("bitcoin_address_in_message")

    urls = extract_urls(content)
    url_findings: list[Finding] = []
    for u in urls:
        url_findings.extend(build_url_findings(u, context="message"))
    if urls:
        signals.append("url_in_message")

    pubkeys = extract_nostr_pubkeys(content)

    combined_findings = findings + address_findings + url_findings

    has_send_request = "send_funds_request" in signals
    valid_addresses = [a for a in addresses if a.is_valid_format]
    if has_send_request and valid_addresses:
        signals.append("funds_request_with_address")
        combined_findings.append(
            make_finding(
                type="funds_request_with_address",
                severity="high",
                title="Payment request paired with a ready-to-use address",
                description="The message both asks the reader to send funds and supplies a specific, structurally valid address to send them to — the combination that actually enables a transfer, not just the request in isolation.",
                evidence=valid_addresses[0].address,
            )
        )

    return {
        "signals": signals,
        "findings": combined_findings,
        "extracted": {
            "bitcoin_addresses": [a.address for a in addresses],
            "urls": [u.original for u in urls],
            "nostr_pubkeys": [p.npub for p in pubkeys],
        },
    }
