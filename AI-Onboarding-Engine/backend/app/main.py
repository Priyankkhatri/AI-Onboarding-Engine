"""
AI-Adaptive Onboarding Engine — FastAPI Backend
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .routers import analysis

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI-Adaptive Onboarding Engine",
    description="Analyze resumes against job descriptions and generate personalized learning roadmaps",
    version="1.0.0"
)

# CORS — allow frontend dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {
        "name": "AI-Adaptive Onboarding Engine API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/analyze": "Upload resume + JD for analysis",
            "GET /api/demo": "Get demo data for testing"
        }
    }


@app.get("/health")
async def health():
    has_openai = bool(os.getenv("OPENAI_API_KEY")) and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here"
    return {
        "status": "healthy",
        "openai_configured": has_openai
    }
