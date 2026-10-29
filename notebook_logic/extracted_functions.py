import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

DEFAULT_GROQ_KEY = os.getenv("GROQ_API_KEY", "")

def get_groq_model(api_key=None, model_name="llama-3.1-8b-instant"):
    key = api_key.strip() if (api_key and api_key.strip()) else DEFAULT_GROQ_KEY
    return ChatGroq(model=model_name, api_key=key)

def load_dataset(file_or_path):
    """Loads dataset into a Pandas DataFrame."""
    if isinstance(file_or_path, str):
        df = pd.read_csv(file_or_path)
    else:
        df = pd.read_csv(file_or_path)
    return df

def extract_summary(df: pd.DataFrame) -> dict:
    """Calculates comprehensive dataset summary strictly as performed in the notebook."""
    num_cols = df.select_dtypes(include=["int64", "float64", "int32", "float32"]).columns.tolist()
    
    summary = {
        "rows": len(df),
        "columns": df.columns.tolist(),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values": df.isnull().sum().to_dict(),
        "duplicate_rows": int(df.duplicated().sum()),
        
        "region_distribution": (
            df["Region"].value_counts().to_dict() if "Region" in df.columns else {}
        ),
        "category_distribution": (
            df["Category"].value_counts().to_dict() if "Category" in df.columns else {}
        ),
        "gender_distribution": (
            df["CustomerGender"].value_counts().to_dict() if "CustomerGender" in df.columns else {}
        ),
        
        "revenue_by_region": (
            df.groupby("Region")["Revenue"].sum().round(2).to_dict()
            if {"Region", "Revenue"}.issubset(df.columns) else {}
        ),
        "revenue_by_category": (
            df.groupby("Category")["Revenue"].sum().round(2).to_dict()
            if {"Category", "Revenue"}.issubset(df.columns) else {}
        ),
        
        "statistics": {
            col: {
                "mean": round(float(df[col].mean()), 2),
                "median": round(float(df[col].median()), 2),
                "min": round(float(df[col].min()), 2),
                "max": round(float(df[col].max()), 2),
                "std": round(float(df[col].std()), 2)
            } for col in num_cols
        },
        
        "correlations": (
            df[num_cols].corr().round(3).to_dict() if num_cols else {}
        ),
        
        "top_products": (
            df["Product"].value_counts().head(10).to_dict() if "Product" in df.columns else {}
        ),
        
        "date_range": {
            "start": str(pd.to_datetime(df["OrderDate"], errors="coerce").min()),
            "end": str(pd.to_datetime(df["OrderDate"], errors="coerce").max())
        } if "OrderDate" in df.columns else {},
        
        "top_5_records": df.head(5).to_dict(orient="records")
    }
    return summary

# Prompt 1: Data Overview & Data Quality Assessment
prompt1_template = ChatPromptTemplate.from_messages([
    ("system", """
You are a Senior Data Analyst.

Analyze the dataset summary below and generate:

# Dataset Overview

Include:
- What the dataset contains
- Total rows and columns
- Important columns
- Business context inferred from the data

# Data Quality Assessment

Analyze:
- Missing values
- Duplicate rows
- Data type issues
- Data consistency issues
- Potential risks in data quality

Generate:

1. Dataset Overview
2. Important Fields
3. Data Quality Findings
4. Data Quality Score (0-100)
5. Key Data Quality Recommendations

Rules:
- Use only provided data.
- Do not hallucinate.
- Be specific.

Dataset Summary:

{summary}""")
])

# Prompt 2: Statistical & Business Analysis
prompt2_template = ChatPromptTemplate.from_messages([
    ("system", """
You are a Senior Business Intelligence Analyst and Data Scientist.

Analyze the dataset summary below.

Generate:

# Statistical Analysis

Include:
- Important numerical metrics
- Distribution observations
- Outliers and unusual patterns
- High-value variables

# Business Analysis

Analyze:
- Revenue performance
- Profit performance
- Product performance
- Category performance
- Regional performance
- Customer behavior

# Correlation Analysis

Analyze:
- Strong positive correlations
- Strong negative correlations
- Business meaning of each correlation

# Top 10 Data-Driven Insights

Requirements:
- Rank insights by importance.
- Explain why each insight matters.
- Use actual values when available.
- Do not give generic statements.

Rules:
- Use only provided data.
- Never hallucinate.

Dataset Summary:

{summary}""")
])

