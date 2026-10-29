# FastAPI Minimum Essential Handbook for AI / ML / GenAI Engineers

---

## 🧭 The AI Engineer's FastAPI Roadmap

### 1. What You Already Know (Prerequisites)
- HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- Simple FastAPI endpoint creation (`@app.get("/")`, `@app.post("/predict")`).
- Basic Pydantic schemas (`class User(BaseModel): name: str`).

### 2. What You Must Learn Next (Core AI API Stack)
1. **Professional AI Project Structure**: Decoupling routers, services, schemas, and database clients.
2. **Async/Await & Streaming**: Handling long LLM response latencies without blocking the server.
3. **Request & Response Handling**: Type validation, query/path parameters, and structured response models.
4. **File Upload Handling**: Parsing PDFs, CSVs, and images for RAG and vision pipelines.
5. **Error Handling**: Gracefully managing rate limits, timeouts, and LLM parsing errors.
6. **Dependency Injection (`Depends`)**: Sharing DB connections, API keys, and LLM instances.
7. **NoSQL Database Integration**: Persisting chat history and metadata in MongoDB/Firestore.
8. **JWT Verification**: Protecting expensive AI endpoints with token validation.
9. **Core AI API Patterns**: Implementing `/chat`, `/summarize`, `/analyze`, and `/generate`.
10. **LangChain, LangGraph & RAG Integration**: Ingesting context and streaming multi-agent workflows.
11. **Docker Containerization**: Packaging FastAPI with AI dependencies into lightweight images.
12. **AWS Deployment**: Hosting containerized AI APIs on AWS App Runner and ECS Fargate.

### 3. What Is Optional (Learn Only If Needed)
- **WebSockets**: Server-Sent Events (SSE) with `StreamingResponse` is simpler and sufficient for 95% of GenAI apps.
- **Celery / Redis Task Queues**: FastAPI's `BackgroundTasks` works fine for lightweight background jobs.
- **Custom Middlewares**: Standard FastAPI CORS middleware is usually all you need.
- **GraphQL / gRPC**: REST endpoints are standard for AI integration.

### 4. What You Can Safely Ignore For Now
- **Full-Stack Frontend Integration**: Focus exclusively on building clean REST APIs.
- **Complex Microservices Architecture**: Monolithic FastAPI containers scale remarkably well.
- **Kubernetes / Helm / Istio**: Managed AWS services (App Runner / ECS Fargate) eliminate cluster management overhead.
- **Complex SQL Schema Migrations (Alembic)**: NoSQL (MongoDB/Firestore) and Vector DBs are better suited for unstructured AI data.

---

## Module 1: Professional FastAPI Project Structure

### 1. Why It Exists
Mixing router definitions, Pydantic models, vector database connections, and OpenAI prompt chains in a single `main.py` file creates unmaintainable code. A modular structure separates concerns so AI logic can be updated without breaking API routes.

### 2. How It Works
FastAPI uses `APIRouter` to split endpoints into modular files. The application entry point (`main.py`) simply imports and mounts these routers.

### 3. How AI Engineers Use It
- `api/`: Endpoint definitions (HTTP request/response handling only).
- `services/`: Core AI logic (OpenAI API calls, LangChain chains, RAG vector searches, Pandas parsing).
- `schemas/`: Input validation and output serialization using Pydantic.
- `database/`: Connections for MongoDB/Firestore and Vector DBs (Chroma/Pinecone/Qdrant).
- `core/`: Application settings and API keys.

### 4. Practical Example

```
backend/
├── app/
│   ├── main.py                 # App entry point & router mounting
│   ├── core/
│   │   └── config.py           # Environment variables (OpenAI/Groq keys)
│   ├── api/
│   │   ├── v1/
│   │   │   ├── chat.py         # /chat & /generate routes
│   │   │   └── rag.py          # /rag/ingest & /rag/query routes
│   ├── services/
│   │   ├── llm_service.py      # OpenAI / Groq Async Client
│   │   └── rag_service.py      # Vector DB retrieval & prompt construction
│   ├── schemas/
│   │   ├── chat.py             # ChatRequest & ChatResponse models
│   │   └── rag.py              # IngestRequest & QueryRequest models
│   └── database/
│       ├── mongodb.py          # Chat history persistence
│       └── vector_store.py     # Embeddings store connection
├── Dockerfile
└── requirements.txt
```

