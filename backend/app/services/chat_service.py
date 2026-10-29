import json
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm_service import get_llm

strategic_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an Autonomous AI Data Analyst Copilot.
Answer the user's question clearly, accurately, and concisely using ONLY the dataset details below.

Dataset Overview:
{context}"""),
    ("user", "{q}")
])

code_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a Python and Pandas Data Engineer.
Write a short Python Pandas code snippet that calculates the answer to the user's question.

Columns available: {columns}
Sample records: {sample}

Rules:
- DataFrame is already loaded as `df`.
- Store final output in variable `result`.
- Return ONLY valid Python code inside triple backticks (```python ... ```)."""),
    ("user", "{q}")
])


class ChatService:
    """Stateless Chat Service powered by direct prompt | llm chains."""

    def ask_strategic_qa(
        self, summary: Dict[str, Any], df: pd.DataFrame, question: str, api_key: str
    ) -> str:
        context = {
            "total_records": len(df),
            "columns": df.columns.tolist(),
            "summary_statistics": summary.get("statistics", {}),
            "sample_rows": df.head(5).to_dict(orient="records")
        }
        response = (strategic_prompt | get_llm(api_key)).invoke({
            "context": json.dumps(context, indent=2, default=str),
            "q": question
        })
        return response.content

    def ask_code_qa(
        self, summary: Dict[str, Any], df: pd.DataFrame, question: str, api_key: str
    ) -> Tuple[str, Any]:
        response = (code_prompt | get_llm(api_key)).invoke({
            "columns": df.columns.tolist(),
            "sample": json.dumps(df.head(3).to_dict(orient="records"), default=str),
            "q": question
        })
        clean_code = response.content.replace("```python", "").replace("```", "").strip()

        local_vars = {"df": df, "pd": pd, "np": np}
        try:
            exec(clean_code, {}, local_vars)
            result = local_vars.get("result", "Execution complete")
            if isinstance(result, pd.DataFrame):
                result = result.head(10).to_dict(orient="records")
            elif isinstance(result, pd.Series):
                result = result.to_dict()
        except Exception as e:
            result = f"Execution note: {e}"

        return clean_code, result


chat_service = ChatService()