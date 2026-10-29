# Backend Architecture & Cloud Systems Masterclass
### *From Beginner to Senior Staff Backend Architect*

---

## 📚 Masterclass Curriculum Overview

- **Phase 0**: Software Architecture First Principles & Fundamentals
- **Phase 1**: System Architecture & Data Flow Deep Dive
- **Phase 2**: Backend Foundations with Python & FastAPI
- **Phase 3**: Enterprise Backend Directory Structure & Clean Architecture
- **Phase 4**: Database Engineering with Firebase Firestore
- **Phase 5**: Authentication, JWTs & Security Engineering
- **Phase 6**: AI Service Layer & LLM Pipeline Architecture
- **Phase 7**: Production File Upload Systems & Data Pipelines
- **Phase 8**: Containerization with Docker & Docker Compose
- **Phase 9**: Cloud Infrastructure Engineering with AWS
- **Phase 10**: Enterprise API Security & Defensive Engineering
- **Phase 11**: DevOps, CI/CD & Automated Deployment Pipelines
- **Phase 12**: Production Observability, Monitoring & Failure Recovery
- **Phase 13**: End-to-End Execution Walkthrough

---

# Phase 0: Software Architecture First Principles

### 1. What is Software Architecture?
Software architecture is the structural layout of a system: its software components, the relationships between them, and the properties of both the components and the relationships. Architecture defines how data moves, where logic executes, how systems scale, and how failures are contained.

#### Analogy: Building a Skyscraper vs. a House
- A small wooden shed can be built without blueprints (writing a 100-line script).
- A 100-story skyscraper requires structural engineering, plumbing blueprints, electrical grids, and fire escape designs before groundbreaking. That blueprint is **Software Architecture**.

---

### 2. Architecture Patterns Evolution

```
┌────────────────────────────────────────────────────────┐
│                   MONOLITH                             │
│  [ UI ] ──► [ Business Logic ] ──► [ Database Access ] │
│  (All running inside one single process & codebase)    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│              MODULAR MONOLITH (Our FastAPI)            │
│  [ API Router ]                                        │
│     ├── [ Auth Domain ] ──► Firestore / Auth           │
│     ├── [ Analysis Domain ] ──► Data Engine            │
│     └── [ AI Chat Domain ] ──► LLM Service             │
│  (Single deployment unit, strictly separated modules)  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   MICROSERVICES                        │
│  [ UI ] ──► [ API Gateway ]                            │
│                 ├──► [ Auth Microservice ]             │
│                 ├──► [ Analysis Microservice ]         │
│                 └──► [ AI Chat Microservice ]          │
│  (Each service is a separate project, DB, & container) │
└────────────────────────────────────────────────────────┘
```

#### A. Monolith Architecture
* **What it is**: Entire application (UI, Backend, Database logic) bundled into one codebase and executed inside a single operating system process (e.g., standard Streamlit apps).
* **Pros**: Simple to write initially, easy to deploy locally.
* **Cons**: Tight coupling. If AI calculation crashes, the entire UI freezes. Cannot scale specific components independently.

#### B. Modular Monolith (Our FastAPI Target Architecture)
* **What it is**: Single codebase and single deployment unit, but internally organized into decoupled, independent domain modules (`auth`, `analysis`, `chat`, `services`).
* **Why Professionals Choose It**: Offers 90% of the benefits of microservices without the network latency and DevOps complexity.

#### C. Microservices Architecture
* **What it is**: Breaking an app into multiple smaller web services running on separate servers communicating via HTTP/gRPC.
* **Pros**: Independent scaling, separate deployment pipelines per team.
* **Cons**: Massive network overhead, complex distributed tracing, high cloud costs.

#### D. Serverless Architecture
* **What it is**: Running functions on demand (e.g., AWS Lambda) where servers are managed dynamically by the cloud provider.

---

### 3. Core Architectural Concepts

#### Client vs. Server vs. Database
- **Client**: The request initiator (e.g., Browser running Next.js, Mobile App). It presents the interface to the user.
- **Server**: The processing node (e.g., FastAPI running Python 3.12). It validates business rules, checks security permissions, processes computations, and communicates with external services.
- **Database**: The persistence engine (e.g., Firebase Firestore). Computers lose RAM memory when restarted; databases persist data to durable storage.

