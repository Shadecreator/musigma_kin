from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import (
    DEMO_ACCOUNT_EMAIL,
    DEMO_ACCOUNT_NAME,
    ensure_user,
    get_or_create_session_for_user,
    init_db,
)
from backend.routers import ingest, analysis
from backend.routers import chat
from backend.routers import auth
from backend.security import get_current_user, hash_password

app = FastAPI(title="Kin Backend API")

# Configure CORS for the frontend (Next.js typically runs on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allowing all. Restrict in prod.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    demo_user = ensure_user(DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_NAME, hash_password("Test1234!"))
    demo_session_id = get_or_create_session_for_user(demo_user["id"])
    analysis.seed_demo_session_data(demo_session_id)

@app.get("/")
def hello_world():
    """Hello world endpoint to verify server is running."""
    return {"status": "ok"}

@app.post("/session")
def new_session(current_user: dict = Depends(get_current_user)):
    """Get or create the current user's active session."""
    session_id = get_or_create_session_for_user(current_user["id"])
    return {"session_id": session_id}

# Include routers
app.include_router(ingest.router, tags=["Ingestion"])
app.include_router(analysis.router, tags=["Analysis"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(auth.router, tags=["Auth"])
 
