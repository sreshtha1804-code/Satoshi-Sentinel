from fastapi import APIRouter, HTTPException

from app.models import db
from app.schemas.analyze import AnalysisResponse, AnalyzeRequest, TypedAnalyzeRequest
from app.services.security import check_content
from app.services.signal_engine import analyze_input
from app.services.scoring import score_to_level

router = APIRouter()


def _run_and_store(input_type: str, content: str) -> dict:
    # The security gate is the very first thing that runs on any submitted
    # content, before the signal engine ever sees it.
    check = check_content(content)
    if check.is_blocked:
        raise HTTPException(status_code=400, detail=check.reason)

    analysis = analyze_input(input_type, content)
    record_id = db.save_analysis(analysis)
    return {
        "id": record_id,
        "level": score_to_level(analysis["local_score"]),
        **analysis,
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(body: AnalyzeRequest):
    return _run_and_store(body.type, body.content)


@router.post("/analyze/message", response_model=AnalysisResponse)
async def analyze_message(body: TypedAnalyzeRequest):
    return _run_and_store("message", body.content)


@router.post("/analyze/address", response_model=AnalysisResponse)
async def analyze_address(body: TypedAnalyzeRequest):
    return _run_and_store("address", body.content)


@router.post("/analyze/nostr", response_model=AnalysisResponse)
async def analyze_nostr(body: TypedAnalyzeRequest):
    return _run_and_store("nostr", body.content)