#### Request / Response Cycle
```
Client (Browser) ─── HTTP GET /api/v1/analysis/history ───► Backend (FastAPI)
                                                                 │
                                                    Query Firestore DB
                                                                 │
Client (Browser) ◄─── HTTP 200 OK (JSON Payload) ────────────────┘
```

#### HTTP & REST APIs
- **HTTP (HyperText Transfer Protocol)**: The standard application protocol of the Web.
- **REST (Representational State Transfer)**: A standard software architectural style using standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) to perform operations on resource URIs (e.g., `/api/v1/analysis`).

#### Stateless Systems vs. State Management
- **Stateless Backend**: The FastAPI backend does NOT store session state inside Python variable memory across requests. Every incoming HTTP request must carry its credentials (JWT token).
- **Why?**: Horizontally scalable! If you launch 10 instances of FastAPI behind a load balancer, any container can answer any user request without needing to share local RAM memory.

---

# Phase 1: Our Final Architecture & Data Flow

```
                      [ USER BROWSER ]
                             │
                             ▼
                 [ Next.js 15 Frontend UI ]
                             │
       (HTTP REST Requests + Bearer Firebase JWT Token)
                             │
                             ▼
             [ AWS ALB / Port 8000 Entrypoint ]
                             │
                             ▼
                [ FastAPI Container Backend ]
   ┌─────────────────────────┼─────────────────────────┐
   │                         │                         │
   ▼                         ▼                         ▼
[ Firebase Auth ]     [ Firestore DB ]          [ Groq / LLM APIs ]
 (Token Verification)   (Data Storage)           (AI Generation)
```

### End-to-End Data Flows

#### 1. User Authentication Flow
1. User enters credentials on Next.js UI or clicks "Google Sign-In".
2. Next.js communicates with Firebase Auth SDK and receives an **ID Token (JWT)**.
3. Next.js sends an HTTP request to FastAPI (`POST /api/v1/auth/firebase`) with `Authorization: Bearer <id_token>`.
4. FastAPI's `auth_middleware` intercepts the request and verifies the signature using `firebase_admin.auth.verify_id_token()`.
5. FastAPI verifies or creates the user record in Firestore collection `users`.
6. FastAPI returns a signed session access token to Next.js.

#### 2. Dataset Upload & AI Analysis Flow
1. User drops a CSV file on Next.js (`/upload`).
2. Next.js sends `POST /api/v1/analysis/upload` with `Multipart/form-data`.
3. FastAPI parses the binary file into a **Pandas DataFrame** using `io.BytesIO`.
4. FastAPI extracts numerical statistics, null counts, and correlations, returning a dataset `file_id`.
5. Next.js calls `POST /api/v1/analysis/run`.
6. `analysis_service.py` sends dataset summaries to **Groq API** (`llama-3.1-8b-instant`).
7. Groq returns markdown quality findings, business insights, executive strategy, and a chart recommendation JSON.
8. `chart_generator.py` uses Pandas and Plotly to construct interactive visual specs.
9. FastAPI saves the record into Firestore (`analyses` collection) and returns the JSON payload to Next.js.

---

# Phase 2: FastAPI & Async Backend Fundamentals

### 1. WSGI vs. ASGI Architecture
- **WSGI (Web Server Gateway Interface)**: Traditional synchronous Python server model (e.g., Flask, Django). Handles 1 request per thread. If request takes 5 seconds waiting for LLM, that worker thread is completely blocked.
- **ASGI (Asynchronous Server Gateway Interface)**: Modern async Python server model (e.g., FastAPI with Uvicorn). Uses an **Event Loop**. While waiting for Groq API response over network IO, the thread pauses execution of that coroutine and processes 1,000 other user requests concurrently!

```
WSGI (Synchronous):  [Thread 1: Waiting for AI API........] (Blocked!)
ASGI (Async Event Loop): [Single Thread: Serves Req A ──► Pauses for IO ──► Serves Req B ──► Resumes Req A]
```

### 2. FastAPI Request & Response Parameters
In FastAPI, endpoint signatures explicitly map HTTP parameters:

