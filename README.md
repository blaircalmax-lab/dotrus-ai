# Dotrus Grant AI

Grant Intelligence Platform – MVP

## Features

- Analyze RFPs
- Score Proposals
- Generate Proposal Drafts
- File Upload (PDF, DOCX, TXT)
- Save & Manage Analyses (Supabase)
- User Email Support

## Tech Stack

- **Frontend**: Next.js + Tailwind
- **Backend**: FastAPI + OpenAI + Supabase
- **Database**: Supabase (PostgreSQL)

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000