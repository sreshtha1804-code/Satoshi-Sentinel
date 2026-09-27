"""
Security gate applied to every analyze endpoint before any other
processing runs. This is deliberately conservative: it is a defensive
filter against a user (or an attacker convincing a user) pasting real
secret material into the analyzer, not a signal-detection feature.

Two independent checks:

1. WIF-formatted private keys — a very distinctive prefix + length + base58
   charset, so this check is precise.
2. BIP-39-shaped seed phrases — 12 or 24 space-separated lowercase
   alphabetic words with no punctuation or digits. This is a *structural*
   heuristic, not a check against the real 2048-word BIP-39 wordlist (that
   exact list isn't reproduced here), so it is intentionally a little
   over-inclusive: it's far safer to occasionally block ordinary prose that
   happens to have this shape than to ever let a real recovery phrase
   through.

Nothing here logs, stores, or echoes back the matched content itself.
"""

import re
from dataclasses import dataclass

_WIF_PATTERN = re.compile(r"^[5KLc9][1-9A-HJ-NP-Za-km-z]{50,52}$")
_HEX64_WITH_KEY_CONTEXT = re.compile(
    r"\b(private\s*key|priv\s*key|wif)\b[^\n]{0,20}\b([0-9a-fA-F]{64})\b", re.IGNORECASE
)
_WORD_TOKEN = re.compile(r"^[a-z]{3,8}$")


@dataclass(frozen=True)
class SecurityCheckResult:
    is_blocked: bool
    reason: str | None = None


def _looks_like_wif_key(text: str) -> bool:
    for token in re.split(r"\s+", text.strip()):
        if _WIF_PATTERN.match(token):
            return True
    return False


def _looks_like_labeled_private_key(text: str) -> bool:
    return bool(_HEX64_WITH_KEY_CONTEXT.search(text))


def _line_matches_seed_shape(line: str) -> bool:
    """Does this single line, on its own, have the shape of a 12/24-word
    seed phrase? No punctuation, exact word count, short lowercase tokens."""
    if re.search(r"[.,!?;:\"']", line):
        return False
    tokens = [t for t in re.split(r"\s+", line.strip()) if t]
    if len(tokens) not in (12, 24):
        return False
    return all(_WORD_TOKEN.match(t) and t.islower() for t in tokens)


def _looks_like_seed_phrase(text: str) -> bool:
    """
    Structural check: a contiguous run of 12 or 24 short, purely-alphabetic,
    lowercase, space-separated tokens with no other punctuation, which is
    the shape (not the exact wordlist) of a BIP-39 mnemonic. Checked both
    against the whole input and line-by-line, so a seed phrase sitting on
    its own line inside a longer punctuated message is still caught.
    """
    if _line_matches_seed_shape(text):
        return True
    lines = text.splitlines()
    if len(lines) > 1:
        return any(_line_matches_seed_shape(line) for line in lines)
    return False


def check_content(text: str) -> SecurityCheckResult:
    """
    Run all key-material checks against a piece of user-submitted content.
    Returns a result indicating whether the content should be rejected.
    """
    if not text:
        return SecurityCheckResult(is_blocked=False)

    if _looks_like_wif_key(text):
        return SecurityCheckResult(
            is_blocked=True,
            reason="Input appears to contain a private key (WIF format). Sentinel never processes or stores private keys.",
        )

    if _looks_like_labeled_private_key(text):
        return SecurityCheckResult(
            is_blocked=True,
            reason="Input appears to contain a labeled private key. Sentinel never processes or stores private keys.",
        )

    if _looks_like_seed_phrase(text):
        return SecurityCheckResult(
            is_blocked=True,
            reason="Input appears to contain a 12- or 24-word seed phrase. Sentinel never processes or stores recovery phrases.",
        )

    return SecurityCheckResult(is_blocked=False)