```python
from fastapi import APIRouter, Depends, Query, Path, Header, status

router = APIRouter()

@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str = Path(..., description="Path param extracted from URL"),
    filter_type: str = Query("all", description="Query param: /analysis/123?filter_type=all"),
    user_agent: str = Header(...),
    current_user: UserResponse = Depends(get_current_user)
):
    return {"id": analysis_id, "filter": filter_type, "user": current_user}
```

### 3. Pydantic v2: Data Validation & Serialization
Pydantic guarantees type safety at the boundary of your backend.

- **Deserialization**: Converting incoming raw JSON string payloads into validated Python objects.
- **Serialization**: Converting internal Python dictionaries/objects into clean JSON output formats.

```python
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr                             # Validates email format automatically
    password: str = Field(..., min_length=6)    # Enforces minimum length rule
    name: str = Field(..., min_length=2)
```

---

# Phase 3: Professional Clean Architecture

In production enterprise applications, code must be decoupled into strict architectural layers:

```
                  ┌────────────────────────┐
                  │    HTTP API Routers    │ (backend/app/api/v1/)
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     Service Layer      │ (backend/app/services/)
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   Data / Repository    │ (backend/app/database/)
                  └────────────────────────┘
```

### Directory Responsibilities

| Directory | Purpose | Rule |
| :--- | :--- | :--- |
| `app/api/v1/` | Defines HTTP paths, status codes, query validation. | **No business logic or database code here.** |
| `app/services/` | Contains core application logic (LLM calls, analytical math). | **Framework agnostic.** Does not import Request/Response objects. |
| `app/database/` | Firestore client queries and data retrieval. | Handles reading/writing to DB engine only. |
| `app/schemas/` | Pydantic data validation schemas for requests and responses. | Pure data shapes. |
| `app/models/` | Domain entity definitions. | Describes database documents. |
| `app/core/` | Global configuration (`config.py`), logging, security keys. | Shared constants and environment variables. |

---

# Phase 4: Database Engineering with Firebase Firestore

### 1. NoSQL vs. Relational (SQL)
- **SQL (PostgreSQL/MySQL)**: Tables, rigid schemas, foreign key constraints, joins.
- **NoSQL Document DB (Firestore)**: JSON-like documents organized inside collections. Highly scalable, schema-flexible, low latency for document lookups.

```
Firestore Database
  └── Collection: "users"
        ├── Document ID: "usr_1001" -> { name: "Alice", email: "alice@demo.com" }
        └── Document ID: "usr_1002" -> { name: "Bob", email: "bob@demo.com" }
```

### 2. Firestore Collection Design in Our App

1. `users`: Stores user profile data, subscription tier, preferences.
2. `analyses`: Stores full analysis reports (quality findings, statistical insights, charts).
3. `chat_sessions`: Manages AI conversation threads.
4. `messages`: Individual chat prompt & response messages.
5. `uploaded_files`: Dataset metadata (filename, row count, column list).
6. `activity_logs`: Audit trail of actions performed.

---

# Phase 5: Authentication, JWT & Security Architecture

### 1. Authentication vs. Authorization
- **Authentication (Who are you?)**: Verifying user identity via credentials (email/password or Firebase JWT).
- **Authorization (What are you allowed to do?)**: Checking permissions (e.g., verifying user role is `admin` before granting access to delete records).

### 2. JWT (JSON Web Token) Structure
A JWT is a cryptographically signed compact string comprising 3 parts separated by dots (`.`):

```
HEADER.PAYLOAD.SIGNATURE
```

1. **Header**: Specifies signing algorithm (e.g., `HS256`).
2. **Payload**: Stores claims (`sub`: user_id, `exp`: expiration timestamp, `role`: admin).
3. **Signature**: Cryptographic proof computed using server secret key. Client cannot alter payload without invalidating signature!

```python
# Verifying Token Middleware in FastAPI
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload
```

---

# Phase 6: AI Service Layer & LLM Architecture

The AI layer isolates LLM API complexity from HTTP routers.

```
Router (POST /chat) ──► ChatService ──► LLMService ──► Groq API (Llama 3.1)
                                            │
                                  (Retries & Fallback)
                                            │
                                            ▼
                                       OpenAI API
```

