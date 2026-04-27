# Kin API Endpoints Documentation (Builder 1)

This document provides technical details for all Kin Backend API endpoints, including how to test them and expected data formats.

## Base URL
Default local development URL: `http://localhost:8000`

## Authentication
> [!NOTE]
> Currently, the API is **unauthenticated** for the hackathon to facilitate rapid integration between Builder 1 (Backend) and Builder 2 (Frontend). In a production environment, Bearer Token authentication would be required.

---

## 1. Health Check
Verify the server is up and running.

- **Method**: `GET`
- **Endpoint**: `/`
- **Headers**: None
- **Body**: None
- **Response**: `{"status": "ok"}`

### Test with cURL:
```bash
curl http://localhost:8000/
```

---

## 2. Create Session
Initialize a new caregiver session. This ID is required for all subsequent uploads and analysis.

- **Method**: `POST`
- **Endpoint**: `/session`
- **Headers**: None
- **Body**: None
- **Response**:
  ```json
  {
    "session_id": "uuid-string-here"
  }
  ```

### Test with cURL:
```bash
curl -X POST http://localhost:8000/session
```

---

## 3. Ingest Documents
Upload medical reports, wearable data, or symptom logs to a session.

- **Method**: `POST`
- **Endpoint**: `/ingest`
- **Headers**: `Content-Type: multipart/form-data`
- **Body (form-data)**:
  - `session_id` (Text): The ID returned from `/session`.
  - `files` (File): One or more files (PDF, CSV, JSON, TXT).
- **Supported Formats**:
  - `application/pdf`: Processed via Claude Vision for text extraction. 
    - *Note: If a generic MIME type is provided (e.g., application/octet-stream), the system will fallback to extension-based detection (.pdf).*
    - *Note: If the Claude Vision API fails or is not configured, the system falls back to robust local text extraction via `pypdf`.*
  - `text/csv`: Processed via Pandas to calculate 30-day trends and "bad night" correlations.
  - `application/json`: Parsed directly (expected: medication list).
  - `text/plain`: Parsed directly (expected: symptom log or appointment context).

### Test with cURL:
```bash
curl -X POST http://localhost:8000/ingest \
  -F "session_id=YOUR_SESSION_ID" \
  -F "files=@report.pdf" \
  -F "files=@data.csv"
```

---

## 4. Get Session Data
Retrieve all raw and extracted content currently stored for a session.

- **Method**: `GET`
- **Endpoint**: `/session/{session_id}`
- **Headers**: None
- **Body**: None
- **Response**: List of document objects including filename, type, and parsed content.

### Test with cURL:
```bash
curl http://localhost:8000/session/YOUR_SESSION_ID
```

---

## 5. Trigger Analysis
Run the AI Synthesis and Pattern Detection engine. This endpoint pulls all ingested data and calls Claude.

- **Method**: `POST`
- **Endpoint**: `/session/{session_id}/analyze`
- **Headers**: None
- **Body**: None
- **Response**:
  ```json
  {
    "synthesis": { ...structured medical brief... },
    "patterns": { ...detected correlations... }
  }
  ```

### Test with cURL:
```bash
curl -X POST http://localhost:8000/session/YOUR_SESSION_ID/analyze
```

---

## 6. Retrieve Analysis
Get previously generated analysis results without re-triggering the AI.

- **Method**: `GET`
- **Endpoint**: `/session/{session_id}/analysis`
- **Headers**: None
- **Body**: None
- **Response**: The same object structure as the `/analyze` endpoint.

### Test with cURL:
```bash
curl http://localhost:8000/session/YOUR_SESSION_ID/analysis
```

---

## 7. Using Sample Data
To test the full capability of Kin (Synthesis and Pattern Detection), you should upload the sample data provided in the repository.

### Sample Data Location:
`sample_data/pawan/`

### Recommended Upload Sequence:
1. **Create Session**: Call `/session` to get a `session_id`.
2. **Ingest Files**: Call `/ingest` and attach the following files from the sample directory:
   - `appointment_context.txt` (Patient concerns)
   - `fitbit_export_jan_apr_2026.csv` (Wearable data)
   - `medications.json` (Current meds)
   - `symptom_log.txt` (Caregiver notes)
   - All PDFs from the `pdfs/` sub-folder (Medical reports)
3. **Analyze**: Call `/session/{session_id}/analyze` to generate the brief.

### Postman Tip for Multi-file Upload:
In the **Body > form-data** section:
- Add a key named `files` and set the type to **File**.
- You can select **multiple files** at once for this single key in Postman, or add multiple `files` rows.

---

## Testing via Swagger UI
The easiest way to explore and test the API is through the built-in interactive documentation:

1. Start the server: `uvicorn backend.main:app --reload`
2. Open your browser to: `http://localhost:8000/docs`
3. Expand any endpoint and click **"Try it out"**.

## Common Error Codes
| Code | Meaning | Solution |
|------|---------|----------|
| `400` | Bad Request | Check if `session_id` is correct or files are missing. |
| `401` | Unauthorized | Check the `ANTHROPIC_API_KEY` in your `.env` file. |
| `404` | Not Found | Session ID does not exist or no analysis has been run yet. |
| `422` | Unprocessable Entity | Missing required fields in form-data. |
| `500` | Server Error | Check the terminal logs for Python traceback. |
