from pydantic import BaseModel
from typing import List, Optional


class SkillItem(BaseModel):
    name: str
    level: str  # "Beginner", "Intermediate", "Advanced"
    category: str  # "Programming", "Framework", "Tool", "Soft Skill", etc.


class GapItem(BaseModel):
    skill: str
    status: str  # "missing", "weak", "strong"
    current_level: Optional[str] = None
    required_level: str


class Resource(BaseModel):
    title: str
    url: str
    type: str  # "video", "docs", "course", "article"
    youtube_id: Optional[str] = None
    channel: Optional[str] = None
    views: Optional[str] = None
    published: Optional[str] = None
    duration: Optional[str] = None


class RoadmapStep(BaseModel):
    topic: str
    level: str
    duration: str
    description: str
    resources: List[Resource]
    dependencies: List[str] = []
    order: int


class AnalysisRequest(BaseModel):
    jd_text: str


class AnalysisResponse(BaseModel):
    resume_skills: List[SkillItem]
    jd_skills: List[SkillItem]
    skill_gaps: List[GapItem]
    missing_skills: List[str]
    matched_skills: List[str]
    bonus_skills: List[str]
    match_percentage: float
    learning_path: List[RoadmapStep]


class DemoResponse(BaseModel):
    resume_skills: List[SkillItem]
    jd_skills: List[SkillItem]
    skill_gaps: List[GapItem]
    missing_skills: List[str]
    matched_skills: List[str]
    bonus_skills: List[str]
    match_percentage: float
    learning_path: List[RoadmapStep]
