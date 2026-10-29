from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRunRequest, VisualizationsResponse, ChartConfig
from app.schemas.common import ResponseModel
from app.utils.data_processing import extract_summary
from app.services.session_store import session_store
from app.services.visualization_service import visualization_service

router = APIRouter()

@router.post("/generate-charts", response_model=ResponseModel[VisualizationsResponse])
async def run_visualizations(req: AnalysisRunRequest):
    """Output 3: Recommended Visualizations."""
    df = session_store.get_dataframe()
    if df is None or df.empty:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded. Please upload a CSV or Excel dataset first."
        )

    summary = extract_summary(df)
    charts = visualization_service.generate_visualizations(summary, df, api_key=req.api_key)

    return ResponseModel(
        success=True,
        message="Output 3 Recommended Visualizations generated successfully",
        data=VisualizationsResponse(file_id=req.file_id, charts=[ChartConfig(**c) for c in charts])
    )