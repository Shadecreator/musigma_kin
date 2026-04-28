# KIN Platform - Setup & Deployment Guide

## Overview
KIN is a secure medical data ingestion, analysis, and chat platform with authentication, document processing, and AI-powered insights.

## Project Structure

```
musigma_kin/
├── backend/           # FastAPI backend
│   ├── routers/      # API endpoints (auth, ingest, chat, analysis)
│   ├── services/     # Business logic (claude_client, csv_parser, analysis_service)
│   ├── database.py   # SQLite database functions
│   ├── security.py   # JWT authentication
│   ├── main.py       # FastAPI app setup
│   ├── config.py     # Configuration & environment variables
│   ├── requirements.txt
│   ├── .env.example  # Environment variables template
│   └── .gitignore
│
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/        # Login/Signup
│   │   │   ├── Dashboard/   # Main application
│   │   │   ├── Chat/        # Doctor mode chat
│   │   │   └── Analysis/    # Synthesis & patterns
│   │   ├── context/         # Auth & Session context
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client
│   │   └── styles/
│   ├── .env.example
│   ├── .env.local    # Local environment (git-ignored)
│   ├── package.json
│   └── .gitignore
│
└── docs/            # API documentation
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip/conda

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SECRET_KEY=your_secure_secret_key_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=kin.db
```

5. **Run the backend:**
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
```

4. **Run development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Sessions & Documents
- `POST /session` - Create new session (auto-created on login)
- `POST /ingest` - Upload and ingest documents
- `GET /session/{session_id}` - Get session documents

### Analysis
- `POST /session/{session_id}/analyze` - Generate synthesis & patterns
- `GET /session/{session_id}/analysis` - Retrieve analysis results

### Chat
- `POST /session/{session_id}/chat` - Ask doctor mode questions

## Features

### Authentication
- User registration with email validation
- JWT-based authentication
- Secure password hashing with bcrypt

### Document Ingestion
- Support for PDF, CSV, JSON, TXT files
- PDF text extraction with Claude Vision
- CSV parsing with pandas
- Automatic session creation on login

### Analysis
- AI-powered synthesis of patient data
- Pattern recognition in medical records
- Results stored in SQLite

### Doctor Mode Chat
- Ask questions about ingested patient data
- Source attribution for answers
- Context-aware responses

## Production Deployment

### Backend (Uvicorn + Gunicorn)
```bash
pip install gunicorn
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Build & Deploy)
```bash
npm run build
# Serve dist/ folder with a static server
npx serve -s dist -l 3000
```

### Environment Variables (Production)
Update `.env` with production values:
- Use strong `SECRET_KEY`
- Set `ANTHROPIC_API_KEY`
- Configure `DATABASE_URL` for production database
- Update CORS origins in `main.py`

### Database
Move `kin.db` to a persistent location (not in container/temporary storage)

### HTTPS & SSL
Use a reverse proxy (nginx) with SSL certificates (Let's Encrypt)

## Troubleshooting

### 401 Unauthorized
- Ensure `VITE_API_BASE_URL` in frontend matches backend URL
- Check JWT token in localStorage
- Verify backend authentication middleware

### Ingestion Fails
- Check file size limits
- Verify `ANTHROPIC_API_KEY` is valid
- Check server logs for detailed errors

### Chat/Analysis Not Working
- Ensure documents are ingested first
- Verify `ANTHROPIC_API_KEY` is configured
- Check backend logs: `backend.main`

## Development Notes

### Adding New Features
1. Backend: Add new router in `backend/routers/`
2. Frontend: Add new component in `src/components/`
3. Update API client: `src/api/client.js`
4. Update contexts if needed

### Database Schema
- `users` - User accounts
- `sessions` - User sessions
- `documents` - Ingested documents
- Analysis stored in `sessions.synthesis_result` and `sessions.patterns_result`

## Security Notes
- Never commit `.env` files with real credentials
- Use environment variables for all secrets
- Implement rate limiting in production
- Validate all file uploads
- Sanitize user inputs
- Use HTTPS in production
- Keep dependencies updated

## Support
For issues or questions, check logs and API documentation at `/docs` endpoint.
