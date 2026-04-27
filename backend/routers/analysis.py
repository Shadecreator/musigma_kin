from fastapi import APIRouter, HTTPException
from backend.services.analysis_service import run_full_analysis
from backend.database import get_session_analysis

router = APIRouter()

@router.post("/session/{session_id}/analyze")
async def analyze_session(session_id: str):
    """
    Trigger the AI analysis (Synthesis and Patterns) for a session.
    """
    result = run_full_analysis(session_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/session/{session_id}/analysis")
async def get_analysis(session_id: str):
    """
    Retrieve previously generated analysis for a session.
    """
    analysis = get_session_analysis(session_id)
    if not analysis or (not analysis["synthesis"] and not analysis["patterns"]):
        raise HTTPException(status_code=404, detail="Analysis not found. Run /analyze first.")
    return analysis
