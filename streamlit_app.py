import os
import json
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
from notebook_logic.extracted_functions import (
    load_dataset,
    extract_summary,
    run_data_quality_analysis,
    run_business_analysis,
    run_visualization_recommendations,
    run_executive_strategy,
    ask_code_qa,
    ask_strategic_qa,
    generate_plotly_chart,
    DEFAULT_GROQ_KEY
)

# Streamlit Page Setup
st.set_page_config(
    page_title="Autonomous AI Data Analyst | Page-Based Platform",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Enterprise CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');

    html, body, [class*="css"], .stApp {
        background-color: #F8FAFC !important;
        color: #0F172A !important;
        font-family: 'Inter', sans-serif !important;
    }

    .block-container {
        padding-top: 1.75rem !important;
        padding-bottom: 4rem !important;
        max-width: 1350px !important;
    }

    .hero-container {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 1.75rem 2.25rem;
        border: 1px solid #E2E8F0;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
        margin-bottom: 1.5rem;
    }

    .hero-h1 {
        font-family: 'Poppins', sans-serif;
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.3rem;
    }

    .hero-tagline {
        font-size: 1rem;
        color: #64748B;
        font-weight: 500;
        margin-bottom: 0.8rem;
    }

    .saas-card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 1.75rem 2rem;
        border: 1px solid #E2E8F0;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
        margin-bottom: 1.5rem;
    }

    .saas-card-header {
        font-family: 'Poppins', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #0F172A !important;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 1rem;
        border-bottom: 1px solid #F1F5F9;
        padding-bottom: 0.75rem;
    }

    /* Dark Sidebar */
    [data-testid="stSidebar"] {
        background-color: #0F172A !important;
        border-right: 1px solid #1E293B !important;
    }

    [data-testid="stSidebar"] p, [data-testid="stSidebar"] span, [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3, [data-testid="stSidebar"] label {
        color: #F8FAFC !important;
    }

    .sidebar-card {
        background: #1E293B;
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid #334155;
        margin-bottom: 1rem;
    }

    /* Chat Bubbles */
    .chat-bubble-user {
        background: #4F46E5;
        color: #FFFFFF !important;
        padding: 1rem 1.25rem;
        border-radius: 16px 16px 2px 16px;
        margin-bottom: 1rem;
        max-width: 80%;
        margin-left: auto;
        font-size: 0.95rem;
    }

    .chat-bubble-ai {
        background: #FFFFFF;
        color: #0F172A !important;
        border: 1px solid #E2E8F0;
        padding: 1.25rem 1.5rem;
        border-radius: 16px 16px 16px 2px;
        margin-bottom: 1rem;
        max-width: 90%;
        font-size: 0.95rem;
    }
</style>
""", unsafe_allow_html=True)

# Session State Initializations
if "df" not in st.session_state:
    st.session_state.df = None
if "summary" not in st.session_state:
    st.session_state.summary = None
if "api_key" not in st.session_state:
    st.session_state.api_key = DEFAULT_GROQ_KEY
if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar — Single CSV Upload & Page Navigation
with st.sidebar:
    st.markdown("""
    <div style="padding: 0.5rem 0 0.5rem 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; color: white;">⚡</div>
            <div>
                <h3 style="margin: 0; font-family: Poppins; font-size: 1.1rem; font-weight: 700; color: #FFFFFF !important;">Autonomous AI</h3>
                <p style="margin: 0; font-size: 0.75rem; color: #94a3b8 !important;">Page-Based Architecture</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("<hr style='border-color: #334155; margin: 0.75rem 0;'>", unsafe_allow_html=True)
    
    # 1. Upload CSV ONCE
    st.markdown("<p style='font-family: Poppins; font-weight: 600; font-size: 0.8rem; color: #CBD5E1 !important;'>📁 SINGLE DATASET INGESTION</p>", unsafe_allow_html=True)
    uploaded_file = st.file_uploader("Upload CSV File (Reused across pages)", type=["csv"])
    
    default_csv = "realistic_autonomous_data_analyst_dataset.csv"
    if uploaded_file is None and st.session_state.df is None and os.path.exists(default_csv):
        if st.button("🚀 Load Demo Dataset", use_container_width=True):
            st.session_state.df = load_dataset(default_csv)
            st.session_state.summary = extract_summary(st.session_state.df)
            st.rerun()

    if uploaded_file is not None:
        try:
            st.session_state.df = load_dataset(uploaded_file)
            st.session_state.summary = extract_summary(st.session_state.df)
        except Exception as e:
            st.error(f"Error loading dataset: {e}")

    # Display Active Dataset Status
    if st.session_state.df is not None:
        st.markdown(f"""
        <div class="sidebar-card">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="height:9px; width:9px; background:#10B981; border-radius:50%; display:inline-block;"></span>
                <span style="font-weight:600; font-size:0.85rem; color:#F8FAFC !important;">Active Dataset Loaded</span>
            </div>
            <p style="font-size:0.75rem; color:#94a3b8 !important; margin:0;">Rows: {len(st.session_state.df):,} | Columns: {len(st.session_state.df.columns)}</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<hr style='border-color: #334155; margin: 0.75rem 0;'>", unsafe_allow_html=True)
    
    # 2. PAGE NAVIGATION
    st.markdown("<p style='font-family: Poppins; font-weight: 600; font-size: 0.8rem; color: #CBD5E1 !important;'>🧭 PAGE NAVIGATION</p>", unsafe_allow_html=True)
    nav_choice = st.radio(
        "Select Active Page:",
        [
            "📋 1. Data Overview & Quality",
            "📊 2. Statistical & Business Analysis",
            "🎨 3. Recommended Visualizations",
            "💼 4. Executive Summary & Action Plan",
            "🤖 5. AI Copilot Chat Interface"
        ],
        label_visibility="collapsed"
    )

    st.markdown("<hr style='border-color: #334155; margin: 0.75rem 0;'>", unsafe_allow_html=True)
    st.markdown("<p style='font-family: Poppins; font-weight: 600; font-size: 0.8rem; color: #CBD5E1 !important;'>🔑 AI MODEL CONFIG</p>", unsafe_allow_html=True)
    key_input = st.text_input("Groq API Key", value=st.session_state.api_key, type="password")
    if key_input:
        st.session_state.api_key = key_input

# Empty State Check
if st.session_state.df is None:
    st.markdown("""
    <div style="background:#FFFFFF; border:2px dashed #CBD5E1; border-radius:16px; padding:3.5rem 2rem; text-align:center; margin-top:1rem;">
        <div style="font-size:3.5rem; margin-bottom:1rem;">📊</div>
        <h2 style="font-family:Poppins; font-weight:700; color:#0F172A; margin-bottom:0.5rem;">Upload a dataset to begin</h2>
        <p style="color:#64748B; max-width:600px; margin:0 auto 1.5rem auto;">Upload your CSV once in the sidebar or click 'Load Demo Dataset'. All 5 pages will automatically reuse the active dataset.</p>
        <p style="font-size:0.9rem; color:#4F46E5; font-weight:600;">👈 Ingest data from the sidebar to activate page navigation</p>
    </div>
    """, unsafe_allow_html=True)
    st.stop()

df = st.session_state.df
summary = st.session_state.summary

# =========================================================
# PAGE 1: /analysis — DATA OVERVIEW & QUALITY ASSESSMENT
# =========================================================
if nav_choice.startswith("📋 1"):
    st.markdown("""
    <div class="hero-container">
        <div class="hero-h1">📋 Output 1: Data Overview & Quality Assessment</div>
        <div class="hero-tagline">Evaluates schema completeness, data type integrity, duplicate records, and health scoring.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="saas-card">
        <div class="saas-card-header">📌 Data Quality Assessment Report</div>
    """, unsafe_allow_html=True)
    
    if st.button("Run Output 1: Data Quality Analysis", type="primary"):
        with st.spinner("Invoking analysis_service (Output 1)..."):
            try:
                st.session_state.out1 = run_data_quality_analysis(summary, st.session_state.api_key)
                st.success("✅ Output 1 generated successfully!")
            except Exception as e:
                st.error(f"Error executing analysis_service: {e}")

    if "out1" in st.session_state:
        st.markdown(st.session_state.out1)
    else:
        st.info("Click 'Run Output 1: Data Quality Analysis' to generate this page's report.")

    st.markdown("</div>", unsafe_allow_html=True)

# =========================================================
# PAGE 2: /business-analysis — STATISTICAL & BUSINESS ANALYSIS
# =========================================================
elif nav_choice.startswith("📊 2"):
    st.markdown("""
    <div class="hero-container">
        <div class="hero-h1">📊 Output 2: Statistical & Business Analysis</div>
        <div class="hero-tagline">Deep-dive statistical distribution, correlation insights, and ranked top 10 data findings.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="saas-card">
        <div class="saas-card-header">📊 Statistical & Business Analysis Report</div>
    """, unsafe_allow_html=True)

    if st.button("Run Output 2: Business Analysis", type="primary"):
        with st.spinner("Invoking business_analysis_service (Output 2)..."):
            try:
                st.session_state.out2 = run_business_analysis(summary, st.session_state.api_key)
                st.success("✅ Output 2 generated successfully!")
            except Exception as e:
                st.error(f"Error executing business_analysis_service: {e}")

    if "out2" in st.session_state:
        st.markdown(st.session_state.out2)
    else:
        st.info("Click 'Run Output 2: Business Analysis' to generate this page's report.")

    st.markdown("</div>", unsafe_allow_html=True)

# =========================================================
# PAGE 3: /visualizations — RECOMMENDED VISUALIZATIONS
# =========================================================
elif nav_choice.startswith("🎨 3"):
    st.markdown("""
    <div class="hero-container">
        <div class="hero-h1">🎨 Output 3: Recommended Visualizations</div>
        <div class="hero-tagline">Automated Plotly chart recommendations tailored specifically to your active dataset.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="saas-card">
        <div class="saas-card-header">🎨 Plotly Visualizations Engine</div>
    """, unsafe_allow_html=True)

    if st.button("Run Output 3: Visualization Generator", type="primary"):
        with st.spinner("Invoking visualization_service (Output 3)..."):
            try:
                st.session_state.out3 = run_visualization_recommendations(summary, st.session_state.api_key)
                st.success("✅ Output 3 generated successfully!")
            except Exception as e:
                st.error(f"Error executing visualization_service: {e}")

    if "out3" in st.session_state:
        chart_config = st.session_state.out3
        charts = chart_config.get("charts", [])
        if charts:
            for idx, chart in enumerate(charts):
                st.markdown(f"##### Chart {idx+1}: {chart.get('title', 'Chart')}")
                if chart.get("business_reason"):
                    st.caption(f"💡 **Business Reason:** {chart.get('business_reason')}")
                fig = generate_plotly_chart(df, chart)
                if fig:
                    st.plotly_chart(fig, use_container_width=True)
                st.markdown("---")
        else:
            st.warning("No charts generated.")
    else:
        st.info("Click 'Run Output 3: Visualization Generator' to render charts on this page.")

    st.markdown("</div>", unsafe_allow_html=True)

# =========================================================
# PAGE 4: /summary — EXECUTIVE SUMMARY & ACTION PLAN
# =========================================================
elif nav_choice.startswith("💼 4"):
    st.markdown("""
    <div class="hero-container">
        <div class="hero-h1">💼 Output 4: Executive Summary & Management Action Plan</div>
        <div class="hero-tagline">Synthesizes dataset findings into prioritized C-suite strategic implementation roadmaps.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="saas-card">
        <div class="saas-card-header">💼 Executive Strategy & Action Plan</div>
    """, unsafe_allow_html=True)

    if st.button("Run Output 4: Executive Strategy", type="primary"):
        with st.spinner("Invoking summary_service (Output 4)..."):
            try:
                bus_text = st.session_state.get("out2", "")
                st.session_state.out4 = run_executive_strategy(summary, bus_text, st.session_state.api_key)
                st.success("✅ Output 4 generated successfully!")
            except Exception as e:
                st.error(f"Error executing summary_service: {e}")

    if "out4" in st.session_state:
        st.markdown(st.session_state.out4)
    else:
        st.info("Click 'Run Output 4: Executive Strategy' to generate this page's strategy roadmap.")

    st.markdown("</div>", unsafe_allow_html=True)

# =========================================================
# PAGE 5: /chat — AI COPILOT CHAT INTERFACE
# =========================================================
elif nav_choice.startswith("🤖 5"):
    st.markdown("""
    <div class="hero-container">
        <div class="hero-h1">🤖 Feature 5: AI Copilot Chat Interface</div>
        <div class="hero-tagline">Interactive natural language code execution assistant or strategic business analyst.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="saas-card">
        <div class="saas-card-header">💬 Chat Copilot Q&A</div>
    """, unsafe_allow_html=True)

    qa_mode = st.radio("Select Engine Mode:", ["Option 1: Python Code Execution Assistant", "Option 2: Strategic Business Intelligence Analyst"], horizontal=True)
    
    col_input, col_btn = st.columns([5, 1])
    with col_input:
        user_q = st.text_input("Ask your dataset anything...", placeholder="e.g. What is the total revenue by category?", label_visibility="collapsed")
    with col_btn:
        send_btn = st.button("Send", use_container_width=True)

    if send_btn and user_q.strip():
        st.session_state.messages.append({"role": "user", "content": user_q})
        with st.spinner("Invoking chat_service..."):
            try:
                if qa_mode.startswith("Option 1"):
                    code, result = ask_code_qa(summary, df, user_q, st.session_state.api_key)
                    ai_content = f"**Generated Pandas Code:**\n```python\n{code}\n```\n\n**Result:**\n{result}"
                else:
                    ai_content = ask_strategic_qa(summary, user_q, st.session_state.api_key)
                
                st.session_state.messages.append({"role": "assistant", "content": ai_content})
            except Exception as e:
                st.session_state.messages.append({"role": "assistant", "content": f"⚠️ Error: {e}"})

    # Render Chat Bubble History
    st.markdown("<br>", unsafe_allow_html=True)
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            st.markdown(f'<div class="chat-bubble-user">👤 <b>You:</b><br>{msg["content"]}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="chat-bubble-ai">🤖 <b>AI Data Analyst Copilot:</b><br>{msg["content"]}</div>', unsafe_allow_html=True)

    if st.session_state.messages:
        if st.button("🗑️ Clear Chat History"):
            st.session_state.messages = []
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

# Vercel Python Serverless Entrypoint Compatibility
try:
    from backend.app.main import app as backend_app
    app = backend_app
    handler = backend_app
except Exception:
    app = None
    handler = None
