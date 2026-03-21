# AI-Adaptive Onboarding Engine

An AI-powered web application that analyzes resumes against job descriptions, identifies skill gaps, and generates personalized learning roadmaps.

![Dark Theme](https://img.shields.io/badge/theme-dark-111318) ![Gold Accents](https://img.shields.io/badge/accent-gold-D4A017) ![React](https://img.shields.io/badge/frontend-React-61DAFB) ![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)

## Features

- **Resume Parsing** — Upload PDF/DOCX resumes for intelligent skill extraction
- **Job Description Analysis** — Paste any JD to extract required skills
- **Skill Gap Visualization** — Radar + bar charts showing your coverage
- **Learning Roadmap** — Dependency-aware, ordered path with curated resources
- **PDF Export** — Download your roadmap as a PDF
- **Demo Mode** — Try it instantly with pre-built sample data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Recharts |
| Backend | Python, FastAPI, PyPDF2, python-docx |
| AI | OpenAI API (optional), keyword-based NLP (built-in fallback) |

## Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.9+

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Add OpenAI key
copy .env.example .env
# Edit .env with your OPENAI_API_KEY

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Open App

Visit **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Upload resume + JD for full analysis |
| `GET` | `/api/demo` | Get pre-built demo data |
| `GET` | `/health` | Health check + OpenAI status |

## Project Structure

```
AI-Onboarding-Engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/analysis.py  # API endpoints
│   │   ├── services/
│   │   │   ├── parser.py        # PDF/DOCX parsing
│   │   │   ├── skill_extractor.py # Skill extraction (200+ skills)
│   │   │   ├── gap_analyzer.py  # Gap comparison engine
│   │   │   └── roadmap_generator.py # Learning path builder
│   │   └── models/schemas.py    # Pydantic models
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SkillGapChart.jsx
│   │   │   ├── SkillCard.jsx
│   │   │   └── RoadmapTimeline.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Results.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Screenshots

1. **Dashboard** — Hero section with feature cards
2. **Upload** — Drag-and-drop resume + JD input
3. **Results** — Skill gap charts + learning roadmap timeline

## License

MIT
