"""
Adaptive learning path / roadmap generator.
Builds a dependency-aware, ordered learning sequence from skill gaps.
"""

import os
import json
import urllib.request
import urllib.parse
import re
from typing import List, Dict

# Skill dependency graph — defines which skills should be learned first
SKILL_DEPENDENCIES = {
    "react": ["javascript", "html", "css"],
    "react.js": ["javascript", "html", "css"],
    "next.js": ["react", "javascript", "node.js"],
    "vue": ["javascript", "html", "css"],
    "vue.js": ["javascript", "html", "css"],
    "nuxt": ["vue", "javascript"],
    "angular": ["typescript", "javascript", "html", "css"],
    "svelte": ["javascript", "html", "css"],
    "node.js": ["javascript"],
    "express": ["node.js", "javascript"],
    "nest.js": ["node.js", "typescript"],
    "fastapi": ["python"],
    "django": ["python"],
    "flask": ["python"],
    "spring boot": ["java"],
    "rails": ["ruby"],
    "typescript": ["javascript"],
    "tailwind": ["css", "html"],
    "tailwindcss": ["css", "html"],
    "sass": ["css"],
    "graphql": ["rest", "api"],
    "docker": ["linux"],
    "kubernetes": ["docker", "linux"],
    "terraform": ["cloud & devops basics"],
    "aws": ["cloud & devops basics"],
    "gcp": ["cloud & devops basics"],
    "azure": ["cloud & devops basics"],
    "pytorch": ["python", "machine learning basics"],
    "tensorflow": ["python", "machine learning basics"],
    "keras": ["python", "tensorflow"],
    "scikit-learn": ["python", "machine learning basics"],
    "pandas": ["python"],
    "numpy": ["python"],
    "langchain": ["python", "llm"],
    "llm": ["machine learning basics", "nlp"],
    "nlp": ["python", "machine learning basics"],
    "deep learning": ["machine learning basics", "python"],
    "machine learning": ["python", "numpy", "pandas"],
    "react native": ["react", "javascript"],
    "flutter": ["dart"],
    "mongodb": ["databases basics"],
    "postgresql": ["sql", "databases basics"],
    "mysql": ["sql", "databases basics"],
    "redis": ["databases basics"],
    "elasticsearch": ["databases basics"],
    "jest": ["javascript"],
    "cypress": ["javascript"],
    "pytest": ["python"],
    "ci/cd": ["git"],
    "github actions": ["git", "ci/cd"],
    "microservices": ["rest", "api", "docker"],
    "kafka": ["microservices"],
    "rabbitmq": ["microservices"],
    "websocket": ["javascript", "node.js"],
}

