"""
Deterministic scoring: the same input always produces the same score,
because the score is purely a function of the severities of the findings
this run produced. No randomness, no external lookups.
"""

from app.services.findings import Finding

SEVERITY_WEIGHT = {
    "high": 30,
    "medium": 15,
    "low": 6,
}


def compute_local_score(findings: list[Finding]) -> int:
    if not findings:
        return 0
    total = sum(SEVERITY_WEIGHT.get(f["severity"], 0) for f in findings)
    return max(0, min(100, total))


def score_to_level(score: int) -> str:
    """0-29 LOW, 30-54 MEDIUM, 55-100 HIGH — matches the frontend's bands."""
    if score >= 55:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"
