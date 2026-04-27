# Kin: Empowering Caregivers through Data Synthesis

**Kin** is an AI-powered caregiver support platform designed to turn fragmented medical records, wearable data, and personal observations into a clear, structured "Doctor-Ready Brief." Built during the Anthropic Hackathon, it helps family caregivers bridge the communication gap with clinicians in high-stakes appointments.

![Status](https://img.shields.io/badge/Status-Builder_1_Complete-success?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Claude_4.6_Vision-blueviolet?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-FastAPI_%7C_SQLite_%7C_Pandas-blue?style=for-the-badge)

---

## Key Features

- **Smart Document Ingestion**: Upload medical reports, discharge summaries, and lab results. Kin uses **Claude Vision** to extract and structure data from PDFs, with a robust local fallback for text-heavy documents.
- **Wearable Trend Analysis**: Automatically parses Fitbit-style CSV exports. It computes critical health trends (Early vs. Late 30-day HRV, Sleep duration, and Activity levels) using **Pandas**.
- **AI Synthesis Engine**: Combines all ingested data—medications, reports, wearable trends, and symptom logs—into a professional medical brief that a doctor can review in under 2 minutes.
- **Clinical Pattern Detection**: Identifies non-obvious correlations, such as how missed evening medications or fragmented sleep architecture correspond to nocturnal confusion episodes.

---

## Technical Architecture (Builder 1)

The backend is built for speed, privacy, and clinical accuracy. For more details, refer to the [Architecture Diagram](docs/arch.png) and the [Database Schema](docs/schema.png).

- **Framework**: FastAPI (Asynchronous Python)
- **Database**: SQLite (Local, session-based storage)
- **AI Integration**: Official Anthropic SDK (utilizing Claude-Sonnet-4-6)
- **Data Science**: Pandas for time-series trend calculation
- **Extraction**: Claude Vision + `pypdf` fallback

---

## Getting Started

### 1. Prerequisites
- Python 3.11 or higher
- An Anthropic API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Shadecreator/musigma_kin.git
cd musigma_kin

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Configuration
Create a `.env` file in the `backend/` directory:
```env
ANTHROPIC_API_KEY=your_sk-ant-api_key_here
```

### 4. Running the Server
```bash
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`. You can explore the interactive documentation at `/docs`.

---

## Project Structure

```text
musigma_kin/
├── backend/                # FastAPI Application
│   ├── routers/            # Ingestion & Analysis endpoints
│   ├── services/           # AI, PDF, and CSV logic
│   ├── database.py         # SQLite schema & logic
│   └── main.py             # Entry point & CORS
├── docs/                   # Technical documentation
├── sample_data/            # "Pawan" sample dataset for testing
├── test_ingest.py          # Automated integration tests
└── run_main.py             # Simple launcher script
```

---

## API Summary

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/session` | `POST` | Start a new caregiver session |
| `/ingest` | `POST` | Upload PDFs, CSVs, and Logs |
| `/session/{id}/analyze` | `POST` | Trigger AI Synthesis & Pattern Detection |
| `/session/{id}/analysis` | `GET` | Retrieve the generated brief |

---

## Verification and Quality
The system has been verified using the **Pawan Dataset** (a complex geriatric case involving orthostatic hypotension and nocturnal confusion). Kin successfully identified a core correlation between **nocturnal SpO2 dips** and **confusional arousals**, highlighting a potential need for a sleep study—an insight buried across multiple separate logs and reports.

---

## Contributors
- **Builder 1 (Backend)**: Siddharth Malkani
- **Builder 2 (Frontend)**: [Integration Pending]

---
*Built for the Anthropic Hackathon 2026.*
