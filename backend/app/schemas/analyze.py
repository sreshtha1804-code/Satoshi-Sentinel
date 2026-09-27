"""
Request/response schemas for /api/analyze and its per-type variants.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

InputType = Literal["message", "address", "nostr", "url"]
Severity = Literal["low", "medium", "high"]


class AnalyzeRequest(BaseModel):
    type: InputType
    content: str = Field(..., min_length=0, max_length=8000)


class TypedAnalyzeRequest(BaseModel):
    """Used by the per-type convenience endpoints, where the type is
    already implied by the URL path."""
    content: str = Field(..., min_length=0, max_length=8000)


class Finding(BaseModel):
    type: str
    severity: Severity
    title: str
    description: str
    evidence: str


class ExtractedData(BaseModel):
    bitcoin_addresses: list[str] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    nostr_pubkeys: list[str] = Field(default_factory=list)


class AnalysisMeta(BaseModel):
    analyzed_at: str
    raw_input_preview: str


class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    input_type: InputType
    signals: list[str]
    extracted: ExtractedData
    local_score: int
    level: Literal["LOW", "MEDIUM", "HIGH"]
    findings: list[Finding]
    meta: AnalysisMeta


class ErrorResponse(BaseModel):
    error: str
    detail: str
