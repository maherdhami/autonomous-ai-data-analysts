import json
from typing import Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm_service import get_llm

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Chief Strategy Officer (CSO) and Executive Management Consultant.
Synthesize the dataset summary and prior business analysis into Output 4: Executive Summary & Strategic Action Plan in Markdown format.

Your report must contain:
1. Executive Summary: portfolio health, macro performance, core value drivers, and operational risks.
2. Prioritized Strategic Action Plan: 5 to 7 concrete initiatives with Priority (HIGH/MEDIUM/LOW), Impact Area, Data Justification, and Implementation Steps.
3. Phased Implementation Roadmap: Phase 1 (0-30 Days), Phase 2 (1-3 Months), and Phase 3 (3-12 Months).

Rules:
- Write in authoritative, executive-ready language with clear Markdown headings."""),
    ("user", "Dataset Summary:\n{summary}\n\nBusiness Analysis Context:\n{business_analysis}")
])


class SummaryService:
    """Output 4: Executive Summary & Action Plan."""

    def generate_executive_summary(
        self,
        summary: Dict[str, Any],
        business_analysis: str,
        api_key: str
    ) -> str:
        llm = get_llm(api_key)
        chain = prompt | llm
        response = chain.invoke({
            "summary": json.dumps(summary, indent=2, default=str),
            "business_analysis": business_analysis
        })
        return response.content


summary_service = SummaryService()
