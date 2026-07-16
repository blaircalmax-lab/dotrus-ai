from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from docx import Document
from pypdf import PdfReader
import io
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="Dotrus Grant AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SUPABASE_URL = "https://vobqgpnwtzvaztroppcs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYnFncG53dHp2YXp0cm9wcGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDY0MTYsImV4cCI6MjA5OTA4MjQxNn0.3F_ShfB0aOey60nrbtVJRKQqjTgOOcCbhUBe7LXHI-o"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class RFPRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

class DraftRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

class BudgetRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

class LogframeRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

class ReviewRequest(BaseModel):
    proposal_text: str
    rfp_text: str = ""
    user_email: str = "guest@dotrus.ai"

class EligibilityRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

class DonorIntelligenceRequest(BaseModel):
    rfp_text: str
    organization_profile: str = ""
    user_email: str = "guest@dotrus.ai"

def extract_text_from_file(file: UploadFile) -> str:
    content = file.file.read()
    try:
        if file.filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        elif file.filename.endswith(".docx"):
            doc = Document(io.BytesIO(content))
            return "\n".join([para.text for para in doc.paragraphs])
        elif file.filename.endswith(".txt"):
            return content.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    except Exception as e:
        print("File extraction error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to extract text from file")

@app.get("/health")
def health():
    return {"status": "ok", "service": "Dotrus Grant AI"}

@app.post("/api/analyze-rfp")
async def analyze_rfp(request: RFPRequest):
    prompt = f"""You are an expert grant evaluator for Dotrus Grant AI.

Analyze the following RFP and return a structured JSON with:
- project_title
- donor
- eligibility_criteria (array)
- evaluation_criteria (array of objects with name, weight, description)
- key_requirements
- budget_range
- deadline
- go_no_go_factors

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        try:
            supabase.table("user_analyses").insert({
                "user_email": request.user_email,
                "type": "RFP Analysis",
                "rfp_text": request.rfp_text[:500],
                "result": result
            }).execute()
        except Exception as db_error:
            print("Supabase Error:", db_error)
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/score-proposal")
async def score_proposal(rfp_text: str = "", proposal_text: str = "", user_email: str = "guest@dotrus.ai"):
    prompt = f"""Score this proposal against the RFP.

RFP:
{rfp_text}

Proposal:
{proposal_text}

Return JSON:
{{
  "overall_score": 0-100,
  "criteria_scores": [
    {{"name": "...", "score": 0-100, "justification": "..."}}
  ],
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        try:
            supabase.table("user_analyses").insert({
                "user_email": user_email,
                "type": "Proposal Scoring",
                "rfp_text": rfp_text[:500],
                "result": result
            }).execute()
        except Exception as db_error:
            print("Supabase Error:", db_error)
        return {"success": True, "scoring": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-draft")
async def generate_draft(request: DraftRequest):
    prompt = f"""You are an expert proposal writer for Dotrus Grant AI.

Based on the RFP below, generate a professional proposal draft structure.

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}

Return a JSON with the following structure:
{{
  "title": "...",
  "executive_summary": "...",
  "background": "...",
  "objectives": [],
  "methodology": "...",
  "timeline": "...",
  "budget_summary": "...",
  "monitoring_evaluation": "...",
  "sustainability": "...",
  "team": "..."
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        try:
            supabase.table("user_analyses").insert({
                "user_email": request.user_email,
                "type": "Proposal Draft",
                "rfp_text": request.rfp_text[:500],
                "result": result
            }).execute()
        except Exception as db_error:
            print("Supabase Error:", db_error)
        return {"success": True, "draft": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-budget")
async def generate_budget(request: BudgetRequest):
    prompt = f"""You are an expert grant budget developer.

Based on the RFP and organization profile below, generate a realistic budget breakdown.

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}

Return a JSON with the following structure:
{{
  "total_budget": "...",
  "currency": "USD",
  "budget_lines": [
    {{
      "category": "...",
      "description": "...",
      "amount": "..."
    }}
  ]
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "budget": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-logframe")
async def generate_logframe(request: LogframeRequest):
    prompt = f"""You are an expert in monitoring and evaluation.

Based on the RFP and organization profile below, generate a professional Logical Framework (Logframe).

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}

Return a JSON with the following structure:
{{
  "goal": "...",
  "purpose": "...",
  "outputs": [
    {{
      "output": "...",
      "indicators": "...",
      "means_of_verification": "...",
      "assumptions": "..."
    }}
  ],
  "activities": ["..."]
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "logframe": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/review-proposal")
async def review_proposal(request: ReviewRequest):
    prompt = f"""You are an expert proposal reviewer for Dotrus Grant AI.

Review the following proposal draft and provide detailed feedback.

RFP:
{request.rfp_text}

Proposal Draft:
{request.proposal_text}

Return a JSON with the following structure:
{{
  "overall_score": 0-100,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "clarity_feedback": "...",
  "alignment_with_rfp": "...",
  "recommendations": ["..."]
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "review": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/check-eligibility")
async def check_eligibility(request: EligibilityRequest):
    prompt = f"""You are an expert grant eligibility assessor.

Based on the RFP and organization profile below, assess the organization's eligibility for this grant.

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}

Return a JSON with the following structure:
{{
  "eligibility_score": 0-100,
  "overall_assessment": "...",
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendations": ["..."],
  "go_no_go": "Go" or "No-Go" or "Conditional"
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "eligibility": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/donor-intelligence")
async def donor_intelligence(request: DonorIntelligenceRequest):
    prompt = f"""You are an expert in donor research and intelligence.

Based on the RFP below, provide detailed donor intelligence and insights.

RFP:
{request.rfp_text}

Organization Profile:
{request.organization_profile}

Return a JSON with the following structure:
{{
  "donor_name": "...",
  "donor_type": "...",
  "funding_priorities": ["..."],
  "preferred_sectors": ["..."],
  "average_grant_size": "...",
  "application_tips": ["..."],
  "past_funding_patterns": "...",
  "success_probability": "High / Medium / Low"
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "donor_intelligence": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/my-analyses")
async def get_my_analyses(email: str = Query(...)):
    try:
        response = supabase.table("user_analyses").select("*").eq("user_email", email).order("created_at", desc=True).execute()
        return {"success": True, "analyses": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/delete-analysis")
async def delete_analysis(id: int = Query(...)):
    try:
        supabase.table("user_analyses").delete().eq("id", id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-file")
async def upload_file(file: UploadFile = File(...)):
    try:
        text = extract_text_from_file(file)
        return {"success": True, "text": text, "filename": file.filename}
    except Exception as e:
        print("Upload error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
