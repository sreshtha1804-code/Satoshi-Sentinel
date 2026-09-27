"""
Local URL structure analysis. Parses the URL and flags patterns commonly
associated with phishing or link obfuscation. This never fetches the URL,
never checks reputation databases, and never confirms the site's actual
content — it only looks at the string's structure.

Mirrors frontend/src/utils/detectors/urlAnalyzer.js.
"""

import re
from dataclasses import dataclass
from urllib.parse import urlparse

from app.services.findings import Finding, make_finding

URL_SCAN_PATTERN = re.compile(r"\b((?:https?://|www\.)[^\s<>\"')]+)", re.IGNORECASE)

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "cutt.ly", "rebrand.ly", "shorturl.at", "rb.gy", "tiny.cc", "lnkd.in",
    "s.id", "v.gd", "soo.gd",
}

WATCHED_BRANDS = [
    "coinbase", "binance", "kraken", "metamask", "ledger", "trezor",
    "blockchain", "paypal", "bitfinex", "crypto.com", "kucoin", "gemini",
    "nostr", "blockstream",
]

SUSPICIOUS_WORDS = [
    "verify", "support", "secure", "login", "wallet-recovery", "recover",
    "unlock", "help", "confirm", "update", "security",
]


@dataclass
class ParsedUrl:
    original: str
    normalized: str
    hostname: str
    protocol: str
    pathname: str
    is_ip_host: bool
    is_shortener: bool
    is_punycode: bool
    insecure: bool
    subdomain_depth: int
    brand_lookalike: str | None
    has_suspicious_word: bool


def _normalize_candidate(raw: str) -> str:
    value = raw.strip().rstrip(".,;:!?")
    if not re.match(r"^https?://", value, re.IGNORECASE):
        value = f"https://{value}"
    return value


def parse_url(raw_url: str) -> ParsedUrl | None:
    normalized = _normalize_candidate(raw_url)
    try:
        parsed = urlparse(normalized)
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return None
    except Exception:
        return None

    labels = [l for l in hostname.split(".") if l]
    is_ip_host = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname))
    is_shortener = hostname in KNOWN_SHORTENERS
    is_punycode = any(l.startswith("xn--") for l in labels)
    insecure = parsed.scheme == "http"
    subdomain_depth = max(0, len(labels) - 2)

    registrable_domain = ".".join(labels[-2:]) if len(labels) >= 2 else hostname
    brand_lookalike = None
    for brand in WATCHED_BRANDS:
        brand_in_host = brand in hostname
        brand_is_registrable = registrable_domain.startswith(f"{brand}.")
        if brand_in_host and not brand_is_registrable:
            brand_lookalike = brand
            break

    has_suspicious_word = any(w in hostname for w in SUSPICIOUS_WORDS)

    return ParsedUrl(
        original=raw_url.strip(),
        normalized=normalized,
        hostname=hostname,
        protocol=parsed.scheme,
        pathname=parsed.path or "",
        is_ip_host=is_ip_host,
        is_shortener=is_shortener,
        is_punycode=is_punycode,
        insecure=insecure,
        subdomain_depth=subdomain_depth,
        brand_lookalike=brand_lookalike,
        has_suspicious_word=has_suspicious_word,
    )


def extract_urls(text: str) -> list[ParsedUrl]:
    if not text:
        return []
    matches = URL_SCAN_PATTERN.findall(text)
    seen: set[str] = set()
    results: list[ParsedUrl] = []
    for m in matches:
        parsed = parse_url(m)
        if not parsed:
            continue
        key = parsed.hostname + parsed.pathname
        if key in seen:
            continue
        seen.add(key)
        results.append(parsed)
    return results


def build_url_findings(parsed: ParsedUrl | None, context: str = "submitted content") -> list[Finding]:
    findings: list[Finding] = []
    if not parsed:
        return findings

    if parsed.brand_lookalike:
        findings.append(
            make_finding(
                type="url_brand_lookalike",
                severity="high",
                title="Domain references a known brand outside its own domain",
                description=(
                    f'The hostname contains "{parsed.brand_lookalike}" but the registrable domain is not '
                    f"{parsed.brand_lookalike}'s own domain. This pattern is commonly used to make a link look official."
                ),
                evidence=parsed.hostname,
            )
        )

    if parsed.is_shortener:
        findings.append(
            make_finding(
                type="url_shortener",
                severity="medium",
                title="Shortened URL",
                description=f"The link in the {context} uses a URL-shortening service, which hides the actual destination until visited.",
                evidence=parsed.hostname,
            )
        )

    if parsed.is_ip_host:
        findings.append(
            make_finding(
                type="url_ip_host",
                severity="high",
                title="Raw IP address used instead of a domain",
                description="The link points directly at an IP address rather than a named domain, which is unusual for a legitimate service and common in phishing infrastructure.",
                evidence=parsed.hostname,
            )
        )

    if parsed.is_punycode:
        findings.append(
            make_finding(
                type="url_punycode",
                severity="medium",
                title="Punycode-encoded domain",
                description="The hostname uses punycode (xn--) encoding, which can be used to visually spoof a legitimate domain with look-alike characters.",
                evidence=parsed.hostname,
            )
        )

    if parsed.subdomain_depth >= 3:
        findings.append(
            make_finding(
                type="url_deep_subdomain",
                severity="low",
                title="Unusually deep subdomain structure",
                description=f"The hostname has {parsed.subdomain_depth} subdomain levels, which is sometimes used to bury a suspicious registrable domain out of casual view.",
                evidence=parsed.hostname,
            )
        )

    if parsed.has_suspicious_word and not parsed.brand_lookalike:
        findings.append(
            make_finding(
                type="url_suspicious_wording",
                severity="low",
                title="Domain uses account-action wording",
                description='The hostname itself contains a word like "verify", "secure", or "recover" — a pattern more common on phishing pages than on the legitimate sites they imitate.',
                evidence=parsed.hostname,
            )
        )

    if parsed.insecure:
        findings.append(
            make_finding(
                type="url_insecure_protocol",
                severity="low",
                title="Unencrypted HTTP link",
                description="The link uses plain HTTP rather than HTTPS, so any data submitted to it would not be encrypted in transit.",
                evidence=parsed.hostname,
            )
        )

    return findings
