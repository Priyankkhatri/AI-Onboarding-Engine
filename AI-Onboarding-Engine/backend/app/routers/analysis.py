"""
API router for analysis endpoints.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..services.parser import parse_file
from ..services.skill_extractor import extract_skills_keyword, extract_skills_openai
from ..services.gap_analyzer import analyze_gaps
from ..services.roadmap_generator import generate_roadmap, generate_roadmap_openai

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
    use_ai: Optional[bool] = Form(False)
):
    """
    Analyze a resume against a job description.
    
    - Parses the uploaded resume file (PDF/DOCX/TXT)
    - Extracts skills from both resume and JD
    - Computes skill gap analysis
    - Generates a personalized learning roadmap
    """
    try:
        # 1. Parse resume file
        file_bytes = await resume.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        resume_text = parse_file(file_bytes, resume.filename)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the resume file")

        # 2. Extract skills
        if use_ai:
            resume_skills = await extract_skills_openai(resume_text, "resume")
            jd_skills = await extract_skills_openai(jd_text, "job description")
        else:
            resume_skills = extract_skills_keyword(resume_text)
            jd_skills = extract_skills_keyword(jd_text)

        if not jd_skills:
            raise HTTPException(
                status_code=400,
                detail="No skills detected in the job description. Please provide a more detailed JD."
            )

        # 3. Analyze gaps
        gap_result = analyze_gaps(resume_skills, jd_skills)

        # 4. Generate roadmap
        if use_ai:
            roadmap = await generate_roadmap_openai(
                gap_result["skill_gaps"],
                resume_skills
            )
        else:
            roadmap = generate_roadmap(
                gap_result["skill_gaps"],
                resume_skills
            )

        return {
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "skill_gaps": gap_result["skill_gaps"],
            "missing_skills": gap_result["missing_skills"],
            "matched_skills": gap_result["matched_skills"],
            "bonus_skills": gap_result["bonus_skills"],
            "match_percentage": gap_result["match_percentage"],
            "learning_path": roadmap
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/demo")
async def get_demo_data():
    """Return pre-built demo data for testing the UI without file upload."""

    resume_skills = [
        {"name": "Python", "level": "Advanced", "category": "Programming Languages"},
        {"name": "JavaScript", "level": "Intermediate", "category": "Programming Languages"},
        {"name": "HTML", "level": "Advanced", "category": "Programming Languages"},
        {"name": "CSS", "level": "Advanced", "category": "Programming Languages"},
        {"name": "React", "level": "Intermediate", "category": "Frontend Frameworks"},
        {"name": "Node.js", "level": "Beginner", "category": "Backend Frameworks"},
        {"name": "Git", "level": "Advanced", "category": "Tools & Practices"},
        {"name": "SQL", "level": "Intermediate", "category": "Databases"},
        {"name": "MongoDB", "level": "Beginner", "category": "Databases"},
        {"name": "REST", "level": "Intermediate", "category": "Tools & Practices"},
        {"name": "Pandas", "level": "Intermediate", "category": "AI / ML"},
        {"name": "NumPy", "level": "Intermediate", "category": "AI / ML"},
    ]

    jd_skills = [
        {"name": "Python", "level": "Advanced", "category": "Programming Languages"},
        {"name": "JavaScript", "level": "Advanced", "category": "Programming Languages"},
        {"name": "TypeScript", "level": "Intermediate", "category": "Programming Languages"},
        {"name": "React", "level": "Advanced", "category": "Frontend Frameworks"},
        {"name": "Next.js", "level": "Intermediate", "category": "Frontend Frameworks"},
        {"name": "Node.js", "level": "Intermediate", "category": "Backend Frameworks"},
        {"name": "PostgreSQL", "level": "Intermediate", "category": "Databases"},
        {"name": "Docker", "level": "Intermediate", "category": "Cloud & DevOps"},
        {"name": "AWS", "level": "Beginner", "category": "Cloud & DevOps"},
        {"name": "Git", "level": "Intermediate", "category": "Tools & Practices"},
        {"name": "REST", "level": "Advanced", "category": "Tools & Practices"},
        {"name": "CI/CD", "level": "Beginner", "category": "Cloud & DevOps"},
        {"name": "TailwindCSS", "level": "Intermediate", "category": "Frontend Frameworks"},
        {"name": "GraphQL", "level": "Beginner", "category": "Tools & Practices"},
    ]

    gap_result = analyze_gaps(resume_skills, jd_skills)

    roadmap = generate_roadmap(gap_result["skill_gaps"], resume_skills)

    return {
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "skill_gaps": gap_result["skill_gaps"],
        "missing_skills": gap_result["missing_skills"],
        "matched_skills": gap_result["matched_skills"],
        "bonus_skills": gap_result["bonus_skills"],
        "match_percentage": gap_result["match_percentage"],
        "learning_path": roadmap
    }
