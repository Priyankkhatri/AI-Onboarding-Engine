"""
Skill gap analyzer.
Compares resume skills against job description requirements.
"""

from typing import List, Dict


def analyze_gaps(resume_skills: List[Dict], jd_skills: List[Dict]) -> Dict:
    """
    Compare resume skills with JD skills and identify gaps.

    Returns:
        - skill_gaps: detailed gap analysis
        - missing_skills: list of skill names not found in resume
        - matched_skills: list of skill names found in both
        - match_percentage: overall skill match score
    """
    # Normalize skill names for comparison
    resume_skill_map = {}
    for skill in resume_skills:
        key = skill["name"].lower().strip()
        resume_skill_map[key] = skill

    jd_skill_map = {}
    for skill in jd_skills:
        key = skill["name"].lower().strip()
        jd_skill_map[key] = skill

    # Also create alias mappings for common variations
    aliases = {
        "reactjs": "react", "react.js": "react",
        "vuejs": "vue", "vue.js": "vue",
        "nodejs": "node.js", "node": "node.js",
        "nextjs": "next.js", "expressjs": "express",
        "express.js": "express", "angularjs": "angular",
        "nestjs": "nest.js", "postgres": "postgresql",
        "mongo": "mongodb", "k8s": "kubernetes",
        "sklearn": "scikit-learn", "tf": "tensorflow",
        "tailwindcss": "tailwind", "tailwind css": "tailwind",
    }

    def normalize(name: str) -> str:
        n = name.lower().strip()
        return aliases.get(n, n)

    # Build normalized maps
    resume_normalized = {}
    for key, skill in resume_skill_map.items():
        norm = normalize(key)
        resume_normalized[norm] = skill

    jd_normalized = {}
    for key, skill in jd_skill_map.items():
        norm = normalize(key)
        jd_normalized[norm] = skill

    skill_gaps = []
    missing_skills = []
    matched_skills = []

    level_order = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}

    for jd_norm, jd_skill in jd_normalized.items():
        if jd_norm in resume_normalized:
            resume_skill = resume_normalized[jd_norm]
            resume_level = level_order.get(resume_skill.get("level", "Intermediate"), 2)
            jd_level = level_order.get(jd_skill.get("level", "Intermediate"), 2)

            if resume_level >= jd_level:
                status = "strong"
                matched_skills.append(jd_skill["name"])
            else:
                status = "weak"
                matched_skills.append(jd_skill["name"])

            skill_gaps.append({
                "skill": jd_skill["name"],
                "status": status,
                "current_level": resume_skill.get("level", "Intermediate"),
                "required_level": jd_skill.get("level", "Intermediate")
            })
        else:
            status = "missing"
            missing_skills.append(jd_skill["name"])
            skill_gaps.append({
                "skill": jd_skill["name"],
                "status": status,
                "current_level": None,
                "required_level": jd_skill.get("level", "Intermediate")
            })

    # Identify bonus skills
    bonus_skills = []
    for res_norm, res_skill in resume_normalized.items():
        if res_norm not in jd_normalized:
            bonus_skills.append(res_skill["name"])

    # Calculate match percentage
    total_jd_skills = len(jd_normalized)
    if total_jd_skills == 0:
        match_percentage = 100.0
    else:
        strong_count = sum(1 for g in skill_gaps if g["status"] == "strong")
        weak_count = sum(1 for g in skill_gaps if g["status"] == "weak")
        match_percentage = round(
            ((strong_count + weak_count * 0.5) / total_jd_skills) * 100, 1
        )

    return {
        "skill_gaps": skill_gaps,
        "missing_skills": missing_skills,
        "matched_skills": matched_skills,
        "bonus_skills": bonus_skills,
        "match_percentage": match_percentage
    }
