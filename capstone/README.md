# Pharma Recall Console

A full-stack starter for the pharmaceutical recall capstone.

## Included in this branch
- React + Vite frontend
- FastAPI backend with REST endpoints
- Draft and publish recall workflow
- SQLite local development persistence
- Dockerfile for the API
- Environment-based API URL configuration

## Run locally

### Backend
```bash
cd capstone/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd capstone/frontend
npm install
npm run dev
```

Set `VITE_API_URL` if the API is not running at `http://localhost:8000`.

## API
- `GET /health`
- `GET /api/recalls`
- `POST /api/recalls`
- `GET /api/recalls/{id}`
- `POST /api/recalls/{id}/publish`

## Azure next steps
The API is deliberately environment-driven so the SQLite adapter can be replaced with Azure SQL, Blob Storage can be added for `RecallDocuments`, and Azure API Management/App Service can be wired in without changing the frontend contract.
