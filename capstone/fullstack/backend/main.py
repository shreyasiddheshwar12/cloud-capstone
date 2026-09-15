from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Pharmaceutical Recall API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class RecallCreate(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    batch_number: str = Field(min_length=1, max_length=100)
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    reason: str = Field(min_length=1, max_length=2000)

class Recall(RecallCreate):
    id: UUID
    status: str
    created_at: datetime
    published_at: Optional[datetime] = None

recalls: dict[UUID, Recall] = {}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/v1/recalls", response_model=list[Recall])
def list_recalls():
    return list(recalls.values())

@app.post("/api/v1/recalls", response_model=Recall, status_code=201)
def create_recall(payload: RecallCreate):
    item = Recall(id=uuid4(), **payload.model_dump(), status="draft", created_at=datetime.now(timezone.utc))
    recalls[item.id] = item
    return item

@app.get("/api/v1/recalls/{recall_id}", response_model=Recall)
def get_recall(recall_id: UUID):
    if recall_id not in recalls:
        raise HTTPException(404, "Recall not found")
    return recalls[recall_id]

@app.post("/api/v1/recalls/{recall_id}/publish", response_model=Recall)
def publish_recall(recall_id: UUID):
    item = recalls.get(recall_id)
    if not item:
        raise HTTPException(404, "Recall not found")
    item.status = "published"
    item.published_at = datetime.now(timezone.utc)
    return item
