"""
Generates a plain-language explanation of an analysis result.

The default and always-available path is a deterministic local template
built from the findings themselves — no AI call, no API key, no network
request. This is what runs whenever no AI key is configured, and it is
also what a hackathon demo relies on so it never breaks if a model API is
unavailable.

If AI_EXPLAIN_ENABLED=true and ANTHROPIC_API_KEY is set, this module will
attempt a single, tightly-timed model call to turn the same structured
findings into a more natural explanation — never raw user input, only the
already-computed evidence. Any failure at all (missing key, timeout,
network error, malformed response) falls straight back to the local
template. The endpoint's behavior and response shape are identical either
way; only the `source` field differs.
"""

import httpx

from app.core.config import settings
from app.services.findings import Finding
from app.services.scoring import score_to_level


def _score_band(score: int) -> str:
    return f"{score_to_level(score)} ATTENTION"


def _local_template_explanation(input_type: str, local_score: int, findings: list[Finding]) -> str:
    if not findings:
        return (
            "No local heuristic signals were found for this input. This is not a guarantee of "
            "safety — it means none of Sentinel's current pattern checks matched, not that the "
            "content has been independently verified."
        )

    band = _score_band(local_score)
    high = [f for f in findings if f["severity"] == "high"]
    medium = [f for f in findings if f["severity"] == "medium"]

    lead = (
        f"This {input_type} scored in the {band} range ({local_score}/100) based on "
        f"{len(findings)} local finding{'s' if len(findings) != 1 else ''}."
    )

    parts = [lead]

    if high:
        titles = ", ".join(f["title"].lower() for f in high[:3])
        parts.append(
            f"The most significant signals were: {titles}. These are patterns commonly associated "
            "with high-risk requests, not confirmation of intent — treat them as reasons to slow down "
            "and verify independently, not as a verdict."
        )
    if medium:
        titles = ", ".join(f["title"].lower() for f in medium[:3])
        parts.append(f"Additional supporting signals included: {titles}.")

    parts.append(
        "This score is a signal, not proof of fraud. Evidence and interpretation are kept separate "
        "throughout: the findings above describe what was observed; this explanation is Sentinel's "
        "local, template-based reading of that evidence."
    )

    return " ".join(parts)


async def _model_explanation(input_type: str, local_score: int, findings: list[Finding]) -> str | None:
    """
    Best-effort model-backed explanation. Returns None on any failure so
    the caller falls back to the local template — this must never raise.
    """
    if not settings.ai_explain_enabled or not settings.anthropic_api_key:
        return None

    evidence_lines = "\n".join(
        f"- [{f['severity']}] {f['title']}: {f['description']} (observed: {f['evidence']})" for f in findings
    )
    prompt = (
        f"You are explaining a local heuristic security analysis of a {input_type} to a non-technical "
        f"user. The local score is {local_score}/100. Structured findings (evidence, not conclusions):\n\n"
        f"{evidence_lines}\n\n"
        "Write 3-4 sentences in plain language. Separate observed evidence from interpretation. "
        "Never state that this is confirmed fraud or confirmed safe — this is a signal, not proof."
    )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
        resp.raise_for_status()
        data = resp.json()
        blocks = data.get("content", [])
        text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        return text.strip() or None
    except Exception:
        return None


async def build_explanation(input_type: str, local_score: int, findings: list[Finding]) -> dict:
    model_text = await _model_explanation(input_type, local_score, findings)
    if model_text:
        return {"explanation": model_text, "source": "model"}
    return {"explanation": _local_template_explanation(input_type, local_score, findings), "source": "local_template"}
