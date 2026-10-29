import json
from typing import Dict, Any, List, Optional
import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm_service import get_llm
from app.utils.chart_generator import generate_plotly_json

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Data Visualization Architect.
Analyze the dataset summary below and recommend 4 to 5 effective charts in JSON format:
{{
  "charts": [
    {{
      "chart_type": "bar | line | pie | scatter | histogram | boxplot",
      "x_column": "exact_column_name",
      "y_column": "exact_column_name_or_null",
      "aggregation": "sum | mean | count",
      "title": "Clear descriptive chart title",
      "business_reason": "Why this chart matters"
    }}
  ]
}}
Return ONLY valid JSON without markdown or extra text."""),
    ("user", "Dataset Summary:\n{summary}")
])


class VisualizationService:
    """Output 3: Recommended Visualizations."""

    def generate_visualizations(
        self,
        summary: Dict[str, Any],
        df: pd.DataFrame,
        api_key: str
    ) -> List[Dict[str, Any]]:
        llm = get_llm(api_key)
        chain = prompt | llm
        response = chain.invoke({"summary": json.dumps(summary, indent=2, default=str)})

        text = response.content
        if "{" in text and "}" in text:
            text = text[text.find("{"):text.rfind("}") + 1]

        try:
            parsed = json.loads(text)
            chart_configs = parsed.get("charts", [])
        except Exception:
            chart_configs = []

        results = []
        for c in chart_configs:
            plotly_json = generate_plotly_json(df, c)
            if plotly_json:
                c["plotly_json"] = plotly_json
                results.append(c)

        return results


visualization_service = VisualizationService()
