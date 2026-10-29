from typing import Optional, List, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    code: Optional[str] = None
    execution_result: Optional[Any] = None
    timestamp: int

class ChatRequest(BaseModel):
    file_id: str
    api_key: str
    question: str
    mode: str = "strategic" # "strategic" or "code"

class ChatResponse(BaseModel):
    session_id: str
    message: ChatMessage
