import os
import io
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

def load_dataset_from_bytes(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Loads dataset into a Pandas DataFrame from raw bytes."""
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    elif filename.endswith(".parquet"):
        df = pd.read_parquet(io.BytesIO(file_bytes))
    elif filename.endswith(".json"):
        df = pd.read_json(io.BytesIO(file_bytes))
    else:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception:
            df = pd.read_excel(io.BytesIO(file_bytes))
    return df

def extract_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Dynamically calculates comprehensive dataset summary for ANY arbitrary dataset."""
    if df is None or df.empty:
        return {"rows": 0, "columns": [], "data_types": {}, "missing_values": {}, "duplicate_rows": 0}

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    
    date_cols = []
    for col in df.columns:
        if col not in num_cols:
            try:
                sample = df[col].dropna().head(20)
                if not sample.empty and pd.to_datetime(sample, errors="coerce").notnull().all():
                    date_cols.append(col)
            except Exception:
                pass

    # Basic metadata
    rows = int(len(df))
    cols = df.columns.tolist()
    dtypes = {col: str(df[col].dtype) for col in cols}
    missing = {col: int(df[col].isnull().sum()) for col in cols}
    duplicates = int(df.duplicated().sum())

    # Numeric statistics
    statistics = {}
    for col in num_cols:
        series = df[col].dropna()
        if not series.empty:
            q25 = float(series.quantile(0.25))
            q75 = float(series.quantile(0.75))
            iqr = q75 - q25
            outliers_count = int(((series < (q25 - 1.5 * iqr)) | (series > (q75 + 1.5 * iqr))).sum())
            statistics[col] = {
                "mean": round(float(series.mean()), 2),
                "median": round(float(series.median()), 2),
                "min": round(float(series.min()), 2),
                "max": round(float(series.max()), 2),
                "std": round(float(series.std()), 2) if len(series) > 1 else 0.0,
                "sum": round(float(series.sum()), 2),
                "q25": round(q25, 2),
                "q75": round(q75, 2),
                "outliers_count": outliers_count
            }

    # Categorical distributions (top 8 values per categorical column)
    categorical_distributions = {}
    for col in cat_cols:
        val_counts = df[col].value_counts(dropna=False).head(8).to_dict()
        categorical_distributions[col] = {
            str(k): int(v) for k, v in val_counts.items()
        }

    # Grouped breakdowns (aggregate top numeric metric across top categorical columns)
    grouped_breakdowns = {}
    if num_cols and cat_cols:
        primary_num = num_cols[0]
        for c in num_cols:
            if any(k in c.lower() for k in ["revenue", "sales", "price", "profit", "amount", "total", "val", "target"]):
                primary_num = c
                break
                
        for cat in cat_cols[:3]:
            try:
                grp = df.groupby(cat)[primary_num].agg(["sum", "mean", "count"]).round(2)
                top_grp = grp.sort_values(by="sum", ascending=False).head(6)
                grouped_breakdowns[cat] = {
                    "metric": primary_num,
                    "breakdown": top_grp.to_dict(orient="index")
                }
            except Exception:
                pass

    # Correlation matrix for numerical fields
    correlations = {}
    if len(num_cols) >= 2:
        try:
            corr_df = df[num_cols].corr().round(3)
            correlations = corr_df.to_dict()
        except Exception:
            pass

    # Date ranges
    date_ranges = {}
    for col in date_cols:
        try:
            converted = pd.to_datetime(df[col], errors="coerce").dropna()
            if not converted.empty:
                date_ranges[col] = {
                    "start": str(converted.min()),
                    "end": str(converted.max())
                }
        except Exception:
            pass

    return {
        "rows": rows,
        "columns": cols,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "date_columns": date_cols,
        "data_types": dtypes,
        "missing_values": missing,
        "duplicate_rows": duplicates,
        "statistics": statistics,
        "categorical_distributions": categorical_distributions,
        "grouped_breakdowns": grouped_breakdowns,
        "correlations": correlations,
        "date_ranges": date_ranges,
        "top_5_records": df.head(5).astype(str).to_dict(orient="records")
    }
