from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRunRequest, BusinessAnalysisResponse
from app.schemas.common import ResponseModel
from app.utils.data_processing import extract_summary
from app.services.session_store import session_store
from app.services.business_analysis_service import business_analysis_service

router = APIRouter()

@router.post("/statistical-insights", response_model=ResponseModel[BusinessAnalysisResponse])
async def run_business_analysis(req: AnalysisRunRequest):
    """Output 2: Statistical & Business Analysis."""
    df = session_store.get_dataframe()
    if df is None or df.empty:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded. Please upload a CSV or Excel dataset first."
        )

    summary = extract_summary(df)
    bus_analysis = business_analysis_service.generate_business_analysis(summary, api_key=req.api_key)

    return ResponseModel(
        success=True,
        message="Output 2 Statistical & Business Analysis generated successfully",
        data=BusinessAnalysisResponse(file_id=req.file_id, business_analysis=bus_analysis)
    )