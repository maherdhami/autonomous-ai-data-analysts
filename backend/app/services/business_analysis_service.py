import json
from typing import Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm_service import get_llm

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Principal Business Intelligence Analyst and Data Scientist.
Analyze the provided dataset summary and generate Output 2: Statistical & Business Analysis & Top 10 Insights in Markdown format.

Your report must contain:
1. Statistical Analysis (continuous metrics, distributions, variance, outliers).
2. Business Performance & Segmentation (categories, products, volume concentration).
3. Correlation & Relationship Analysis (positive/negative associations, business meaning).
4. Ranked Top 10 Data-Driven Insights (10 distinct numbered insights with why each matters).

Rules:
- Ground all observations strictly in the provided data summary.
- Format with clear Markdown headings and numbered bullet points."""),
    ("user", "Dataset Summary:\n{summary}")
])


class BusinessAnalysisService:
    """Output 2: Statistical & Business Analysis & Top Insights."""

    def generate_business_analysis(self, summary: Dict[str, Any], api_key: str) -> str:
        llm = get_llm(api_key)
        chain = prompt | llm
        response = chain.invoke({"summary": json.dumps(summary, indent=2, default=str)})
        return response.content


business_analysis_service = BusinessAnalysisService()
