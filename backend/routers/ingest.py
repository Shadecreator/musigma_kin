from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List
import base64
import json

from backend.database import insert_document, get_session_documents
from backend.services.claude_client import extract_pdf_vision
from backend.services.csv_parser import parse_fitbit_csv

router = APIRouter()

@router.post("/ingest")
async def ingest_documents(
    session_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Accepts PDFs, CSV, JSON, text and stores them in SQLite.
    PDFs go to Claude Vision, CSVs to pandas, JSON/Text are parsed directly.
    """
    results = []
    
    for file in files:
        content = await file.read()
        file_type = file.content_type
        filename = file.filename
        
        parsed_content = None
        
        if file_type == "application/pdf":
            # Convert to base64 for Claude Vision
            base64_pdf = base64.b64encode(content).decode("utf-8")
            extracted_text = extract_pdf_vision(base64_pdf, media_type=file_type)
            parsed_content = {"extracted_text": extracted_text}
            
        elif file_type == "text/csv":
            parsed_content = parse_fitbit_csv(content)
            
        elif file_type == "application/json":
            try:
                parsed_content = json.loads(content.decode("utf-8"))
            except json.JSONDecodeError:
                parsed_content = {"error": "Invalid JSON file"}
                
        elif file_type == "text/plain":
            parsed_content = {"text": content.decode("utf-8")}
            
        else:
            # Fallback for unknown text-like files
            try:
                parsed_content = {"text": content.decode("utf-8")}
            except Exception:
                parsed_content = {"error": f"Unsupported file type: {file_type}"}
                
        # Insert to DB
        doc_id = insert_document(session_id, filename, file_type, parsed_content)
        results.append({
            "id": doc_id,
            "filename": filename,
            "status": "success",
            "type": file_type
        })
        
    return {"session_id": session_id, "ingested": results}

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Return all ingested content for a session."""
    docs = get_session_documents(session_id)
    if not docs:
        raise HTTPException(status_code=404, detail="Session not found or empty")
    return {"session_id": session_id, "documents": docs}
