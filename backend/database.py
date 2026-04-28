import sqlite3
import uuid
import json
from datetime import datetime

DB_PATH = "kin.db"

DEMO_ACCOUNT_EMAIL = "test.account.kin@example.com"
DEMO_ACCOUNT_NAME = "Test Account"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT,
            created_at TEXT,
            synthesis_result TEXT,
            patterns_result TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    # Check if columns exist (for migration)
    cursor.execute("PRAGMA table_info(sessions)")
    columns = [info[1] for info in cursor.fetchall()]
    if "synthesis_result" not in columns:
        cursor.execute("ALTER TABLE sessions ADD COLUMN synthesis_result TEXT")
    if "patterns_result" not in columns:
        cursor.execute("ALTER TABLE sessions ADD COLUMN patterns_result TEXT")
    if "user_id" not in columns:
        cursor.execute("ALTER TABLE sessions ADD COLUMN user_id TEXT")
    
    # Create documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            filename TEXT,
            file_type TEXT,
            content TEXT,
            created_at TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(session_id)
        )
    """)

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            full_name TEXT,
            hashed_password TEXT,
            created_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def create_session(user_id: str | None = None) -> str:
    session_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (session_id, user_id, created_at) VALUES (?, ?, ?)",
        (session_id, user_id, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return session_id

def get_latest_session_for_user(user_id: str) -> dict | None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT session_id, user_id, created_at, synthesis_result, patterns_result
        FROM sessions
        WHERE user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 1
        """,
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_or_create_session_for_user(user_id: str) -> str:
    existing = get_latest_session_for_user(user_id)
    if existing:
        return existing["session_id"]
    return create_session(user_id=user_id)

def get_session_owner(session_id: str) -> str | None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def update_session_analysis(session_id: str, synthesis: dict = None, patterns: dict = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if synthesis:
        cursor.execute(
            "UPDATE sessions SET synthesis_result = ? WHERE session_id = ?",
            (json.dumps(synthesis), session_id)
        )
    if patterns:
        cursor.execute(
            "UPDATE sessions SET patterns_result = ? WHERE session_id = ?",
            (json.dumps(patterns), session_id)
        )
    conn.commit()
    conn.close()

def get_session_analysis(session_id: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT synthesis_result, patterns_result FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    synthesis = None
    patterns = None
    if row["synthesis_result"]:
        synthesis = json.loads(row["synthesis_result"])
    if row["patterns_result"]:
        patterns = json.loads(row["patterns_result"])
        
    return {
        "synthesis": synthesis,
        "patterns": patterns
    }

def insert_document(session_id: str, filename: str, file_type: str, content: dict | str) -> str:
    doc_id = str(uuid.uuid4())
    content_str = json.dumps(content) if isinstance(content, (dict, list)) else content
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO documents (id, session_id, filename, file_type, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (doc_id, session_id, filename, file_type, content_str, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return doc_id

def get_session_documents(session_id: str) -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE session_id = ?", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    
    docs = []
    for row in rows:
        content = row["content"]
        try:
            content = json.loads(content)
        except Exception:
            pass
        docs.append({
            "id": row["id"],
            "filename": row["filename"],
            "file_type": row["file_type"],
            "content": content,
            "created_at": row["created_at"]
        })
    return docs

def create_user(email: str, full_name: str, hashed_password: str) -> dict:
    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (id, email, full_name, hashed_password, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, email, full_name, hashed_password, created_at)
    )
    conn.commit()
    conn.close()
    return {"id": user_id, "email": email, "full_name": full_name, "created_at": created_at}

def ensure_user(email: str, full_name: str, hashed_password: str) -> dict:
    existing = get_user_by_email(email)
    if existing:
        return {k: v for k, v in existing.items() if k != "hashed_password"}
    return create_user(email, full_name, hashed_password)

def get_user_by_email(email: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
