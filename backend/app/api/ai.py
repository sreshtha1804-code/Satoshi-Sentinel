from fastapi import APIRouter

from app.schemas.ai import AiExplainRequest, AiExplainResponse
from app.services.ai_explain import build_explanation

router = APIRouter()


@router.post("/ai/explain", response_model=AiExplainResponse)
async def explain(body: AiExplainRequest):
    findings = [f.model_dump() for f in body.findings]
    return await build_explanation(body.input_type, body.local_score, findings)
