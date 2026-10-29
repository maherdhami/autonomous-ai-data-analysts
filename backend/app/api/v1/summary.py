from fastapi import APIRouter, HTTPException
from app.schemas.analysis import ExecutiveSummaryRequest, ExecutiveSummaryResponse
from app.schemas.common import ResponseModel
from app.utils.data_processing import extract_summary
from app.services.session_store import session_store
from app.services.business_analysis_service import business_analysis_service
from app.services.summary_service import summary_service

router = APIRouter()

@router.post("/executive-strategy", response_model=ResponseModel[ExecutiveSummaryResponse])
async def run_executive_summary(req: ExecutiveSummaryRequest):
    """Output 4: Executive Summary & Management Action Plan."""
    df = session_store.get_dataframe()
    if df is None or df.empty:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded. Please upload a CSV or Excel dataset first."
        )

    summary = extract_summary(df)
    bus_analysis = req.business_analysis or ""
    if not bus_analysis:
        bus_analysis = business_analysis_service.generate_business_analysis(summary, api_key=req.api_key)

    exec_strat = summary_service.generate_executive_summary(summary, bus_analysis, api_key=req.api_key)

    return ResponseModel(
        success=True,
        message="Output 4 Executive Summary & Action Plan generated successfully",
        data=ExecutiveSummaryResponse(file_id=req.file_id, executive_strategy=exec_strat)
    )