**`app/main.py` Implementation:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, rag

app = FastAPI(title="AI Generation & RAG Service", version="1.0.0")

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat & Generation"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG & Knowledge"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Engine"}
```

---

## Module 2: Async/Await & Streaming Basics for AI APIs

### 1. Why It Exists
LLM API calls (OpenAI, Groq, Anthropic) take 1 to 10 seconds per request. In a synchronous server (`def`), the CPU worker blocks and halts while waiting for network I/O, preventing other requests from being served. With `async def`, the server pauses execution of that endpoint and serves hundreds of concurrent requests while waiting for network responses.

### 2. How It Works
The Python Event Loop executes asynchronous tasks. When an `await` expression is hit (e.g., waiting for LLM tokens over HTTP), control is passed back to the event loop to run other active tasks. Server-Sent Events (SSE) stream tokens to the user as they are generated by the model.

### 3. How AI Engineers Use It
- Non-blocking external HTTP calls to OpenAI, Groq, or local Ollama servers using `httpx.AsyncClient` or `AsyncOpenAI`.
- Real-time token streaming to frontends using FastAPI's `StreamingResponse`.

### 4. Practical Example

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
import async_timeout
import json
import asyncio

router = APIRouter()
client = AsyncOpenAI(api_key="your-api-key")

async def generate_llm_stream(prompt: str):
    """Generator function that yields tokens asynchronously as SSE formatted data."""
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    async for chunk in response:
        content = chunk.choices[0].delta.content or ""
        if content:
            # Server-Sent Event (SSE) format
            yield f"data: {json.dumps({'token': content})}\n\n"
    yield "data: [DONE]\n\n"

@router.post("/stream")
async def stream_chat(prompt: str):
    return StreamingResponse(
        generate_llm_stream(prompt),
        media_type="text/event-stream"
    )
```

---

## Module 3: Request and Response Handling

### 1. Why It Exists
GenAI APIs require strict validation of parameters (temperature, max tokens, prompt length) and must return structured responses (JSON schema) that client applications can reliably process.

### 2. How It Works
FastAPI automatically parses JSON request bodies into Pydantic models. It validates data types, enforces default values, and serializes endpoint output according to the specified `response_model`.

### 3. How AI Engineers Use It
- Defining structured prompt requests (e.g., system instructions, message history, hyperparameters).
- Enforcing structured outputs from LLMs (e.g., extracting JSON metadata, entities, or sentiment).

### 4. Practical Example

```python
from fastapi import APIRouter, Query, Path, status
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()

# Input validation model
class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000, description="Source text for AI analysis")
    categories: List[str] = Field(default=["sentiment", "summary"], description="Analysis tasks to perform")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0, description="Sampling temperature")

# Output response model
class Entity(BaseModel):
    name: str
    label: str

class AnalysisResponse(BaseModel):
    summary: str
    sentiment: str
    entities: List[Entity]
    tokens_used: int

@router.post(
    "/analyze/{project_id}",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK
)
async def analyze_text(
    payload: AnalysisRequest,
    project_id: str = Path(..., description="Target Project ID"),
    include_raw: bool = Query(default=False, description="Include raw LLM output flag")
):
    # Simulated structured AI processing
    result = AnalysisResponse(
        summary=f"Processed text of length {len(payload.text)} for project {project_id}",
        sentiment="Positive",
        entities=[Entity(name="FastAPI", label="Framework")],
        tokens_used=142
    )
    return result
```

---

## Module 4: File Upload Handling (CSV, PDF, Images)

