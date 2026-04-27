import os
import sys
import json
import base64

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import insert_document, create_session, get_session_documents
from backend.services.claude_client import extract_pdf_vision
from backend.services.csv_parser import parse_fitbit_csv
from backend.services.analysis_service import run_full_analysis

SESSION_ID = "a228c937-fe0c-4d1e-8b14-d4c61a1acb25"
PAWAN_DIR = "sample_data/pawan"

def ingest_direct(file_path, file_type):
    filename = os.path.basename(file_path)
    print(f"Ingesting {filename} ({file_type})...")
    
    with open(file_path, "rb") as f:
        content = f.read()
    
    parsed_content = None
    if file_type == "application/pdf":
        base64_pdf = base64.b64encode(content).decode("utf-8")
        parsed_content = {"extracted_text": extract_pdf_vision(base64_pdf, media_type=file_type)}
    elif file_type == "text/csv":
        parsed_content = parse_fitbit_csv(content)
    elif file_type == "application/json":
        parsed_content = json.loads(content.decode("utf-8"))
    elif file_type == "text/plain":
        parsed_content = {"text": content.decode("utf-8")}
    
    insert_document(SESSION_ID, filename, file_type, parsed_content)

def main():
    # Ingest missing non-PDF files first
    ingest_direct(os.path.join(PAWAN_DIR, "appointment_context.txt"), "text/plain")
    ingest_direct(os.path.join(PAWAN_DIR, "fitbit_export_jan_apr_2026.csv"), "text/csv")
    ingest_direct(os.path.join(PAWAN_DIR, "medications.json"), "application/json")
    ingest_direct(os.path.join(PAWAN_DIR, "symptom_log.txt"), "text/plain")
    
    # We already have PDFs, but let's ensure they are clean (we removed duplicates earlier)
    
    print("Running analysis...")
    run_full_analysis(SESSION_ID)
    print("Done.")

if __name__ == "__main__":
    main()
