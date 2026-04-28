import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_session_documents, get_session_analysis
from backend.services.claude_client import call_claude_json, client, is_valid_key_format

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/session/{session_id}/chat")
async def doctor_chat(session_id: str, request: ChatRequest):
    """
    Doctor Mode — answer a specific question using the patient's
    ingested data and previously generated brief.
    """

    # 1. Get all ingested documents for this session
    session_docs = get_session_documents(session_id)
    if not session_docs:
        raise HTTPException(status_code=404, detail="Session not found or no documents ingested.")

    # 2. Get the previously generated analysis (brief + patterns)
    analysis = get_session_analysis(session_id)

    # 3. Build context string from all ingested documents
    doc_context = ""
    for doc in session_docs:
        doc_context += f"\n--- {doc.get('filename', 'unknown')} ---\n"
        # DB stores parsed content in the `content` field
        content = doc.get('content')
        if isinstance(content, dict) or isinstance(content, list):
            try:
                doc_context += json.dumps(content, indent=2)
            except Exception:
                doc_context += str(content)
        else:
            doc_context += str(content or '')
        doc_context += "\n"

    # 4. Build the prompt
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

    # 5. Call Claude — plain text response not JSON
    api_key = os.environ.get("ANTHROPIC_API_KEY", "placeholder")

    if not is_valid_key_format(api_key):
        return {
            "question": request.question,
            "answer": "Mock answer: Add a valid Anthropic API key to enable doctor mode.",
            "session_id": session_id
        }

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system="You are a medical data assistant answering a doctor's question about a specific patient. Be specific. Cite sources. Never diagnose. Answer in plain English, not JSON.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        # Anthropic response structure: content is a list of chunks
        answer = ""
        try:
            answer = response.content[0].text.strip()
        except Exception:
            # Fallback to string representation
            answer = str(response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude call failed: {str(e)}")

    return {
        "question": request.question,
        "answer": answer,
        "session_id": session_id
    }
