"""
Skill extraction engine.
Uses keyword-based NLP as default, with optional OpenAI enhancement.
"""

import os
import re
import json
from typing import List, Dict

# Comprehensive skill database organized by category
SKILL_DATABASE = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "c",
        "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala",
        "r", "matlab", "perl", "lua", "dart", "elixir", "haskell",
        "objective-c", "assembly", "sql", "nosql", "bash", "shell",
        "powershell", "groovy", "clojure", "fortran", "cobol"
    ],
    "Frontend Frameworks": [
        "react", "reactjs", "react.js", "angular", "angularjs", "vue",
        "vuejs", "vue.js", "svelte", "next.js", "nextjs", "nuxt",
        "nuxtjs", "gatsby", "ember", "backbone", "jquery", "bootstrap",
        "tailwind", "tailwindcss", "material ui", "chakra ui",
        "styled-components", "sass", "scss", "less", "webpack", "vite",
        "rollup", "parcel", "storybook", "framer motion"
    ],
    "Backend Frameworks": [
        "node.js", "nodejs", "express", "expressjs", "fastapi", "django",
        "flask", "spring", "spring boot", "rails", "ruby on rails",
        "asp.net", ".net", "laravel", "symphony", "gin", "fiber",
        "fastify", "nest.js", "nestjs", "koa", "hapi", "actix"
    ],
    "Databases": [
        "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
        "oracle", "sql server", "dynamodb", "cassandra", "couchdb",
        "firebase", "firestore", "supabase", "neo4j", "elasticsearch",
        "mariadb", "cockroachdb", "influxdb", "memcached"
    ],
    "Cloud & DevOps": [
        "aws", "amazon web services", "azure", "gcp", "google cloud",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
        "ci/cd", "github actions", "gitlab ci", "circleci", "travis ci",
        "nginx", "apache", "heroku", "vercel", "netlify", "digitalocean",
        "cloudflare", "linux", "ubuntu", "centos", "helm", "istio",
        "prometheus", "grafana", "datadog", "new relic", "serverless",
        "lambda", "cloud functions", "ecs", "eks", "fargate"
    ],
    "AI / ML": [
        "machine learning", "deep learning", "tensorflow", "pytorch",
        "keras", "scikit-learn", "sklearn", "pandas", "numpy", "scipy",
        "matplotlib", "seaborn", "jupyter", "nlp", "natural language processing",
        "computer vision", "opencv", "transformers", "hugging face",
        "langchain", "openai", "gpt", "llm", "bert", "neural networks",
        "reinforcement learning", "generative ai", "stable diffusion",
        "rag", "vector database", "pinecone", "weaviate", "chromadb",
        "data science", "data analysis", "feature engineering"
    ],
    "Mobile": [
        "react native", "flutter", "swift", "swiftui", "kotlin",
        "android", "ios", "xamarin", "ionic", "cordova", "capacitor",
        "expo", "mobile development"
    ],
    "Tools & Practices": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "agile", "scrum", "kanban", "tdd", "unit testing", "jest",
        "mocha", "pytest", "cypress", "selenium", "playwright",
        "postman", "swagger", "graphql", "rest", "restful", "api",
        "microservices", "monorepo", "design patterns", "solid",
        "clean architecture", "ddd", "event-driven", "message queue",
        "rabbitmq", "kafka", "websocket", "grpc", "oauth", "jwt",
        "authentication", "authorization", "security", "figma",
        "adobe xd", "sketch"
    ]
}

# Flatten for quick lookup
ALL_SKILLS = {}
for category, skills in SKILL_DATABASE.items():
    for skill in skills:
        ALL_SKILLS[skill.lower()] = category


def extract_skills_keyword(text: str) -> List[Dict]:
    """Extract skills from text using keyword matching."""
    text_lower = text.lower()
    # Normalize common separators
    text_normalized = re.sub(r'[,;|•·▪►→]', ' ', text_lower)
    text_normalized = re.sub(r'\s+', ' ', text_normalized)

    found_skills = []
    seen = set()

    for skill, category in ALL_SKILLS.items():
        if skill in seen:
            continue

        # Use strict regex to avoid substring matching (e.g. "go" in "algorithm", "react" in "reactor")
        pattern = r'(?<![a-zA-Z])' + re.escape(skill) + r'(?![a-zA-Z])'
        if re.search(pattern, text_normalized):
            display_name = skill.title() if len(skill) > 2 else skill.upper()
            display_name = _fix_display_name(display_name)
            found_skills.append({
                "name": display_name,
                "level": _estimate_level(text_lower, skill),
                "category": category
            })
            seen.add(skill)

    return found_skills


