# KIN Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=sk-ant-...

# Run backend
python -m uvicorn backend.main:app --reload
```

Backend will be at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Run development server
npm run dev
```

Frontend will be at: `http://localhost:5173`

## 📝 First Steps

1. **Open Frontend**: Go to http://localhost:5173
2. **Sign Up**: Create a new account
3. **Auto Session**: A session is automatically created
4. **Upload Files**: Click "Upload & Ingest" and add PDF/CSV/JSON/TXT files
5. **Chat**: Ask questions about your documents in "Doctor Mode Chat"
6. **Analyze**: Click "Analyze" to generate synthesis and patterns

## 🔑 Key Changes from Previous Version

| Feature | Before | After |
|---------|--------|-------|
| Session Creation | Manual, user inputs ID | Automatic on login |
| API URL | Hardcoded | Environment variable |
| Authentication | None | JWT with user accounts |
| Document Scope | All documents | Per-user documents |
| Chat | Not available | Full implementation |
| Analysis | Basic | Enhanced with UI |
| Security | None | Full security implementation |

## 📁 Important Files

### Backend
- `backend/main.py` - FastAPI app setup
- `backend/database.py` - Database functions
- `backend/routers/` - API endpoints
- `backend/config.py` - Configuration
- `backend/.env` - Secret configuration (⚠️ never commit!)

### Frontend
- `frontend/src/App.jsx` - App entry point
- `frontend/src/context/SessionContext.jsx` - Session management
- `frontend/src/context/AuthContext.jsx` - Authentication
- `frontend/src/api/client.js` - API calls
- `frontend/.env.local` - API configuration (⚠️ never commit!)

## 🧪 Test the Features

### Authentication
```
1. Click "Sign Up"
2. Enter email, name, password
3. Submit → Redirects to dashboard
4. Session automatically created ✅
```

### Document Upload
```
1. Click "Upload & Ingest"
2. Select PDF/CSV/JSON/TXT file
3. Click "Upload & Ingest"
4. File processed and stored ✅
5. Appears in "Ingested Documents" ✅
```

### Chat
```
1. Click "Doctor Mode Chat" section
2. Type a question about the documents
3. Click send
4. Get AI answer with sources ✅
```

### Analysis
```
1. Click "Analyze" button
2. Wait for processing
3. View "Synthesis" tab → AI summary
4. View "Patterns" tab → Identified patterns ✅
```

## 🔧 Common Issues & Fixes

### "Cannot GET /"
- Backend not running at http://localhost:8000
- Fix: Run `python -m uvicorn backend.main:app --reload`

### "ANTHROPIC_API_KEY is invalid"
- Missing or invalid API key in `.env`
- Fix: Add valid key from Anthropic console
- Will fallback to mock answers if missing

### "Session not found"
- Wrong backend URL in `.env.local`
- Fix: Set `VITE_API_BASE_URL=http://localhost:8000`

### "CORS error"
- Frontend and backend not on same local origin
- Fix: Backend is already set to allow all origins on localhost

### "Module not found"
- Dependencies not installed
- Fix: Run `pip install -r requirements.txt` or `npm install`

## 📊 Architecture

```
User Login
    ↓
Auto Create Session
    ↓
Upload Documents
    ↓
Parse & Store
    ↓
Chat / Analyze
    ↓
Display Results
```

## 🔐 Security Notes

- Never commit `.env` or `.env.local` files
- API key should be kept secret
- Session tokens expire after 24 hours
- Users can only access their own documents
- All endpoints require authentication

## 📚 Documentation

- **SETUP.md** - Detailed setup guide
- **PRODUCTION_CHECKLIST.md** - Pre-deployment checklist
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **API Docs** - http://localhost:8000/docs (when running)

## 🚀 Next Steps

### Development
1. Modify components in `frontend/src/components/`
2. Add new endpoints in `backend/routers/`
3. Test with API docs: `/docs` endpoint
4. Restart servers after changes

### Production
1. Follow `SETUP.md` for deployment steps
2. Use `PRODUCTION_CHECKLIST.md` before going live
3. Configure HTTPS and SSL
4. Set up database backups
5. Monitor system logs

## 💡 Tips

- Hot reload enabled: Changes appear instantly
- Use API docs at `/docs` to test endpoints manually
- Check browser console for frontend errors
- Check terminal for backend errors
- Use toast notifications for user feedback

## ❓ Need Help?

1. Check logs in terminal
2. Review error messages in browser
3. Check API docs: http://localhost:8000/docs
4. Review code in relevant files
5. Check SETUP.md for detailed explanations

---

**You're all set! Start the backend and frontend, then visit http://localhost:5173** 🎉
