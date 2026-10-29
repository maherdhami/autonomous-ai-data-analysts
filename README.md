# Autonomous AI Data Analyst - Next.js + FastAPI + Firebase + AWS + Docker

Enterprise-grade, scalable full-stack application architecture migrated from Streamlit.

---

## 🏛️ Modern Target Architecture

```
User (Browser)
      │
      ▼
Next.js 15 Frontend (App Router, TypeScript, Tailwind CSS, ShadCN UI)
      │
      ▼ (HTTP / REST API with Firebase JWT Bearer Tokens)
FastAPI Backend (Python 3.12 Async, Pydantic v2)
  ├── Auth & JWT Verification Middleware
  ├── Multi-Provider LLM Service (Groq Llama 3.1 & OpenAI)
  ├── Pandas Data Engineering Engine
  └── Plotly Chart Generator
      │
      ├──► Firebase Firestore (users, analyses, chat_sessions, messages, uploaded_files)
      ├──► AWS S3 Bucket (Dataset Storage)
      └──► Groq / OpenAI LLM APIs
```

---

## 📁 Repository Directory Structure

```
.
├── frontend/                   # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/                # Pages (Dashboard, Chat, Upload, Analysis, History, Settings, Auth)
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, PlotlyChart, Chat, etc.)
│   │   ├── lib/                # Firebase client, Axios API client
│   │   ├── store/              # Zustand state management
│   │   └── types/              # TypeScript definitions
│   ├── Dockerfile              # Multi-stage production container
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                    # FastAPI Async Python 3.12 Backend
│   ├── app/
│   │   ├── api/v1/             # Router endpoints (auth, analysis, chat, insights, health)
│   │   ├── core/               # Config, Firebase Admin init, Security, Logging
│   │   ├── database/           # Firestore Repository Client
│   │   ├── middleware/         # CORS, Rate Limiting, Auth verification
│   │   ├── models/             # Data models & Firestore schemas
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── services/           # LLM, Chat, Analysis, Insights, Recommendations
│   │   ├── utils/              # Data processing & Plotly chart generators
│   │   └── main.py             # FastAPI entrypoint
│   ├── Dockerfile              # Multi-stage production container
│   └── requirements.txt
├── infrastructure/             # Infrastructure & Deployment Assets
│   ├── terraform/              # AWS ECR, VPC, ECS Fargate, S3 Terraform
│   └── aws-ecs-task-def.json   # AWS Task definition example
├── docs/                       # API Specs & Production Deployment Guides
│   ├── API_DOCUMENTATION.md
│   └── PRODUCTION_DEPLOYMENT_GUIDE.md
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD Pipeline
├── docker-compose.yml          # Full-stack local orchestration
├── .env.example                # Environment variables template
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the full stack with containers:

```bash
# 1. Start containers
docker-compose up --build -d

# 2. Access applications
# Frontend UI: http://localhost:3000
# FastAPI Swagger Docs: http://localhost:8000/docs
# Backend Health API: http://localhost:8000/api/v1/health
```

### Option 2: Running Locally for Development

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Key Deliverables Completed

1. **Complete Folder Structure**: Modular separation into `frontend/`, `backend/`, `infrastructure/`, `docs/`, `.github/`.
2. **Next.js 15 Frontend**: TypeScript, App Router, Tailwind CSS, Zustand, React Query, Plotly integration, Auth Guard.
3. **FastAPI Backend**: Python 3.12, Pydantic v2, Async endpoints, rate limiting, logging, JWT authentication.
4. **Firebase Firestore & Auth**: Firebase Admin SDK integration with fallback mock store for offline testing.
5. **Multi-Stage Docker Setup**: Optimized `Dockerfile` for frontend and backend, plus `docker-compose.yml`.
6. **AWS Infrastructure & CI/CD**: Terraform configuration for AWS ECS Fargate, ECR, S3, CloudFront, and GitHub Actions workflow.
7. **Comprehensive Documentation**: OpenAPI spec, Markdown API docs, and step-by-step deployment guide.
