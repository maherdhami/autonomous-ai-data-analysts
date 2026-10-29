# API Documentation - Autonomous AI Data Analyst

Production FastAPI Service endpoints operating on base URL `/api/v1`.

---

## Authentication Endpoints (`/api/v1/auth`)

### 1. Register User
`POST /auth/register`
* **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@enterprise.com",
  "password": "SecurePassword123"
}
```
* **Response**: `200 OK`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "user_id": "usr_a1b2c3d4",
      "name": "Jane Doe",
      "email": "jane@enterprise.com",
      "role": "user",
      "created_at": 1700000000,
      "last_login": 1700000000,
      "subscription": "free"
    }
  }
}
```

### 2. Login User
`POST /auth/login`
* **Request Body**:
```json
{
  "email": "jane@enterprise.com",
  "password": "SecurePassword123"
}
```

### 3. Firebase Token Authentication
`POST /auth/firebase`
* **Request Body**:
```json
{
  "id_token": "FIREBASE_CLIENT_ID_TOKEN"
}
```

### 4. Get Current User Profile
`GET /auth/me`
* **Headers**: `Authorization: Bearer <token>`

---

## Analysis Endpoints (`/api/v1/analysis`)

### 1. Upload Dataset File
`POST /analysis/upload`
* **Headers**: `Authorization: Bearer <token>`
* **Content-Type**: `multipart/form-data`
* **Form Field**: `file` (CSV / XLSX / Parquet file, max 50MB)

### 2. Execute Full AI Analysis
`POST /analysis/run`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "file_id": "file_123456",
  "api_key": "gsk_..."
}
```
* **Response**: Returns quality assessment text, quality score, statistical insights, executive strategy, and Plotly chart JSON specs.

### 3. Get Analysis History
`GET /analysis/history`
* **Headers**: `Authorization: Bearer <token>`

### 4. Get Analysis By ID
`GET /analysis/{analysis_id}`

### 5. Delete Analysis Record
`DELETE /analysis/{analysis_id}`

---

## AI Chat & Insights Endpoints (`/api/v1`)

### 1. Interactive AI Chat Analyst
`POST /chat`
* **Request Body**:
```json
{
  "session_id": "ses_123",
  "file_id": "file_123",
  "question": "Which product category drove highest gross revenue in 2023?",
  "mode": "strategic"
}
```
*(Modes: `strategic` for qualitative advisory or `code` for Python execution on dataset)*

### 2. Generate Automated Insights
`POST /generate-insights`

### 3. Summarize Analysis
`POST /summarize`

### 4. Recommend Executive Actions
`POST /recommend`

