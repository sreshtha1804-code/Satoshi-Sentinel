from typing import Literal

from pydantic import BaseModel

from app.schemas.analyze import Finding


class AiExplainRequest(BaseModel):
    input_type: str
    local_score: int
    findings: list[Finding]


class AiExplainResponse(BaseModel):
    explanation: str
    source: Literal["local_template", "model"]
