# Builder 1 Backend Documentation

This document outlines the architecture, setup instructions, and integration details for the Kin backend (Phase 1 & 2), built by Builder 1.

## Architecture Overview

The backend is built with **FastAPI** and uses a local **SQLite** database (`kin.db`) for session and document storage. It provides a robust ingestion pipeline capable of parsing:
- **PDFs**: Routed to Claude Vision for structured text extraction.
- **CSV files**: Routed to Pandas for computing statistical summaries and trends (e.g., Fitbit data).
- **JSON / Text files**: Parsed natively and stored directly.

The system is designed with a Session-based architecture. A caregiver creates a session, uploads a bundle of files which are ingested and analyzed, and then the structured data can be retrieved by the frontend to generate the medical brief.

## Setup Instructions

### 1. Install Dependencies
Ensure you have Python 3.11+ installed. Open your terminal in the root directory (`musigma_kin/`) and install the required packages:

```bash
pip install -r backend/requirements.txt
```

*(Note: We upgraded `numpy` to version `>=2.1` to ensure compatibility with Python 3.13 on Windows).*

### 2. Environment Variables
In the `backend/` directory, there is a `.env` file. You need to configure your Anthropic API key here to enable Claude integrations:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

*(If this is left as a placeholder, the system will mock the Claude vision extraction to prevent crashes).*

### 3. Run the Server
To start the FastAPI development server, run the following command from the root directory:

```bash
uvicorn backend.main:app --reload
```

The server will start on `http://localhost:8000`.

## API Endpoints

You can view the interactive Swagger UI documentation by navigating to `http://localhost:8000/docs` in your browser.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/` | Health check endpoint. Returns `{"status": "ok"}`. |
| `POST` | `/session` | Creates a new session and returns a `session_id` (UUID). |
| `POST` | `/ingest` | Accepts a `session_id` (form data) and multiple `UploadFile` objects. Processes them through Pandas or Claude Vision based on MIME type, stores them in SQLite, and returns success statuses. |
| `GET`  | `/session/{session_id}` | Retrieves all processed documents, structured content, and text attached to a given session ID. |
| `POST` | `/session/{session_id}/analyze` | Triggers the AI analysis pipeline (Synthesis and Pattern Detection). Aggregates all documents and wearable data to generate the medical brief. |
| `GET`  | `/session/{session_id}/analysis` | Retrieves the previously generated synthesis and patterns for the session. |

## AI Analysis Pipeline

The backend includes a sophisticated analysis engine that:
1.  **Calculates Trends**: The CSV parser automatically computes "Early 30-day" vs "Late 30-day" trends for HRV, sleep, and activity.
2.  **Synthesizes Briefs**: Uses Claude to aggregate extracted text, CSV trends, medications, and symptom logs into a structured medical brief.
3.  **Detects Patterns**: Identifies non-obvious correlations (e.g., relationship between missed medications and sleep quality).

## Connecting from the Frontend (Builder 2)

**CORS** has been fully configured to accept cross-origin requests.

### Example: Running Analysis
```javascript
const response = await fetch(`http://localhost:8000/session/${currentSessionId}/analyze`, {
    method: 'POST'
});
const analysis = await response.json();
console.log("Medical Brief:", analysis.synthesis);
console.log("Patterns:", analysis.patterns);
```

### Example: Uploading Files (Drag & Drop)
```javascript
const formData = new FormData();
formData.append('session_id', currentSessionId);
files.forEach(file => formData.append('files', file));

const response = await fetch('http://localhost:8000/ingest', {
    method: 'POST',
    body: formData
});
const result = await response.json();
console.log("Ingested files:", result);
```

### Example: Fetching Session Data
```javascript
const response = await fetch(`http://localhost:8000/session/${currentSessionId}`);
const data = await response.json();
console.log("Session Documents:", data.documents);
```

## Directory Structure
- `backend/main.py`: Entry point, CORS setup, and route registration.
- `backend/database.py`: SQLite schema, migration logic, and session/analysis storage.
- `backend/routers/ingest.py`: Routes for ingestion endpoints.
- `backend/routers/analysis.py`: Routes for triggering and retrieving AI analysis.
- `backend/services/claude_client.py`: Anthropic API client and vision extraction logic.
- `backend/services/analysis_service.py`: Core logic for aggregating context and calling analysis prompts.
- `backend/services/csv_parser.py`: Pandas logic for trend calculation and "bad night" detection.
