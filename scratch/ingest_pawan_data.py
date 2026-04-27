import os
import requests
import json

BASE_URL = "http://localhost:8000"
SESSION_ID = "a228c937-fe0c-4d1e-8b14-d4c61a1acb25"
PAWAN_DIR = "sample_data/pawan"

def ingest_all():
    files_to_upload = []
    
    # 1. Root files
    for filename in os.listdir(PAWAN_DIR):
        file_path = os.path.join(PAWAN_DIR, filename)
        if os.path.isfile(file_path):
            # Map extensions to MIME types
            mime = "text/plain"
            if filename.endswith(".csv"): mime = "text/csv"
            elif filename.endswith(".json"): mime = "application/json"
            elif filename.endswith(".pdf"): mime = "application/pdf"
            
            files_to_upload.append(("files", (filename, open(file_path, "rb"), mime)))

    # 2. PDF sub-dir
    pdf_dir = os.path.join(PAWAN_DIR, "pdfs")
    for filename in os.listdir(pdf_dir):
        file_path = os.path.join(pdf_dir, filename)
        files_to_upload.append(("files", (filename, open(file_path, "rb"), "application/pdf")))

    print(f"Uploading {len(files_to_upload)} files to session {SESSION_ID}...")
    
    data = {"session_id": SESSION_ID}
    response = requests.post(f"{BASE_URL}/ingest", data=data, files=files_to_upload)
    
    if response.status_code == 200:
        print("Ingestion successful.")
    else:
        print(f"Ingestion failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    # Ensure server is running or call services directly
    # Since uvicorn is running, I'll use requests.
    ingest_all()