### Resilience Features

1. **Multi-Provider Fallback**: Automatically fall back from Groq to OpenAI if primary provider is unavailable.
2. **Exponential Backoff Retries**: If network rate-limit occurs, retry request after `2^attempt` seconds.
3. **Clean Output Cleaning**: Strip out markdown backticks (` ```json `) to guarantee pure JSON parsing.

---

# Phase 7: Production File Upload Systems

Handling dataset file uploads requires strict streaming security:

1. **Size Limits**: Enforce maximum file size (50MB) before processing.
2. **In-Memory Streaming**: Stream file bytes using `BytesIO` to prevent disk contamination.
3. **Pandas Validation**: Validate column headers and data types immediately on parse.

---

# Phase 8: Containerization with Docker

### 1. What is Docker?
Docker package applications and their dependencies into standardized units called **Containers**. Unlike Virtual Machines (VMs), containers share the host operating system kernel, making them lightweight, fast, and consistent across development and production environments.

### 2. Docker Multi-Stage Build Pattern
Multi-stage Dockerfiles keep container sizes minimal by using a temporary compilation container and copying only compiled artifacts to the final slim image:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Final runtime container
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . /app
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

# Phase 9: AWS Cloud Architecture

Our production environment deploys to Amazon Web Services (AWS) using modern container infrastructure:

```
                        [ Internet ]
                             │
                             ▼
               [ AWS Route53 (DNS / HTTPS) ]
                             │
                             ▼
         [ AWS Application Load Balancer (ALB) ]
                             │
                             ▼
            [ AWS ECS Fargate Cluster (VPC) ]
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
 [ Next.js Container ]                [ FastAPI Container ]
```

### AWS Components Explained
- **VPC (Virtual Private Cloud)**: Isolated private network within AWS.
- **ECS (Elastic Container Service) & Fargate**: Serverless container engine that runs Docker containers without needing manual server configuration.
- **ECR (Elastic Container Registry)**: Private Docker registry storing production container images.
- **Secrets Manager**: Encrypts and stores API keys securely.

---

# Phase 10: Enterprise API Security

### Security Defenses Implemented
1. **CORS (Cross-Origin Resource Sharing)**: Prevents unauthorized websites from invoking backend APIs from user browsers.
2. **Rate Limiting**: Restricts requests per IP address (120 req/min) to block Denial-of-Service (DoS) attacks.
3. **Pydantic Sanitization**: Prevents SQL/NoSQL injection and cross-site scripting (XSS) by enforcing type validation.

---

# Phase 11: DevOps & CI/CD Pipelines

Automated deployment pipelines are managed via **GitHub Actions** (`.github/workflows/deploy.yml`):

```
Push to main branch ──► GitHub Actions Triggered
                             │
                             ├── 1. Run Python & Next.js Unit Tests
                             ├── 2. Build Docker Containers
                             ├── 3. Push Containers to AWS ECR
                             └── 4. Update AWS ECS Fargate Deployment
```

---

# Phase 12: Production Observability & Logging

Production observability is structured across 3 metrics:

1. **Structured Logging**: Formatting log messages in JSON with timestamps, log levels, and request IDs.
2. **Health Endpoints**: `/api/v1/health` providing readiness probes for AWS load balancers.
3. **Error Tracking**: Global exception handlers catching unhandled exceptions and logging tracebacks silently without leaking sensitive stack traces to users.

---

# Phase 13: End-to-End System Walkthrough

Let's trace a user running an analysis:

1. **User Action**: User uploads dataset on Next.js UI.
2. **Frontend**: Sends `POST /api/v1/analysis/upload` with Bearer JWT token.
3. **Backend Middleware**: `auth_middleware.py` validates JWT token.
4. **Backend Router**: `analysis.py` accepts file, passes bytes to `data_processing.py`.
5. **Service Layer**: `analysis_service.py` extracts summary stats, invokes `LLMService` which calls Groq API.
6. **Chart Generator**: `chart_generator.py` compiles Plotly JSON specs.
7. **Database Repository**: `firestore.py` persists record to `analyses` collection in Firestore.
8. **Frontend Render**: Next.js receives JSON response and dynamically renders interactive metrics and Plotly charts.
