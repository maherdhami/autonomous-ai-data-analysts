# ⚡ Autonomous AI Data Analyst Studio

An enterprise-grade, high-performance, and **stateless** AI Data Analyst platform built with **Next.js 14**, **FastAPI (Python 3.12)**, **Groq Llama 3.1 8B**, and **Plotly.js**.

Transform raw business datasets (CSV, Excel) into automated data quality audits, deep statistical BI insights, dynamic interactive visualizations, and C-suite strategic roadmaps in seconds.

---

## 🌟 Key Features

### 1. 📌 4-Layer Autonomous Analysis Pipeline
* **Output 1 — Data Overview & Quality Assessment**: Automated structural hygiene checks, missing value ratios, duplicate detection, and health scoring (0–100).
* **Output 2 — Business Analysis & Profiling**: Key statistical distributions, revenue drivers, churn factors, and business metric interpretations.
* **Output 3 — Interactive Visualizations**: Dynamic high-fidelity Plotly charts synthesized automatically from numerical and categorical fields.
* **Output 4 — Executive Strategy Roadmap**: Actionable executive recommendations, operational initiatives, and strategic growth tactics.

### 2. 💬 AI Chat Analyst (Dual Mode)
* **Option 1: Code Q&A**: Generates and executes Python code against the active dataframe, returning exact calculation outputs.
* **Option 2: Strategic Q&A**: Provides contextual business reasoning and executive commentary based on dataset characteristics.

### 3. 🛡️ Stateless & Privacy-First Architecture
* **Zero Persistence**: No database (no Firestore, SQL, or MongoDB) storing company datasets.
* **In-Memory Streaming**: Files are processed in memory per session — zero files saved to disk.
* **Zero History Retention**: Once the browser session closes, no stale historical data remains.

---

## 🏛️ System Architecture

```
User (Browser)
      │
      ▼
Next.js 14 Frontend (App Router, TypeScript, Tailwind CSS, Zustand, Plotly.js)
      │  [Hosted on Vercel]
      │
      ▼ (REST API / CORS Enabled)
FastAPI Backend (Python 3.12 Async, Pydantic v2, Pandas, Plotly)
      │  [Hosted on Render]
      │
      ├──► In-Memory Session Engine (BytesIO / DataFrame)
      └──► Groq Cloud (Llama 3.1 8B Instant) / OpenAI API
```

---

## 📁 Repository Directory Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/             # Modular API endpoints (upload, analysis, summary, viz, chat)
│   │   ├── core/               # App configuration, logging, settings
│   │   ├── middleware/         # Open CORS middleware (Vercel-ready)
│   │   ├── schemas/            # Strict Pydantic v2 validation models
│   │   ├── services/           # LLM engine, chat, business analysis, visualization services
│   │   ├── utils/              # Data processing & Plotly chart generators
│   │   └── main.py             # FastAPI entrypoint
│   ├── main.py                 # Direct re-export entrypoint for Render (uvicorn main:app)
│   ├── Dockerfile              # Production container build
│   └── requirements.txt        # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                # App Router pages (Dashboard, Upload, Analysis, Chat, Settings)
│   │   ├── components/         # High-fidelity UI (Navbar, Sidebar, PlotlyChart, ChatInterface)
│   │   ├── lib/                # Axios API client configured with dynamic base URL
│   │   ├── store/              # Zustand state store
│   │   └── types/              # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docs/                       # Technical architecture & deployment masterclasses
├── render.yaml                 # Render infrastructure-as-code Blueprint
├── vercel.json                 # Vercel deployment configuration
├── docker-compose.yml          # Containerized local execution
├── .env.example                # Template environment variables
└── README.md
```

---

## 🚀 Live Cloud Deployment

### 1. Backend on Render

1. Create a **New Web Service** connected to this repository.
2. Configure settings:
   * **Root Directory**: `backend` (or leave root with `uvicorn main:app`)
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Environment Variables:
   * `PYTHON_VERSION`: `3.12.0`
   * `ENVIRONMENT`: `production`
   * `GROQ_API_KEY`: `your_groq_api_key_here`

### 2. Frontend on Vercel

1. Import the repository in Vercel.
2. Configure settings:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `frontend`
3. Environment Variable:
   * `NEXT_PUBLIC_API_BASE_URL`: `https://your-render-backend.onrender.com/api/v1`
4. Click **Deploy**.

---

## 💻 Local Development Setup

### Prerequisites
* **Python**: 3.12+
* **Node.js**: 18+ or 20+
* **Groq API Key**: [Get a free key at console.groq.com](https://console.groq.com)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
FastAPI Swagger documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to launch the application.

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build
```

---

## 🔑 Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `GROQ_API_KEY` | Backend | Groq API Key for Llama-3.1-8b-instant inference |
| `OPENAI_API_KEY` | Backend | Optional fallback OpenAI key |
| `ENVIRONMENT` | Backend | `production` or `development` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | URL of the backend API (e.g. `http://localhost:8000/api/v1`) |

---

## 📄 License
MIT License. Built for enterprise data intelligence and modern AI agent workflows.