# Prompt 3: AI Visualization Architect
prompt3_template = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert Business Intelligence Visualization Architect.

Analyze the dataset summary.

Recommend the 5 most important visualizations.

Return ONLY valid JSON.

Output format:

{{
  "charts":[
    {{
      "chart_type":"",
      "x_column":"",
      "y_column":"",
      "aggregation":"",
      "title":"",
      "business_reason":""
    }}
  ]
}}

Rules:

1. Return ONLY JSON.
2. No explanations.
3. No markdown.
4. No code blocks.
5. Use only columns present in the dataset.
6. Choose the most informative charts.
7. Supported chart types:
   - bar
   - line
   - scatter
   - pie
   - histogram
   - heatmap
   - boxplot

Dataset Summary:

{summary}
""")
])

# Prompt 4: Executive Summary & Action Plan
prompt4_template = ChatPromptTemplate.from_messages([
    ("system", """
You are a Management Consultant, Strategy Advisor, and Senior Business Analyst.

Using the dataset summary and analytical findings below, generate executive-level recommendations.

Dataset Summary:

{summary}

Analysis Results:

{prompt2}

Generate:

# Executive Summary

Include:
- Biggest opportunity
- Biggest risk
- Most important finding
- Most important recommendation

# Business Recommendations

Generate 5 actionable recommendations.

For each recommendation provide:

1. Recommendation
2. Why it matters
3. Expected business impact
4. Priority (High/Medium/Low)

# Management Action Plan

Generate:

Immediate Actions (0-30 Days)

Short-Term Actions (1-3 Months)

Long-Term Actions (3-12 Months)

Rules:

- Recommendations must be based on findings.
- No generic advice.
- No hallucinations.
- Focus on measurable business impact.
""")
])

# Prompt Option 1: Python Code Assistant Engine
prompt_code_template = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert Python Data Analyst.

Dataset Information:
{dataset_info}

Write ONLY executable pandas code.

Rules:
- Use dataframe name df
- Return only Python code
- No markdown formatting (no ```python blocks)
- No explanations
- Final result must be stored in variable result

Example:
Question:
Highest revenue?
Answer:
result = df["Revenue"].max()
"""),
    ("human", "{question}")
])

# Prompt Option 2: Strategic Business Q&A Engine
prompt_qa_template = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert autonomous data analyst.

Dataset Summary:
{summary}

Instructions:

1. Answer the question directly.
2. Explain the answer using the analysis result.
3. Provide business interpretation.
4. Highlight important observations.
5. Mention any risks or opportunities.
6. Keep the explanation concise and data-driven.
7. Use only the provided data.
8. Do not hallucinate.

Output Format:

Answer:

Explanation:

Business Insight:

