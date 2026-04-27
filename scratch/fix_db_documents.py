import sqlite3
import json
import base64
import os
import sys

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.claude_client import extract_pdf_vision

DB_PATH = "kin.db"
PDF_DIR = "sample_data/pawan/pdfs"

def fix_documents():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Find documents with errors or octet-stream
    cursor.execute("SELECT id, filename, session_id FROM documents WHERE file_type = 'application/octet-stream' AND filename LIKE '%.pdf'")
    rows = cursor.fetchall()
    
    print(f"Found {len(rows)} documents to fix.")
    
    for doc_id, filename, session_id in rows:
        print(f"Fixing {filename}...")
        
        # We need the actual file content. 
        # Since the DB only stored the error message in 'content', we have to read the file from disk if available.
        # Luckily we know where the sample data is.
        file_path = os.path.join(PDF_DIR, filename)
        if not os.path.exists(file_path):
            print(f"  File not found at {file_path}, skipping.")
            continue
            
        with open(file_path, "rb") as f:
            content = f.read()
            
        base64_pdf = base64.b64encode(content).decode("utf-8")
        try:
            print(f"  Extracting text via Claude Vision...")
            extracted_text = extract_pdf_vision(base64_pdf, media_type="application/pdf")
            parsed_content = {"extracted_text": extracted_text}
            
            cursor.execute(
                "UPDATE documents SET file_type = ?, content = ? WHERE id = ?",
                ("application/pdf", json.dumps(parsed_content), doc_id)
            )
            print(f"  Success.")
        except Exception as e:
            print(f"  Failed: {str(e)}")
            
    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    fix_documents()