### 1. Why It Exists
RAG systems process PDFs, data analysis agents operate on CSV files, and vision models process images. Endpoints must accept multi-part form data uploads without saving unnecessary temporary files to disk.

### 2. How It Works
FastAPI uses `UploadFile` (backed by Python's `SpooledTemporaryFile`) to stream incoming bytes in chunks asynchronously. `file.read()` retrieves the file buffer in memory as bytes.

### 3. How AI Engineers Use It
- **PDFs**: Ingest into `pypdf` or `pdfplumber` to chunk text for vector embeddings.
- **CSVs/Excels**: Ingest into `pandas.read_csv()` via `io.BytesIO` for data processing agents.
- **Images**: Pass binary data directly to multi-modal LLM APIs (e.g., GPT-4 Vision, Claude 3.5 Sonnet).

### 4. Practical Example

```python
from fastapi import APIRouter, UploadFile, File, HTTPException, status
import pandas as pd
import io
import pypdf

router = APIRouter()

@router.post("/process/document")
async def process_document(
    file: UploadFile = File(..., description="Upload PDF or CSV for AI ingestion")
):
    filename = file.filename.lower()
    
    # 1. Validate file format
    if not (filename.endswith(".pdf") or filename.endswith(".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF and CSV files are allowed."
        )

    # 2. Read bytes asynchronously
    contents = await file.read()

    # 3. Process CSV for Pandas Analysis Agent
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
        return {
            "file_type": "csv",
            "filename": file.filename,
            "row_count": len(df),
            "columns": list(df.columns),
            "sample_data": df.head(2).to_dict(orient="records")
        }

    # 4. Process PDF for RAG Embeddings Ingestion
    if filename.endswith(".pdf"):
        pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() or ""
            
        return {
            "file_type": "pdf",
            "filename": file.filename,
            "total_pages": len(pdf_reader.pages),
            "character_count": len(extracted_text),
            "text_preview": extracted_text[:300]
        }
```

---

## Module 5: Error Handling for AI APIs

### 1. Why It Exists
AI infrastructure commonly fails due to rate limits (429), context length limits, invalid API keys, timeout errors, or bad JSON generation. Unhandled errors crash requests with uninformative `500 Internal Server Errors`.

### 2. How It Works
FastAPI provides `HTTPException` for returning standard HTTP error codes. You can also register custom global `@app.exception_handler` functions to catch specific AI exceptions (e.g., `openai.RateLimitError`) application-wide.

### 3. How AI Engineers Use It
- Catching LLM API failures and converting them to clear user messages.
- Handling timeout exceptions during long vector database searches.
- Intercepting structured output parsing failures and returning fallback responses.

### 4. Practical Example

```python
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
import httpx

router = APIRouter()

class LLMServiceException(Exception):
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code

@router.post("/generate-safe")
async def generate_content_safe(prompt: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Simulate call to third-party LLM service
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": "Bearer invalid_key"},
                json={"model": "llama-3.1-8b-instant", "messages": [{"role": "user", "content": prompt}]}
            )
            
            if response.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="AI Provider Rate Limit Exceeded. Please try again in 60 seconds."
                )
                
            response.raise_for_status()
            return response.json()

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI model took too long to respond. Request timed out."
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Upstream AI service error: {exc.response.text}"
        )
```

---

## Module 6: Dependency Injection (`Depends`)

### 1. Why It Exists
Endpoints need access to shared objects (database connections, vector store clients, API keys, current user context). Re-instantiating these in every route creates memory leaks and duplicate code.

### 2. How It Works
FastAPI evaluates dependencies defined with `Depends(func)`. It executes `func` before the endpoint logic, resolves any sub-dependencies, and injects the return value directly into the endpoint's function parameters.

### 3. How AI Engineers Use It
- Reusing global Vector DB instances (Chroma/Qdrant/Pinecone) across requests.
- Validating custom API keys (`X-API-Key`) for enterprise client access.
- Injecting authenticated user sessions to retrieve user-specific chat memory.

### 4. Practical Example

```python
from fastapi import APIRouter, Depends, Header, HTTPException, status
from typing import Annotated

router = APIRouter()

# 1. Dependency for API Key Validation
async def verify_ai_api_key(x_api_key: Annotated[str, Header(...)]):
    if x_api_key != "secret-enterprise-key-123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header"
        )
    return x_api_key

# 2. Dependency for Mock Vector DB Connection
class VectorDBClient:
    def search(self, query: str):
        return [f"Context chunk 1 for '{query}'", f"Context chunk 2 for '{query}'"]

def get_vector_db():
    # In production, returns a singleton client connection
    client = VectorDBClient()
    return client

# 3. Endpoint consuming injected dependencies
@router.post("/search-context")
async def search_context(
    query: str,
    api_key: str = Depends(verify_ai_api_key),
    vector_db: VectorDBClient = Depends(get_vector_db)
):
    results = vector_db.search(query)
    return {
        "authenticated_with": api_key[:5] + "***",
        "query": query,
        "retrieved_context": results
    }
```

---

## Module 7: Lightweight Database Integration (MongoDB / Firebase)

### 1. Why It Exists
AI applications require flexible NoSQL storage for semi-structured data: conversational message histories (`[{role, content}]`), prompt logs, document metadata, and user feedback.

### 2. How It Works
NoSQL databases store documents as JSON object trees, matching Pydantic schemas without complex SQL joins or table migrations. `motor` provides an async Python driver for MongoDB.

### 3. How AI Engineers Use It
- Persisting chat session history across multiple turns.
- Storing document metadata (filename, chunk count, upload timestamp) alongside vector embeddings.

### 4. Practical Example (Async MongoDB with Motor)

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from datetime import datetime

router = APIRouter()

# MongoDB Client Setup
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ai_platform_db

class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str

class SaveHistoryRequest(BaseModel):
    session_id: str
    messages: List[ChatMessage]

@router.post("/history/save")
async def save_chat_history(payload: SaveHistoryRequest):
    document = {
        "session_id": payload.session_id,
        "messages": [msg.model_dump() for msg in payload.messages],
        "updated_at": datetime.utcnow()
    }
    
    # Async upsert operation
    await db.chat_sessions.update_one(
        {"session_id": payload.session_id},
        {"$set": document},
        upsert=True
    )
    return {"status": "success", "session_id": payload.session_id}

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        return {"session_id": session_id, "messages": []}
    return session
```

---

## Module 8: JWT Verification & Protected Routes

### 1. Why It Exists
Executing AI models and RAG queries incurs real API costs. Endpoints must be protected by validating JSON Web Tokens (JWT) sent by authorized clients.

### 2. How It Works
The client passes a `Bearer <token>` string in the HTTP `Authorization` header. FastAPI's `HTTPBearer` security wrapper extracts the token, and the backend verifies its cryptographic signature using `pyjwt`.

### 3. How AI Engineers Use It
- Extracting the authenticated user's ID (`user_id`) to isolate document search index access.
- Restricting high-cost endpoints (e.g. fine-tuning triggers, batch embeddings) to authorized tier users.

### 4. Practical Example

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = "your-jwt-secret-key"
ALGORITHM = "HS256"

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.post("/protected/generate")
async def protected_generate(
    prompt: str,
    user_id: str = Depends(get_current_user_id)
):
    return {
        "status": "authorized",
        "user_id": user_id,
        "ai_response": f"Generated result for user {user_id} based on prompt: '{prompt}'"
    }
```

---

## Module 9: Building Core AI Endpoints (`/chat`, `/summarize`, `/analyze`, `/generate`)

### 1. Why It Exists
AI backends serve consistent core endpoints that power frontend applications, chatbots, and reporting dashboards.

### 2. How It Works
Each route encapsulates prompt construction, model execution (or streaming), and output formatting for its specific task.

### 3. How AI Engineers Use It
Exposing standard REST contracts for multi-turn conversational agents, text summarization, entity analysis, and content generation.

### 4. Practical Example

```python
from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Input/Output Schemas
class SummarizeRequest(BaseModel):
    document_text: str
    max_length: int = 150

class SummarizeResponse(BaseModel):
    summary: str
    original_char_count: int
    summary_char_count: int

class GenerateRequest(BaseModel):
    topic: str
    tone: str = "professional"

# 1. Summarization Endpoint
@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(payload: SummarizeRequest):
    # Simulated LLM summarization call
    summary_text = f"Summary of document ({payload.document_text[:50]}...): Extracted core takeaways."
    return SummarizeResponse(
        summary=summary_text,
        original_char_count=len(payload.document_text),
        summary_char_count=len(summary_text)
    )

# 2. Generation Endpoint
@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_endpoint(payload: GenerateRequest):
    # Simulated content generation
    generated_content = f"Draft article about '{payload.topic}' written in a {payload.tone} tone."
    return {
        "topic": payload.topic,
        "tone": payload.tone,
        "generated_content": generated_content
    }
```

---

## Module 10: FastAPI with LangChain, LangGraph, and RAG

### 1. Why It Exists
Production GenAI applications build upon framework abstractions like LangChain (for prompt chaining & vector retrieval) and LangGraph (for multi-step stateful agent workflows). FastAPI serves as the HTTP delivery layer for these chains.

### 2. How It Works
LangChain chains and LangGraph agents are instantiated in service files and invoked asynchronously via `.ainvoke()` or `.astream()` inside FastAPI route handlers.

### 3. How AI Engineers Use It
- Exposing RAG endpoints (`/rag/ingest` and `/rag/query`) backed by vector databases.
- Triggering autonomous agent state machines via REST API requests.

### 4. Practical Example

```python
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import io
import pypdf

# LangChain Imports (Mocked for demonstration pattern)
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

router = APIRouter()

class RAGQueryRequest(BaseModel):
    question: str
    top_k: int = 3

class RAGQueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]

# Global vector store state (in production, use persistent Qdrant/Chroma/Pinecone)
vector_store = None

@router.post("/rag/ingest")
async def ingest_rag_pdf(file: UploadFile = File(...)):
    global vector_store
    contents = await file.read()
    
    # 1. Parse PDF
    pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
    text_chunks = [page.extract_text() for page in pdf_reader.pages if page.extract_text()]
    
    if not text_chunks:
        raise HTTPException(status_code=400, detail="No readable text found in PDF")
        
    # 2. Ingest into Vector Store (using hypothetical embeddings)
    # vector_store = await FAISS.afrom_texts(text_chunks, embeddings_model)
    
    return {
        "filename": file.filename,
        "chunks_ingested": len(text_chunks),
        "status": "Vector embeddings indexed successfully"
    }

@router.post("/rag/query", response_model=RAGQueryResponse)
async def query_rag_pipeline(payload: RAGQueryRequest):
    # Simulated retrieval & LLM generation via LangChain
    mock_sources = [
        "Document Chunk 1: FastAPI handles async web requests cleanly.",
        "Document Chunk 2: LangChain manages context retrieval pipelines."
    ]
    mock_answer = f"Based on retrieved documents, '{payload.question}' was answered accurately."
    
    return RAGQueryResponse(
        question=payload.question,
        answer=mock_answer,
        sources=mock_sources
    )
```

---

## Module 11: Dockerizing FastAPI for AI Applications

### 1. Why It Exists
Packaging the FastAPI server, Python dependencies (PyTorch, LangChain, Pandas), and environment configurations into a Docker container guarantees consistent execution across local development and cloud production environments.

### 2. How It Works
Docker builds a container image layer-by-layer based on instructions in a `Dockerfile`. The container runs as an isolated process on the host machine.

### 3. How AI Engineers Use It
- Building slim, containerized deployment images while caching heavy pip installations.
- Running multi-container setups (FastAPI + MongoDB + Local Vector DB) locally via `docker-compose`.

### 4. Practical Example

**Production `Dockerfile`:**
```dockerfile
# Use lightweight official Python runtime
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies required for PDF parsing and C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Launch application with Uvicorn worker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Local Orchestration `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  ai-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MONGO_URI=mongodb://mongo:27017
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## Module 12: Deploying FastAPI on AWS

### 1. Why It Exists
Once built and containerized, your AI backend must be deployed to scalable cloud infrastructure with public HTTPS access and secure secret management.

### 2. How It Works
The Docker container image is pushed to Amazon Elastic Container Registry (ECR). AWS App Runner or AWS ECS Fargate pulls the container image and runs it as a serverless container service with automatic CPU/Memory scaling.

### 3. How AI Engineers Use It
Hosting production AI backends without managing underlying Linux virtual machines or Kubernetes control planes.

### 4. Practical Step-by-Step Deployment Workflow

#### Step 1: Push Container to Amazon ECR
```bash
# 1. Authenticate Docker CLI to Amazon ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Create ECR repository
aws ecr create-repository --repository-name ai-fastapi-backend

# 3. Tag and push Docker image
docker tag ai-fastapi-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ai-fastapi-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ai-fastapi-backend:latest
```

#### Step 2: Deploy on AWS App Runner (Easiest & Fastest for AI Engineers)
1. Open **AWS App Runner** Console -> Click **Create Service**.
2. Source: Select **Container registry** -> **Amazon ECR**.
3. Choose your repository `ai-fastapi-backend` and tag `latest`.
4. Deployment trigger: Select **Automatic** (deploys automatically when new images are pushed).
5. Configure Service:
   - Port: `8000`
   - CPU: `1 vCPU`, Memory: `2 GB`
   - Environment Variables: Add `OPENAI_API_KEY`, `GROQ_API_KEY`, etc.
6. Click **Create & Deploy**. AWS provides an automatic HTTPS endpoint (e.g. `https://xxx.us-east-1.awsapprunner.com`).

#### Step 3: Secrets & API Keys Best Practices
- **Never hardcode secrets** in `Dockerfile` or source code.
- Pass environment variables securely via AWS App Runner settings or AWS Secrets Manager.
- Use Python's `pydantic-settings` to parse configuration cleanly in `app/core/config.py`.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    GROQ_API_KEY: str
    MONGO_URI: str = "mongodb://localhost:27017"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 🎯 Summary Matrix: Minimum Essential FastAPI Knowledge

| Category | Recommended Focus | Status |
| :--- | :--- | :--- |
| **Foundations** | HTTP Verbs, Basic Endpoints, Basic Pydantic | ✅ *Already Known* |
| **Architecture** | Professional Folder Structure (`api/`, `services/`, `schemas/`) | ⚡ *Must Master* |
| **Performance** | `async def`, `httpx.AsyncClient`, `StreamingResponse` (SSE) | ⚡ *Must Master* |
| **Data I/O** | `UploadFile`, `BytesIO`, PDF & CSV processing for RAG | ⚡ *Must Master* |
| **Reliability** | `HTTPException`, rate limit/timeout error handlers | ⚡ *Must Master* |
| **Reuse** | `Depends()` for DBs, Auth, and Vector Stores | ⚡ *Must Master* |
| **Persistence** | MongoDB/Firestore for chat history & metadata | ⚡ *Must Master* |
| **Security** | JWT Token verification & Bearer headers | ⚡ *Must Master* |
| **AI Integration**| `/chat`, `/summarize`, `/analyze`, LangChain, LangGraph | ⚡ *Must Master* |
| **DevOps** | Single-stage/Multi-stage Dockerfile & AWS App Runner | ⚡ *Must Master* |
| **WebSockets** | Real-time bi-directional streaming | 💡 *Optional* |
| **Full Stack** | Microservices, Alembic, React, Kubernetes | ❌ *Ignore for Now* |