Recommendation:
"""),
    ("human", "{question}")
])


def run_data_quality_analysis(summary: dict, api_key=None) -> str:
    model = get_groq_model(api_key)
    chain = prompt1_template | model
    res = chain.invoke({"summary": summary})
    return res.content

def run_business_analysis(summary: dict, api_key=None) -> str:
    model = get_groq_model(api_key)
    chain = prompt2_template | model
    res = chain.invoke({"summary": summary})
    return res.content

def run_visualization_recommendations(summary: dict, api_key=None) -> dict:
    model = get_groq_model(api_key)
    chain = prompt3_template | model
    res = chain.invoke({"summary": summary})
    text = res.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except Exception as e:
        return {"charts": [], "raw_output": text, "error": str(e)}

def run_executive_strategy(summary: dict, prompt2_result: str, api_key=None) -> str:
    model = get_groq_model(api_key)
    chain = prompt4_template | model
    res = chain.invoke({"summary": summary, "prompt2": prompt2_result})
    return res.content

def ask_code_qa(summary: dict, df: pd.DataFrame, question: str, api_key=None):
    model = get_groq_model(api_key)
    chain = prompt_code_template | model
    res = chain.invoke({"dataset_info": summary, "question": question})
    code = res.content.strip()
    code = code.replace("```python", "").replace("```", "").strip()
    
    local_vars = {"df": df, "pd": pd, "np": np}
    exec(code, {}, local_vars)
    result = local_vars.get("result", "No 'result' variable found in generated code.")
    return code, result

def ask_strategic_qa(summary: dict, question: str, api_key=None) -> str:
    model = get_groq_model(api_key)
    chain = prompt_qa_template | model
    res = chain.invoke({"summary": summary, "question": question})
    return res.content


# SaaS Color Palette for Plotly Charts
SAAS_PALETTE = ["#4F46E5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"]

def generate_plotly_chart(df: pd.DataFrame, chart: dict):
    """Generates dynamic Plotly figures styled for SaaS enterprise UI."""
    chart_type = chart.get("chart_type", "bar").lower()
    x = chart.get("x_column")
    y = chart.get("y_column")
    title = chart.get("title", f"{chart_type.capitalize()} Chart")
    agg = chart.get("aggregation", "sum")
    
    if not x or x not in df.columns:
        return None

    if chart_type == "bar":
        if y and y in df.columns:
            if agg == "sum":
                grouped = df.groupby(x)[y].sum().reset_index()
            elif agg == "mean":
                grouped = df.groupby(x)[y].mean().reset_index()
            else:
                grouped = df.groupby(x)[y].sum().reset_index()
            fig = px.bar(grouped, x=x, y=y, title=title, text_auto=".2s",
                         color_discrete_sequence=SAAS_PALETTE)
        else:
            grouped = df[x].value_counts().reset_index()
            grouped.columns = [x, "count"]
            fig = px.bar(grouped, x=x, y="count", title=title, text_auto=True,
                         color_discrete_sequence=SAAS_PALETTE)
                         
    elif chart_type == "line":
        if y and y in df.columns:
            grouped = df.groupby(x)[y].sum().reset_index()
            fig = px.line(grouped, x=x, y=y, title=title, markers=True,
                          color_discrete_sequence=["#4F46E5"])
        else:
            fig = px.line(df, y=x, title=title)
            
    elif chart_type == "pie":
        if y and y in df.columns:
            grouped = df.groupby(x)[y].sum().reset_index()
            fig = px.pie(grouped, names=x, values=y, title=title, hole=0.4,
                         color_discrete_sequence=SAAS_PALETTE)
        else:
            grouped = df[x].value_counts().reset_index()
            grouped.columns = [x, "count"]
            fig = px.pie(grouped, names=x, values="count", title=title, hole=0.4,
                         color_discrete_sequence=SAAS_PALETTE)
            
    elif chart_type == "scatter":
        if y and y in df.columns:
            color_col = "Category" if "Category" in df.columns else None
            fig = px.scatter(df, x=x, y=y, color=color_col, title=title, opacity=0.85,
                             color_discrete_sequence=SAAS_PALETTE)
        else:
            fig = px.scatter(df, y=x, title=title)
            
    elif chart_type == "histogram":
        fig = px.histogram(df, x=x, title=title, color_discrete_sequence=["#4F46E5"])
        
    elif chart_type == "boxplot":
        if y and y in df.columns:
            fig = px.box(df, x=x, y=y, title=title, color_discrete_sequence=SAAS_PALETTE)
        else:
            fig = px.box(df, y=x, title=title)
            
    elif chart_type == "heatmap":
        num_cols = df.select_dtypes(include=[np.number]).columns
        corr = df[num_cols].corr()
        fig = px.imshow(corr, text_auto=True, aspect="auto", title=title, color_continuous_scale="Purples")
    else:
        fig = px.bar(df, x=x, title=title, color_discrete_sequence=SAAS_PALETTE)

    fig.update_layout(
        template="plotly_white",
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#F8FAFC",
        font=dict(family="Inter, sans-serif", size=13, color="#0F172A"),
        margin=dict(l=40, r=40, t=50, b=40),
        title_font=dict(size=16, color="#0F172A", family="Poppins, sans-serif"),
        hoverlabel=dict(bgcolor="#0F172A", font_size=12, font_family="Inter, sans-serif")
    )
    return fig
