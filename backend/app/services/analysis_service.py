import json
from typing import Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm_service import get_llm

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Senior Data Analyst and Data Quality Auditor.
Analyze the dataset summary below and generate Output 1: Data Overview & Data Quality Assessment in Markdown format.

Your report must contain:
1. Dataset Profile & Dimensions: Total records, column count, schema data types.
2. Column-by-Column Overview: Purpose and nature of each key column.
3. Data Quality & Completeness Audit: Missing values, null percentage, duplicate records.
4. Overall Data Health Score: Score from 0 to 100 with justification.
5. Actionable Data Quality Recommendations: Clear steps for data cleaning and validation.

Rules:
- Be clear, thorough, and specific using the provided dataset metrics.
- Format with clear Markdown headings and bullet points."""),
    ("user", "Dataset Summary:\n{summary}")
])


class AnalysisService:
    """Output 1: Data Overview & Data Quality Assessment."""

    def generate_quality_assessment(self, summary: Dict[str, Any], api_key: str) -> str:
        llm = get_llm(api_key)
        chain = prompt | llm
        response = chain.invoke({"summary": json.dumps(summary, indent=2, default=str)})
        return response.content


analysis_service = AnalysisService()
