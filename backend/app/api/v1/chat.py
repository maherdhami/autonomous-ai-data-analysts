import time
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage
from app.schemas.common import ResponseModel
from app.services.session_store import session_store
from app.services.chat_service import chat_service
from app.utils.data_processing import extract_summary

router = APIRouter()

@router.post("/chat", response_model=ResponseModel[ChatResponse])
async def chat_with_analyst(req: ChatRequest):
    """Stateless question answering: answers user questions using the active dataset."""
    df = session_store.get_dataframe()
    if df is None or df.empty:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded. Please upload a CSV or Excel dataset first."
        )

    summary = extract_summary(df)
    code_out, exec_res = None, None

    if req.mode == "code":
        code_out, exec_res = chat_service.ask_code_qa(summary, df, req.question, api_key=req.api_key)
        content = f"Execution output for query:\n`{exec_res}`"
    else:
        content = chat_service.ask_strategic_qa(summary, df, req.question, api_key=req.api_key)

    msg = ChatMessage(
        role="assistant",
        content=content,
        code=code_out,
        execution_result=str(exec_res) if exec_res is not None else None,
        timestamp=int(time.time())
    )

    return ResponseModel(
        success=True,
        message="AI response generated successfully",
        data=ChatResponse(session_id="active", message=msg)
    )