def _fix_display_name(name: str) -> str:
    """Fix display names for specific tech terms."""
    fixes = {
        "Reactjs": "ReactJS", "React.Js": "React.js",
        "Vuejs": "VueJS", "Vue.Js": "Vue.js",
        "Nodejs": "Node.js", "Node.Js": "Node.js",
        "Nextjs": "Next.js", "Next.Js": "Next.js",
        "Nestjs": "NestJS", "Nest.Js": "Nest.js",
        "Expressjs": "Express.js", "Angularjs": "AngularJS",
        "Fastapi": "FastAPI", "Mongodb": "MongoDB",
        "Postgresql": "PostgreSQL", "Mysql": "MySQL",
        "Graphql": "GraphQL", "Nosql": "NoSQL",
        "Typescript": "TypeScript", "Javascript": "JavaScript",
        "Tensorflow": "TensorFlow", "Pytorch": "PyTorch",
        "Opencv": "OpenCV", "Aws": "AWS", "Gcp": "GCP",
        "Ci/Cd": "CI/CD", "Jwt": "JWT", "Oauth": "OAuth",
        "Sql": "SQL", "Html": "HTML", "Css": "CSS",
        "Tailwindcss": "TailwindCSS", "Sklearn": "Scikit-learn",
        "Scikit-Learn": "Scikit-learn", "Llm": "LLM",
        "Nlp": "NLP", "Gpt": "GPT", "Bert": "BERT",
        "Rag": "RAG", "Grpc": "gRPC", "Ddd": "DDD",
        "Tdd": "TDD", "K8S": "K8s",
    }
    return fixes.get(name, name)


def _estimate_level(text: str, skill: str) -> str:
    """Estimate proficiency level based on context clues."""
    # Look for experience indicators near the skill mention
    advanced_indicators = [
        "expert", "advanced", "senior", "lead", "architect",
        "5+ years", "6+ years", "7+ years", "8+ years", "10+ years",
        "extensive experience", "deep knowledge", "mastery"
    ]
    intermediate_indicators = [
        "intermediate", "proficient", "experienced", "familiar",
        "2+ years", "3+ years", "4+ years", "working knowledge",
        "hands-on experience", "solid understanding"
    ]

    # Search in a window around skill mentions
    skill_pos = text.find(skill)
    if skill_pos != -1:
        window_start = max(0, skill_pos - 200)
        window_end = min(len(text), skill_pos + 200)
        window = text[window_start:window_end]

        for indicator in advanced_indicators:
            if indicator in window:
                return "Advanced"
        for indicator in intermediate_indicators:
            if indicator in window:
                return "Intermediate"

    return "Intermediate"  # Default assumption for listed skills


async def extract_skills_openai(text: str, context: str = "resume") -> List[Dict]:
    """Extract skills using OpenAI API for better accuracy."""
    try:
        from openai import OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_openai_api_key_here":
            return extract_skills_keyword(text)

        client = OpenAI(api_key=api_key)

        prompt = f"""Analyze the following {context} text and extract all technical and professional skills.
For each skill, determine:
1. The exact skill name (use proper casing like "React.js", "Node.js", "AWS")
2. Proficiency level: "Beginner", "Intermediate", or "Advanced" (based on context clues)
3. Category: one of "Programming Languages", "Frontend Frameworks", "Backend Frameworks", "Databases", "Cloud & DevOps", "AI / ML", "Mobile", "Tools & Practices"

Return a JSON array of objects with keys: "name", "level", "category"

Text:
{text[:3000]}

Return ONLY valid JSON, no markdown formatting."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2000
        )

        result = response.choices[0].message.content.strip()
        # Clean up potential markdown formatting
        if result.startswith("```"):
            result = result.split("\n", 1)[1]
            result = result.rsplit("```", 1)[0]

        skills = json.loads(result)
        return skills

    except Exception:
        # Fallback to keyword extraction
        return extract_skills_keyword(text)
