import uuid
from typing import List, Optional, Dict, Any
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.analysis import (
    FileMetadata,
    AnalysisRunRequest,
    QualityAssessmentResponse,
    AnalysisResponse
)
from app.schemas.common import ResponseModel
from app.utils.data_processing import load_dataset_from_bytes, extract_summary
from app.services.session_store import session_store
from app.services.analysis_service import analysis_service
from app.core.config import settings

router = APIRouter()

@router.post("/upload", response_model=ResponseModel[FileMetadata])
async def upload_dataset(file: UploadFile = File(...)):
    """Upload CSV or Excel dataset into active in-memory session. Zero disk files saved."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds max size limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

    file_id = f"file_{uuid.uuid4().hex[:12]}"
    try:
        df = load_dataset_from_bytes(contents, file.filename)
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Parsed dataset contains no data rows.")

        summary = extract_summary(df)
        preview = df.head(10).to_dict(orient="records")

        metadata = FileMetadata(
            file_id=file_id,
            filename=file.filename,
            size_bytes=len(contents),
            rows=len(df),
            columns_count=len(df.columns),
            columns=df.columns.tolist(),
            preview=preview,
            summary=summary
        )

        session_store.set_dataset(df, metadata.model_dump())
        return ResponseModel(success=True, message="File uploaded and parsed successfully", data=metadata)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")

@router.delete("/dataset", response_model=ResponseModel[bool])
async def remove_dataset():
    """Remove current active dataset from memory."""
    session_store.clear_dataset()
    return ResponseModel(success=True, message="Dataset cleared successfully", data=True)


@router.post("/quality-assessment", response_model=ResponseModel[QualityAssessmentResponse])
async def run_quality_assessment(req: AnalysisRunRequest):
    """Output 1: Data Overview & Data Quality Assessment."""
    df = session_store.get_dataframe()
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Please upload a CSV or Excel dataset first.")

    summary = extract_summary(df)
    q_assess = analysis_service.generate_quality_assessment(summary, api_key=req.api_key)

    missing_ratio = sum(summary.get("missing_values", {}).values()) / max(1, (len(df) * max(1, len(df.columns))))
    dup_ratio = summary.get("duplicate_rows", 0) / max(1, len(df))
    quality_score = max(50, min(100, int(100 - (missing_ratio * 100 * 2) - (dup_ratio * 100 * 3))))

    return ResponseModel(
        success=True,
        message="Output 1 Data Overview & Quality Assessment generated successfully",
        data=QualityAssessmentResponse(file_id=req.file_id, quality_assessment=q_assess, quality_score=quality_score)
    )
