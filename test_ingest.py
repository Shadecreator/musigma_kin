from fastapi.testclient import TestClient
from backend.main import app
import json

def run_tests():
    with TestClient(app) as client:
        # Test hello world
        response = client.get("/")
        print("GET / :", response.json())
        
        # Test session creation
        response = client.post("/session")
        session_id = response.json().get("session_id")
        print("POST /session : created", session_id)
        
        # Test ingest text/plain
        files = [
            ("files", ("test.txt", b"Hello World text", "text/plain"))
        ]
        data = {"session_id": session_id}
        response = client.post("/ingest", data=data, files=files)
        print("POST /ingest (text) :", response.json())
        
        # Test ingest text/csv
        csv_content = b"date,sleep_hrs,resting_hr,hrv,steps\\n2023-01-01,7.5,62,45,10000\\n2023-01-02,6.0,65,40,8000"
        files = [
            ("files", ("data.csv", csv_content, "text/csv"))
        ]
        response = client.post("/ingest", data=data, files=files)
        print("POST /ingest (csv) :", response.json())
        
        # Test ingest application/json
        json_content = json.dumps({"medication": "Aspirin"}).encode("utf-8")
        files = [
            ("files", ("meds.json", json_content, "application/json"))
        ]
        response = client.post("/ingest", data=data, files=files)
        print("POST /ingest (json) :", response.json())
        
        # Test getting session docs
        response = client.get(f"/session/{session_id}")
        print(f"GET /session/{session_id} :")
        docs = response.json().get("documents", [])
        for doc in docs:
            print(f"  - {doc['filename']} ({doc['file_type']})")

if __name__ == "__main__":
    run_tests()