# Resource templates for common topics
RESOURCE_TEMPLATES = {
    "python": [
        {"title": "Python Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=rfscVS0vtbw", "type": "video", "youtube_id": "rfscVS0vtbw"},
        {"title": "Python Official Docs", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
        {"title": "Automate the Boring Stuff with Python", "url": "https://automatetheboringstuff.com/", "type": "course"}
    ],
    "javascript": [
        {"title": "JavaScript Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg", "type": "video", "youtube_id": "PkZNo7MFNFg"},
        {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
        {"title": "JavaScript.info", "url": "https://javascript.info/", "type": "course"}
    ],
    "typescript": [
        {"title": "TypeScript Full Course — Academind", "url": "https://www.youtube.com/watch?v=BwuLxPH8IDs", "type": "video", "youtube_id": "BwuLxPH8IDs"},
        {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/", "type": "docs"}
    ],
    "react": [
        {"title": "React Full Course 2024 — freeCodeCamp", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "type": "video", "youtube_id": "bMknfKXIFA8"},
        {"title": "React Official Docs", "url": "https://react.dev/learn", "type": "docs"},
        {"title": "Full Stack Open — React", "url": "https://fullstackopen.com/en/", "type": "course"}
    ],
    "node.js": [
        {"title": "Node.js Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=Oe421EPjeBE", "type": "video", "youtube_id": "Oe421EPjeBE"},
        {"title": "Node.js Official Docs", "url": "https://nodejs.org/en/docs", "type": "docs"}
    ],
    "next.js": [
        {"title": "Next.js Tutorial — Vercel", "url": "https://nextjs.org/learn", "type": "course"},
        {"title": "Next.js Crash Course — Traversy Media", "url": "https://www.youtube.com/watch?v=mTz0GXj8NN0", "type": "video", "youtube_id": "mTz0GXj8NN0"}
    ],
    "docker": [
        {"title": "Docker Full Course — TechWorld with Nana", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "type": "video", "youtube_id": "3c-iBn73dDE"},
        {"title": "Docker Official Docs", "url": "https://docs.docker.com/get-started/", "type": "docs"}
    ],
    "kubernetes": [
        {"title": "Kubernetes Course — TechWorld with Nana", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "type": "video", "youtube_id": "X48VuDVv0do"},
        {"title": "Kubernetes Official Docs", "url": "https://kubernetes.io/docs/tutorials/", "type": "docs"}
    ],
    "aws": [
        {"title": "AWS Certified Cloud Practitioner — freeCodeCamp", "url": "https://www.youtube.com/watch?v=SOTamWNgDKc", "type": "video", "youtube_id": "SOTamWNgDKc"},
        {"title": "AWS Documentation", "url": "https://docs.aws.amazon.com/", "type": "docs"}
    ],
    "mongodb": [
        {"title": "MongoDB Crash Course — Traversy Media", "url": "https://www.youtube.com/watch?v=-56x56UppqQ", "type": "video", "youtube_id": "-56x56UppqQ"},
        {"title": "MongoDB University", "url": "https://university.mongodb.com/", "type": "course"}
    ],
    "postgresql": [
        {"title": "PostgreSQL Tutorial — freeCodeCamp", "url": "https://www.youtube.com/watch?v=qw--VYLpxG4", "type": "video", "youtube_id": "qw--VYLpxG4"},
        {"title": "PostgreSQL Documentation", "url": "https://www.postgresql.org/docs/", "type": "docs"}
    ],
    "sql": [
        {"title": "SQL Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "type": "video", "youtube_id": "HXV3zeQKqGY"},
        {"title": "SQLBolt Interactive Tutorial", "url": "https://sqlbolt.com/", "type": "course"}
    ],
    "git": [
        {"title": "Git & GitHub Crash Course", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "type": "video", "youtube_id": "RGOj5yH7evk"},
        {"title": "Pro Git Book", "url": "https://git-scm.com/book/en/v2", "type": "docs"}
    ],
    "machine learning": [
        {"title": "Machine Learning Course — Andrew Ng", "url": "https://www.coursera.org/learn/machine-learning", "type": "course"},
        {"title": "ML Crash Course — Google", "url": "https://developers.google.com/machine-learning/crash-course", "type": "course"}
    ],
    "deep learning": [
        {"title": "Deep Learning Specialization — Andrew Ng", "url": "https://www.coursera.org/specializations/deep-learning", "type": "course"},
        {"title": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai/", "type": "course"}
    ],
    "tensorflow": [
        {"title": "TensorFlow Developer Certificate Course", "url": "https://www.youtube.com/watch?v=tPYj3fFJGjk", "type": "video", "youtube_id": "tPYj3fFJGjk"},
        {"title": "TensorFlow Official Tutorials", "url": "https://www.tensorflow.org/tutorials", "type": "docs"}
    ],
    "pytorch": [
        {"title": "PyTorch Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=V_xro1bcAuI", "type": "video", "youtube_id": "V_xro1bcAuI"},
        {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "type": "docs"}
    ],
    "graphql": [
        {"title": "GraphQL Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=ed8SzALpx1Q", "type": "video", "youtube_id": "ed8SzALpx1Q"},
        {"title": "GraphQL Official Docs", "url": "https://graphql.org/learn/", "type": "docs"}
    ],
    "tailwind": [
        {"title": "Tailwind CSS Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=ft30zcMlFao", "type": "video", "youtube_id": "ft30zcMlFao"},
        {"title": "Tailwind CSS Docs", "url": "https://tailwindcss.com/docs", "type": "docs"}
    ],
    "flutter": [
        {"title": "Flutter Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=VPvVD8t02U8", "type": "video", "youtube_id": "VPvVD8t02U8"},
        {"title": "Flutter Official Docs", "url": "https://docs.flutter.dev/", "type": "docs"}
    ],
    "rust": [
        {"title": "Rust Programming Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=BpPEoZW5IiY", "type": "video", "youtube_id": "BpPEoZW5IiY"},
        {"title": "The Rust Book", "url": "https://doc.rust-lang.org/book/", "type": "docs"}
    ],
    "go": [
        {"title": "Go Full Course — freeCodeCamp", "url": "https://www.youtube.com/watch?v=un6ZyFkqFKo", "type": "video", "youtube_id": "un6ZyFkqFKo"},
        {"title": "Go Tour", "url": "https://go.dev/tour/welcome/1", "type": "docs"}
    ],
}

# Estimated learning durations by level
DURATION_MAP = {
    "Beginner": {"short": "1-2 weeks", "medium": "2-3 weeks", "long": "3-4 weeks"},
    "Intermediate": {"short": "2-3 weeks", "medium": "3-4 weeks", "long": "4-6 weeks"},
    "Advanced": {"short": "3-4 weeks", "medium": "4-6 weeks", "long": "6-8 weeks"},
}


def _get_duration(level: str, skill: str) -> str:
    """Estimate learning duration based on level and skill complexity."""
    complex_skills = [
        "machine learning", "deep learning", "kubernetes", "aws",
        "system design", "microservices", "tensorflow", "pytorch"
    ]
    simple_skills = [
        "git", "html", "css", "sql", "bash", "markdown"
    ]

    skill_lower = skill.lower()
    if skill_lower in complex_skills:
        return DURATION_MAP.get(level, DURATION_MAP["Intermediate"])["long"]
    elif skill_lower in simple_skills:
        return DURATION_MAP.get(level, DURATION_MAP["Intermediate"])["short"]
    else:
        return DURATION_MAP.get(level, DURATION_MAP["Intermediate"])["medium"]


YT_CACHE = {}

def fetch_yt_videos(query: str, limit: int = 6) -> List[Dict]:
    if query in YT_CACHE:
        return YT_CACHE[query]
    
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=4).read().decode('utf-8')
        match = re.search(r'var ytInitialData = ({.*?});</script>', html)
        if match:
            data = json.loads(match.group(1))
            videos = []
            contents = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']
            for item in contents:
                if 'videoRenderer' in item:
                    vr = item['videoRenderer']
                    
                    title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                    vid = vr.get('videoId', '')
                    channel = vr.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                    
                    views = vr.get('viewCountText', {}).get('simpleText', '')
                    if not views and 'runs' in vr.get('viewCountText', {}):
                        views = "".join(r.get('text', '') for r in vr.get('viewCountText')['runs'])
                        
                    published = vr.get('publishedTimeText', {}).get('simpleText', '')
                    duration = vr.get('lengthText', {}).get('simpleText', '')
                    
                    videos.append({
                        'title': title,
                        'youtube_id': vid,
                        'url': f"https://www.youtube.com/watch?v={vid}",
                        'type': 'video',
                        'channel': channel,
                        'views': views,
                        'published': published,
                        'duration': duration
                    })
                    if len(videos) >= limit:
                        break
            YT_CACHE[query] = videos
            return videos
    except Exception as e:
        print(f"YT Scrape Error: {e}")
    
    return []

def _get_resources(skill: str) -> List[Dict]:
    """Get dynamic learning resources for a skill."""
    skill_lower = skill.lower()
    
    # Handle aliases
    aliases = {
        "react.js": "react", "reactjs": "react",
        "node": "node.js", "nodejs": "node.js",
        "nextjs": "next.js", "vuejs": "vue",
        "postgres": "postgresql", "mongo": "mongodb",
        "k8s": "kubernetes", "tailwindcss": "tailwind",
        "scikit-learn": "machine learning", "sklearn": "machine learning",
        "pandas": "python", "numpy": "python",
    }
    aliased = aliases.get(skill_lower, skill_lower)
    
    resources = []
    
    # 1. Fetch Dynamic YouTube Videos (top 3 videos to ensure variety)
    yt_videos = fetch_yt_videos(f"{aliased} tutorial for beginners", limit=3)
    resources.extend(yt_videos)
    
    # 2. Add specific curated docs if they exist in templates
    if aliased in RESOURCE_TEMPLATES:
        docs = [r for r in RESOURCE_TEMPLATES[aliased] if r['type'] != 'video']
        resources.extend(docs)
    else:
        # Generic documentation fallbacks utilizing popular tutorial hubs
        sanitized = aliased.replace(" ", "")
        sanitized_dash = aliased.replace(" ", "-")
        resources.extend([
            {"title": f"{skill.title()} Documentation & Guides", "url": f"https://dev.to/t/{sanitized}", "type": "docs"},
            {"title": f"Learn {skill.title()} on freeCodeCamp", "url": f"https://www.freecodecamp.org/news/tag/{sanitized_dash}/", "type": "article"},
        ])
        
    # If network fails and we have absolutely no videos, fallback to generic search string
    if not yt_videos:
        resources.append({"title": f"Search '{skill}' on YouTube", "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial", "type": "video"})
        
    return resources


def _get_description(skill: str, level: str) -> str:
    """Generate a description for a learning step."""
    level_desc = {
        "Beginner": "Learn the fundamentals and core concepts of",
        "Intermediate": "Build practical skills and deeper understanding of",
        "Advanced": "Master advanced concepts and real-world applications of"
    }
    prefix = level_desc.get(level, level_desc["Intermediate"])
    return f"{prefix} {skill}. Practice with hands-on projects and exercises."


from typing import List, Dict, Optional

def generate_roadmap(skill_gaps: List[Dict], resume_skills: Optional[List[Dict]] = None) -> List[Dict]:
    """
    Generate an ordered, dependency-aware learning roadmap from skill gaps.

    Args:
        skill_gaps: List of gap items (missing/weak skills)
        resume_skills: Existing resume skills (to avoid redundant recommendations)

    Returns:
        Ordered list of roadmap steps
    """
    # Collect skills that need learning
    skills_to_learn = []
    for gap in skill_gaps:
        if gap["status"] in ("missing", "weak"):
            skills_to_learn.append({
                "name": gap["skill"],
                "required_level": gap.get("required_level", "Intermediate"),
                "current_level": gap.get("current_level"),
                "status": gap["status"]
            })

    if not skills_to_learn:
        return []

    # Build known skills set from resume
    known_skills = set()
    if resume_skills is not None:
        for s in resume_skills:
            known_skills.add(s["name"].lower())

    # Resolve dependencies — add prerequisite skills if not already known
    all_needed = []
    seen = set()

    def add_with_deps(skill_name: str, level: str):
        key = skill_name.lower()
        if key in seen or key in known_skills:
            return
        seen.add(key)

        # Check dependencies
        deps = SKILL_DEPENDENCIES.get(key, [])
        for dep in deps:
            if dep.lower() not in known_skills:
                add_with_deps(dep, "Beginner")

        all_needed.append({
            "name": skill_name,
            "level": level
        })

    for skill in skills_to_learn:
        level = skill["required_level"]
        if skill["status"] == "weak":
            # Bump up one level from current
            level_map = {"Beginner": "Intermediate", "Intermediate": "Advanced", "Advanced": "Advanced"}
            level = level_map.get(skill.get("current_level", "Beginner"), "Intermediate")
        add_with_deps(skill["name"], level)

    import concurrent.futures

    # Build the roadmap steps
    roadmap = []
    
    # Prepare step metadata sequentially to maintain order and logic
    step_metadata = []
    for i, skill in enumerate(all_needed):
        name = skill["name"]
        level = skill["level"]
        deps = SKILL_DEPENDENCIES.get(name.lower(), [])
        relevant_deps = [d.title() for d in deps if d.lower() in seen]
        
        step_metadata.append({
            "topic": name,
            "level": level,
            "duration": _get_duration(level, name),
            "description": _get_description(name, level),
            "dependencies": relevant_deps,
            "order": i + 1
        })

    # Fetch dynamic resources concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_index = {
            executor.submit(_get_resources, meta["topic"]): idx 
            for idx, meta in enumerate(step_metadata)
        }
        
        results = {}
        for future in concurrent.futures.as_completed(future_to_index):
            idx = future_to_index[future]
            try:
                results[idx] = future.result()
            except Exception as e:
                print(f"Error fetching resources for {step_metadata[idx]['topic']}: {e}")
                results[idx] = []

    # Finalize roadmap while strictly maintaining original dependency sorting
    for idx, meta in enumerate(step_metadata):
        meta["resources"] = results.get(idx, [])
        roadmap.append(meta)

    return roadmap


async def generate_roadmap_ai(skill_gaps: List[Dict], resume_skills: List[Dict] = None) -> List[Dict]:
    """Generate roadmap using available AI APIs (OpenAI -> NVIDIA -> Gemini) or fallback to rule-based."""
    
    # 1. Use rule-based first to get the structure
    base_roadmap = generate_roadmap(skill_gaps, resume_skills)
    if not base_roadmap:
        return []

    topics_list = [step["topic"] for step in base_roadmap]
    prompt = f"""I have a learning roadmap with these topics in order: {json.dumps(topics_list)}

For each topic, provide a one-sentence personalized learning tip.
Return a JSON array of strings (one tip per topic, same order).
Return ONLY valid JSON, no markdown formatting."""

    # 2. Try OpenAI
    try:
        from openai import OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and openai_key != "your_openai_api_key_here":
            client = OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            result = response.choices[0].message.content.strip()
            tips = _parse_json_result(result)
            return _apply_tips(base_roadmap, tips)
    except Exception as e:
        print(f"OpenAI Roadmap Error: {e}")

    # 3. Try NVIDIA NIM (OpenAI-compatible)
    try:
        from openai import OpenAI
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        if nvidia_key and nvidia_key != "your_nvidia_api_key_here":
            client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=nvidia_key
            )
            response = client.chat.completions.create(
                model="meta/llama-3.1-8b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            result = response.choices[0].message.content.strip()
            tips = _parse_json_result(result)
            return _apply_tips(base_roadmap, tips)
    except Exception as e:
        print(f"NVIDIA NIM Roadmap Error: {e}")

    # 4. Try Gemini
    try:
        import google.generativeai as genai
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key and gemini_key != "your_gemini_api_key_here":
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            result = response.text.strip()
            tips = _parse_json_result(result)
            return _apply_tips(base_roadmap, tips)
    except Exception as e:
        print(f"Gemini Roadmap Error: {e}")

    # 5. Fallback to rule-based (already generated)
    return base_roadmap


def _parse_json_result(result: str) -> List[str]:
    if result.startswith("```"):
        result = result.split("\n", 1)[1]
        result = result.rsplit("```", 1)[0]
    return json.loads(result)


def _apply_tips(roadmap: List[Dict], tips: List[str]) -> List[Dict]:
    for i, step in enumerate(roadmap):
        if i < len(tips):
            step["description"] = tips[i]
    return roadmap


# For backward compatibility
async def generate_roadmap_openai(skill_gaps: List[Dict], resume_skills: List[Dict] = None) -> List[Dict]:
    return await generate_roadmap_ai(skill_gaps, resume_skills)
