from fastapi import APIRouter
from app.api.v1 import (
    analysis,
    business_analysis,
    visualization,
    summary,
    chat
)

api_router = APIRouter()

# 5 Page-Based Feature Routers (1 Page = 1 Router = 1 Service)
api_router.include_router(analysis.router, prefix="/analysis", tags=["Output 1: Data Overview & QA"])
api_router.include_router(business_analysis.router, prefix="/business-analysis", tags=["Output 2: Business Analysis"])
api_router.include_router(visualization.router, prefix="/visualization", tags=["Output 3: Visualization Recommendations"])
api_router.include_router(summary.router, prefix="/summary", tags=["Output 4: Executive Summary"])
api_router.include_router(chat.router, tags=["Feature 5: AI Copilot Chat"])
