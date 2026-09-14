"""
Harsh Mishra | AI/ML Engineer Portfolio - Production FastAPI Backend
Designed for local execution and seamless cloud deployment on Render (render.com).

Provides REST APIs for:
- /health : Health check probe for Render
- /api/data : Read active portfolio configuration
- /api/save : Admin Panel persistence with auto-backup
- /api/contact : Contact inquiry submission & message storage
- /api/messages : View saved inquiry messages
- /api/ai-chat : AI Agent simulator Q&A processing
- Static file mounting for portfolio & admin console
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime
import json
import os
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "portfolio-data.json")
MESSAGES_FILE = os.path.join(BASE_DIR, "messages.json")

app = FastAPI(
    title="Harsh Mishra - AI/ML Engineer Portfolio API",
    description="Backend API powering portfolio data, admin console, contact dispatch, and AI agent terminal.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for cross-origin or local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# Pydantic Schemas
# --------------------------------------------------------------------------
class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, description="Name of sender")
    subject: str = Field(..., min_length=1, max_length=200, description="Topic or Role")
    message: str = Field(..., min_length=1, max_length=5000, description="Message text")
    email: Optional[str] = Field(None, max_length=120, description="Contact email")

class AIChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt query")

# --------------------------------------------------------------------------
# Helper Functions
# --------------------------------------------------------------------------
def load_data() -> Dict[str, Any]:
    if not os.path.exists(DATA_FILE):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="portfolio-data.json file not found"
        )
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed reading portfolio data: {str(e)}"
        )

def save_data(data: Dict[str, Any]) -> None:
    try:
        # Create backup if file exists
        if os.path.exists(DATA_FILE):
            shutil.copy2(DATA_FILE, DATA_FILE + ".bak")
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed writing portfolio data: {str(e)}"
        )

# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------
@app.get("/health", tags=["Monitoring"])
async def health_check():
    """Liveness probe used by Render and cloud monitors."""
    return {
        "status": "healthy",
        "service": "harsh-ai-portfolio-backend",
        "version": "2.4.0",
        "server_time": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/api/data", tags=["Portfolio"])
async def get_portfolio_data():
    """Fetch current portfolio content from portfolio-data.json."""
    return load_data()

@app.post("/api/save", tags=["Admin"])
async def save_portfolio_data(payload: Dict[str, Any]):
    """Save updated portfolio content directly to disk with backup safety."""
    if not payload or not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload format")
    save_data(payload)
    return {
        "status": "success",
        "message": "Portfolio data saved successfully to disk with backup created."
    }

@app.post("/api/contact", tags=["Contact"])
async def submit_contact_message(msg: ContactMessage, request: Request):
    """Receive and record contact dispatch message."""
    client_ip = request.client.host if request.client else "unknown"
    record = {
        "id": f"msg-{int(datetime.datetime.now().timestamp() * 1000)}",
        "name": msg.name,
        "subject": msg.subject,
        "message": msg.message,
        "email": msg.email,
        "client_ip": client_ip,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    # Append to messages.json
    messages = []
    if os.path.exists(MESSAGES_FILE):
        try:
            with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                messages = json.load(f)
        except Exception:
            messages = []

    messages.append(record)
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)

    return {
        "status": "success",
        "message": f"Thank you {msg.name}! Your message regarding '{msg.subject}' has been securely received.",
        "record_id": record["id"]
    }

@app.get("/api/messages", tags=["Contact"])
async def get_messages():
    """List all received contact inquiries."""
    if not os.path.exists(MESSAGES_FILE):
        return []
    try:
        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

@app.post("/api/ai-chat", tags=["AI Terminal"])
async def ai_chat_query(req: AIChatRequest):
    """Backend AI agent simulator inquiry processor."""
    data = load_data()
    knowledge_base = data.get("aiSimulator", [])
    clean_query = req.prompt.lower().strip()

    matched_response = None
    for item in knowledge_base:
        keywords = item.get("keywords", [])
        if any(kw.lower() in clean_query for kw in keywords):
            matched_response = item.get("response")
            break

    if not matched_response:
        matched_response = (
            f"I processed your query: <em>'{req.prompt}'</em>.<br>"
            "Harsh specializes in <strong>AI/ML Engineering</strong>, <strong>RAG Architectures</strong>, "
            "<strong>Autonomous Text-to-SQL Agents</strong>, and <strong>Computer Vision (YOLOv8 + VGG16)</strong>. "
            "Feel free to ask about his <strong>CGPDTM Tech Internship</strong>, his <strong>flagship projects</strong>, "
            "or his <strong>technical stack</strong>!"
        )

    return {
        "status": "success",
        "query": req.prompt,
        "response": matched_response
    }

# --------------------------------------------------------------------------
# Explicit HTML Routes
# --------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
async def serve_home():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/admin", include_in_schema=False)
@app.get("/admin.html", include_in_schema=False)
async def serve_admin():
    return FileResponse(os.path.join(BASE_DIR, "admin.html"))

@app.get("/resume", include_in_schema=False)
@app.get("/harsh_mishra_resume.html", include_in_schema=False)
async def serve_resume():
    return FileResponse(os.path.join(BASE_DIR, "harsh_mishra_resume.html"))

# --------------------------------------------------------------------------
# Mount Static Files (CSS, JS, Images, PDFs)
# --------------------------------------------------------------------------
app.mount("/", StaticFiles(directory=BASE_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print("=" * 65)
    print("[FASTAPI] Harsh Mishra Portfolio Backend Server Starting...")
    print(f" -> Live Web:    http://localhost:{port}")
    print(f" -> Admin Panel: http://localhost:{port}/admin.html")
    print(f" -> Swagger API: http://localhost:{port}/docs")
    print("=" * 65)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
