from datetime import datetime
from enum import Enum
from typing import Optional
import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = os.getenv("DB_PATH", "recalls.db")
app = FastAPI(title="Pharma Recall API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class RecallStatus(str, Enum):
    draft = "DRAFT"
    published = "PUBLISHED"

class RecallCreate(BaseModel):
    product_name: str = Field(min_length=2)
    batch_number: str = Field(min_length=1)
    severity: str = Field(default="MEDIUM")
    reason: str = Field(min_length=3)
    affected_customers: int = Field(default=0, ge=0)

class Recall(RecallCreate):
    id: int
    status: RecallStatus
    created_at: str
    published_at: Optional[str] = None

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE IF NOT EXISTS recalls (id INTEGER PRIMARY KEY AUTOINCREMENT, product_name TEXT NOT NULL, batch_number TEXT NOT NULL, severity TEXT NOT NULL, reason TEXT NOT NULL, affected_customers INTEGER NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, published_at TEXT)")
    conn.commit()
    return conn

def row_to_recall(row):
    return dict(row)

@app.get("/health")
def health():
    return {"status": "ok", "service": "recall-api"}

@app.get("/api/recalls", response_model=list[Recall])
def list_recalls():
    conn = connect()
    rows = conn.execute("SELECT * FROM recalls ORDER BY id DESC").fetchall()
    conn.close()
    return [row_to_recall(r) for r in rows]

@app.post("/api/recalls", response_model=Recall, status_code=201)
def create_recall(payload: RecallCreate):
    now = datetime.utcnow().isoformat() + "Z"
    conn = connect()
    cur = conn.execute("INSERT INTO recalls(product_name,batch_number,severity,reason,affected_customers,status,created_at) VALUES(?,?,?,?,?,?,?)", (*payload.model_dump().values(), "DRAFT", now))
    conn.commit()
    row = conn.execute("SELECT * FROM recalls WHERE id=?", (cur.lastrowid,)).fetchone()
    conn.close()
    return row_to_recall(row)

@app.get("/api/recalls/{recall_id}", response_model=Recall)
def get_recall(recall_id: int):
    conn = connect()
    row = conn.execute("SELECT * FROM recalls WHERE id=?", (recall_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Recall not found")
    return row_to_recall(row)

@app.post("/api/recalls/{recall_id}/publish", response_model=Recall)
def publish_recall(recall_id: int):
    conn = connect()
    row = conn.execute("SELECT * FROM recalls WHERE id=?", (recall_id,)).fetchone()
    if not row:
        conn.close(); raise HTTPException(404, "Recall not found")
    if row["status"] == "PUBLISHED":
        conn.close(); return row_to_recall(row)
    published = datetime.utcnow().isoformat() + "Z"
    conn.execute("UPDATE recalls SET status='PUBLISHED', published_at=? WHERE id=?", (published, recall_id))
    conn.commit()
    row = conn.execute("SELECT * FROM recalls WHERE id=?", (recall_id,)).fetchone()
    conn.close()
    return row_to_recall(row)
