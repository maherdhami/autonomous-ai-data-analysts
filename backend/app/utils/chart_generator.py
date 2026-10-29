import pandas as pd
import numpy as np
import plotly.express as px
import json
from typing import Dict, Any, Optional

SAAS_PALETTE = ["#4F46E5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"]

def generate_plotly_json(df: pd.DataFrame, chart: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Generates dynamic Plotly figures styled for SaaS enterprise UI and returns JSON spec."""
    chart_type = chart.get("chart_type", "bar").lower()
    x = chart.get("x_column")
    y = chart.get("y_column")
    title = chart.get("title", f"{chart_type.capitalize()} Chart")
    agg = chart.get("aggregation", "sum")
    
    if not x or x not in df.columns:
        return None

    try:
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
        return json.loads(fig.to_json())
    except Exception as e:
        return None
