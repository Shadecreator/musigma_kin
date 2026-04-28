from fastapi import APIRouter, Depends, HTTPException

from backend.database import get_session_analysis, get_session_documents, insert_document, update_session_analysis
from backend.security import get_current_user, require_session_access
from backend.services.analysis_service import run_full_analysis

router = APIRouter()


def _normalize_analysis(synthesis: dict | None, patterns: dict | None) -> dict:
    synthesis = synthesis or {}
    patterns = patterns or {}

    def _clean_text(value: str | None) -> str | None:
        if not isinstance(value, str):
            return value
        return value.replace("–", "-").replace("—", "-")

    one_pager = synthesis.get("one_pager")
    if not one_pager:
        summary = synthesis.get("patient_summary") or synthesis.get("summary") or ""
        one_pager = {
            "title": "The One-Pager",
            "summary": _clean_text(summary) if summary else "Clinical summary is available after running analysis.",
        }
    elif isinstance(one_pager, dict):
        one_pager = {
            **one_pager,
            "summary": _clean_text(one_pager.get("summary")) or "Clinical summary is available after running analysis.",
        }

    patterns_detected = patterns.get("patterns_detected")
    if not patterns_detected:
        raw_patterns = patterns.get("patterns", []) if isinstance(patterns, dict) else []
        if isinstance(raw_patterns, list):
            patterns_detected = [
                item if isinstance(item, dict) else {"title": str(item)} for item in raw_patterns
            ]
        else:
            patterns_detected = []

    questions_to_ask = (
        synthesis.get("questions_to_ask")
        or synthesis.get("doctor_questions")
        or patterns.get("questions_to_ask")
        or []
    )

    return {
        "synthesis": synthesis,
        "patterns": patterns,
        "one_pager": one_pager,
        "patterns_detected": patterns_detected,
        "questions_to_ask": questions_to_ask,
        "doctor_mode": {
            "title": "Doctor Mode",
            "summary": "Private link - live Q&A from real patient data",
        },
    }


def seed_demo_session_data(session_id: str) -> dict:
    existing_docs = get_session_documents(session_id)
    existing_analysis = get_session_analysis(session_id)

    if existing_docs and existing_analysis and (existing_analysis.get("synthesis") or existing_analysis.get("patterns")):
        return {
            "seeded": False,
            "message": "Session already has data; skipping demo seed.",
            **_normalize_analysis(existing_analysis.get("synthesis"), existing_analysis.get("patterns")),
        }

    appointment_text = (
        "Patient: Sara M. Follow-up for cognition, sleep quality, and blood pressure trend. "
        "Family reports intermittent evening confusion in the last 3 weeks."
    )
    meds_json = {
        "medications": [
            {"name": "Lisinopril", "dose": "10 mg", "schedule": "morning"},
            {"name": "Melatonin", "dose": "3 mg", "schedule": "night"},
        ],
        "allergies": ["Penicillin"],
    }
    wearable_summary = {
        "period": "Jan-Apr 2026",
        "overall": {"sleep_hours": 6.2, "hrv_ms": 31.0, "steps": 5400, "resting_hr_bpm": 71.0},
        "early_30d": {"sleep_hours": 6.9, "hrv_ms": 37.0, "steps": 6800, "nighttime_wakeups": 1.2},
        "late_30d": {"sleep_hours": 5.8, "hrv_ms": 28.0, "steps": 4300, "nighttime_wakeups": 2.3},
        "hrv_change_pct": -24.3,
        "steps_change_pct": -36.8,
        "med_missed_count": 4,
        "bad_nights": [
            {"date": "2026-03-28", "note": "low sleep, high awakenings"},
            {"date": "2026-04-02", "note": "reported confusion next morning"},
        ],
    }

    insert_document(session_id, "appointment_context.txt", "text/plain", {"text": appointment_text})
    insert_document(session_id, "medications.json", "application/json", meds_json)
    insert_document(session_id, "fitbit_export_jan_apr_2026.csv", "text/csv", {"trends": wearable_summary})

    synthesis = {
        "one_pager": {
            "title": "The One-Pager",
            "summary": "Conditions, meds, BP trend - doctor-ready in 30 sec",
        },
        "patient_summary": "Sleep and HRV declined over 8 weeks, with intermittent evening confusion and reduced daily activity.",
        "questions_to_ask": [
            "Do confusion episodes follow poor sleep nights or missed evening medication?",
            "Any recent hydration, infection, or stress changes before symptom spikes?",
            "Has home BP trend shifted during weeks with lower HRV and activity?",
        ],
    }
    patterns = {
        "patterns_detected": [
            {
                "title": "Sleep-confusion correlation",
                "detail": "Confusion reports cluster after nights with <6h sleep and >2 awakenings.",
            },
            {
                "title": "HRV decline",
                "detail": "HRV dropped ~24% from early to late period.",
            },
            {
                "title": "Activity drop",
                "detail": "Daily steps dropped ~37% in the latest 30-day window.",
            },
        ]
    }

    update_session_analysis(session_id, synthesis=synthesis, patterns=patterns)
    return {
        "seeded": True,
        "message": "Demo data added to session.",
        **_normalize_analysis(synthesis, patterns),
    }


@router.post("/session/{session_id}/analyze")
async def analyze_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    Trigger the AI analysis (Synthesis and Patterns) for a session.
    """
    require_session_access(session_id, current_user)
    result = run_full_analysis(session_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return _normalize_analysis(result.get("synthesis"), result.get("patterns"))


@router.get("/session/{session_id}/analysis")
async def get_analysis(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieve previously generated analysis for a session.
    """
    require_session_access(session_id, current_user)
    analysis = get_session_analysis(session_id)
    if not analysis or (not analysis["synthesis"] and not analysis["patterns"]):
        raise HTTPException(status_code=404, detail="Analysis not found. Run /analyze first.")
    return _normalize_analysis(analysis.get("synthesis"), analysis.get("patterns"))


@router.post("/session/{session_id}/seed-demo")
async def seed_demo_data(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    Seed a session with deterministic dummy data for a test account demo.
    """
    require_session_access(session_id, current_user)
    return seed_demo_session_data(session_id)
