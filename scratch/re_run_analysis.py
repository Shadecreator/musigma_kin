import os
import sys

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.analysis_service import run_full_analysis

session_id = "a228c937-fe0c-4d1e-8b14-d4c61a1acb25"

print(f"Running full analysis for session {session_id}...")
result = run_full_analysis(session_id)
print("Analysis complete.")
print(f"Synthesis Summary: {result['synthesis'].get('patient_summary')[:200]}...")
