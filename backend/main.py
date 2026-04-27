from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, create_session
from backend.routers import ingest, analysis

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

@app.get("/")
def hello_world():
    """Hello world endpoint to verify server is running."""
    return {"status": "ok"}

@app.post("/session")
def new_session():
    """Create a new session."""
    session_id = create_session()
    return {"session_id": session_id}

# Include routers
app.include_router(ingest.router, tags=["Ingestion"])
app.include_router(analysis.router, tags=["Analysis"])
 
