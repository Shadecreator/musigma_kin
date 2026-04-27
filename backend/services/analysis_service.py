import os
import json
from backend.database import get_session_documents, update_session_analysis, get_session_analysis
from backend.services.claude_client import call_claude_json

PROMPT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

def load_prompt(filename: str) -> str:
    path = os.path.join(PROMPT_DIR, filename)
    with open(path, "r") as f:
        return f.read()

def run_full_analysis(session_id: str):
    """
    1. Fetch all documents for the session.
    2. Format the data for the prompts.
    3. Call Claude for Synthesis.
    4. Call Claude for Patterns.
    5. Save to DB.
    """
    docs = get_session_documents(session_id)
    if not docs:
        return {"error": "No documents found for this session."}

    # Aggregate context
    pdf_text = ""
    csv_trends = None
    meds = None
    symptoms = ""
    appointment = ""

    for doc in docs:
        filename = doc["filename"].lower()
        content = doc["content"]

        if doc["file_type"] == "application/pdf":
            extracted = content.get("extracted_text", "")
            pdf_text += f"\n--- DOCUMENT: {doc['filename']} ---\n{extracted}\n"
        
        elif doc["file_type"] == "text/csv":
            # We take the trends from the first CSV found (usually fitbit)
            if "trends" in content:
                csv_trends = content["trends"]
        
        elif doc["file_type"] == "application/json":
            if "medication" in filename or "meds" in filename:
                meds = content
        
        elif doc["file_type"] == "text/plain":
            if "symptom" in filename:
                symptoms += content.get("text", "")
            elif "appointment" in filename:
                appointment += content.get("text", "")
            else:
                # General text docs
                pdf_text += f"\n--- DOCUMENT: {doc['filename']} ---\n{content.get('text', '')}\n"

    # 1. Run Synthesis
    synthesis_prompt_template = load_prompt("synthesis_prompt.txt")
    
    # Format Wearable Summary
    wearable_summary = "No wearable data available."
    if csv_trends:
        t = csv_trends
        wearable_summary = f"""Period: {t['period']}
Average sleep: {t['overall'].get('sleep_hours', 0):.1f}h/night
Early 30-day sleep avg: {t['early_30d'].get('sleep_hours', 0):.1f}h  |  Late 30-day sleep avg: {t['late_30d'].get('sleep_hours', 0):.1f}h
Average HRV: {t['overall'].get('hrv_ms', 0):.1f}ms
Early 30-day HRV avg: {t['early_30d'].get('hrv_ms', 0):.1f}ms  |  Late 30-day HRV avg: {t['late_30d'].get('hrv_ms', 0):.1f}ms  |  Change: {t['hrv_change_pct']:.1f}%
Average resting HR: {t['overall'].get('resting_hr_bpm', 0):.1f}bpm
Average steps/day: {t['overall'].get('steps', 0):.0f}
Early 30-day steps avg: {t['early_30d'].get('steps', 0):.0f}  |  Late 30-day steps avg: {t['late_30d'].get('steps', 0):.0f}  |  Change: {t['steps_change_pct']:.1f}%
Average active minutes: {t['overall'].get('active_minutes', 0):.1f}
Nighttime wakeups trend: early avg {t['early_30d'].get('nighttime_wakeups', 0):.1f}/night  |  late avg {t['late_30d'].get('nighttime_wakeups', 0):.1f}/night
Medication missed (evening): {t['med_missed_count']} days
Flagged bad nights: {", ".join([n['date'] for n in t['bad_nights']])}
"""

    # Split System Prompt and Context instructions
    # Note: Our synthesis_prompt.txt has both system and user instructions in one file.
    # We will pass the whole thing as user message for simplicity in this hackathon, 
    # or split if we want to be more formal.
    
    context_block = f"""
=== MEDICAL DOCUMENTS ===
{pdf_text}

=== MEDICATIONS ===
{json.dumps(meds, indent=2) if meds else "No medication data."}

=== WEARABLE DATA SUMMARY ===
{wearable_summary}

=== SYMPTOM LOG ===
{symptoms if symptoms else "No symptom log."}

=== APPOINTMENT CONTEXT ===
{appointment if appointment else "No appointment context."}
"""

    # Call Claude for Synthesis
    # We use the text after "SYSTEM PROMPT:" as system message and the rest as User message
    full_text = synthesis_prompt_template
    system_part = full_text.split("CONTEXT BLOCK FORMAT :")[0]
    user_part = "CONTEXT BLOCK:\n" + context_block + "\n\nINSTRUCTIONS:\n" + full_text.split("=== INSTRUCTIONS ===")[1]
    
    synthesis_result = call_claude_json(user_part, system_message=system_part)

    # 2. Run Patterns
    pattern_prompt_template = load_prompt("pattern_prompt.txt")
    system_part_p = pattern_prompt_template.split("CONTEXT BLOCK :")[0]
    
    # We'll just send the summary and bad nights for the pattern block to save tokens, 
    # OR we could send the full CSV as requested. For now, let's follow the CSV parser's trends.
    pattern_context = f"""
=== WEARABLE SUMMARY ===
{wearable_summary}

=== SYMPTOM LOG ===
{symptoms}

=== KNOWN BAD NIGHTS ===
{json.dumps(csv_trends['bad_nights'], indent=2) if csv_trends else "[]"}
"""
    user_part_p = "CONTEXT BLOCK:\n" + pattern_context + "\n\nINSTRUCTIONS:\n" + pattern_prompt_template.split("=== INSTRUCTIONS ===")[1]
    
    patterns_result = call_claude_json(user_part_p, system_message=system_part_p)

    # Save to DB
    update_session_analysis(session_id, synthesis=synthesis_result, patterns=patterns_result)

    return {
        "synthesis": synthesis_result,
        "patterns": patterns_result
    }
