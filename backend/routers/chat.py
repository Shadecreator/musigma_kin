import json
import os
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.database import get_session_analysis, get_session_documents
from backend.security import get_current_user, require_session_access
from backend.services.claude_client import client, is_valid_key_format

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


def _extract_sources(answer: str) -> list[str]:
    matches = re.findall(r"\[Source:\s*([^\]]+)\]", answer or "")
    unique = []
    for source in matches:
        source = source.strip()
        if source and source not in unique:
            unique.append(source)
    return unique


@router.post("/session/{session_id}/chat")
async def doctor_chat(
    session_id: str,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Doctor Mode — answer a specific question using the patient's
    ingested data and previously generated brief.
    """

    require_session_access(session_id, current_user)
    session_docs = get_session_documents(session_id)
    if not session_docs:
        raise HTTPException(status_code=404, detail="Session not found or no documents ingested.")

    analysis = get_session_analysis(session_id)

    doc_context = ""
    for doc in session_docs:
        doc_context += f"\n--- {doc.get('filename', 'unknown')} ---\n"
        content = doc.get("content")
        if isinstance(content, (dict, list)):
            try:
                doc_context += json.dumps(content, indent=2)
            except Exception:
                doc_context += str(content)
        else:
            doc_context += str(content or "")
        doc_context += "\n"

    prompt = f"""
You are answering a doctor's question about a specific patient during a clinical appointment.

RULES:
1. Use ONLY the data provided below. Do not infer or guess.
2. Cite the source for every factual claim using [Source: filename].
3. Be specific — use exact numbers, dates, and values from the data.
4. Never diagnose. Never recommend treatment.
5. If the data does not contain the answer, say exactly: "This information is not available in the uploaded patient data."
6. Keep your answer under 150 words. Be direct.

=== INGESTED PATIENT DOCUMENTS ===
{doc_context[:6000]}

=== PREVIOUSLY GENERATED BRIEF ===
{json.dumps(analysis, indent=2)[:3000] if analysis else "Brief not yet generated."}

=== DOCTOR'S QUESTION ===
{request.question}

Answer the question now. Start directly with the answer. Cite every fact.
Return plain text — NOT JSON.
"""

    api_key = os.environ.get("ANTHROPIC_API_KEY", "placeholder")

    if not is_valid_key_format(api_key):
        source_files = [doc.get("filename", "unknown") for doc in session_docs[:3]]
        citation_text = " ".join([f"[Source: {name}]" for name in source_files])
        one_pager = (analysis or {}).get("synthesis", {}).get("one_pager", {})
        one_pager_summary = one_pager.get("summary") if isinstance(one_pager, dict) else None
        answer = (
            f"Based on the uploaded records, the key concern is a combined sleep decline, HRV decline, "
            f"and reduced activity over recent weeks. {citation_text}"
        )
        if one_pager_summary:
            answer = f"{one_pager_summary}. {citation_text}"

        return {
            "question": request.question,
            "answer": answer,
            "citations": source_files,
            "session_id": session_id,
            "mode": "mock",
        }

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system="You are a medical data assistant answering a doctor's question about a specific patient. Be specific. Cite sources. Never diagnose. Answer in plain English, not JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
        answer = ""
        try:
            answer = response.content[0].text.strip()
        except Exception:
            answer = str(response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude call failed: {str(e)}")

    return {
        "question": request.question,
        "answer": answer,
        "citations": _extract_sources(answer),
        "session_id": session_id,
        "mode": "live",
    }
