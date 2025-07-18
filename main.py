import streamlit as st
import requests
import websockets
import asyncio
import json

st.set_page_config(
    page_title="Signal-Cut Through Noise", 
    page_icon="📡",
    layout="wide"
)

# --- CUSTOM STYLES ---
st.markdown("""
<style>
    body {
        color: #000000;
    }
    .stApp {
        background-color: #F5F7FA;
    }
    h1, h2, h3, h4, h5, h6 {
        color: #1B5E20;
        font-weight: 600;
    }
    .stButton>button {
        background-color: #2E7D32;
        color: #FFFFFF;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        padding: 12px 24px !important;
    }
</style>
""", unsafe_allow_html=True)

st.title("Pick your topic, pick your style – see every side of the story")

topic_input = st.text_input(
    "What's happening that you want the full story on?",
    placeholder="Try: tech layoffs, Middle East tensions, AI advancements...",
)

focus = st.radio(
    "Focus",
    ["Just the facts", "Human Impact", "The Clash", "Hidden Angles", "The Money Trail"]
)
depth = st.select_slider("Depth", options=[1, 2, 3], value=2)
tone = st.radio("Tone", ["Grandma Mode", "Gen Z Mode", "Express Mode", "Commentary Mode"])

generate_btn = st.button("Build My Report", type="primary", use_container_width=True)

if generate_btn and topic_input:
    user_preferences = {"focus": focus, "depth": depth, "tone": tone}
    
    try:
        # Make HTTP request to start the process
        response = requests.post("http://127.0.0.1:8000/process_news", json={"topic": topic_input, "user_preferences": user_preferences})
        response.raise_for_status()
        job_id = response.json()["job_id"]

        # Connect to WebSocket for status updates
        uri = f"ws://127.0.0.1:8000/ws/status/{job_id}"
        
        async def listen_to_websocket():
            with st.status("🚀 Initializing agent swarm...", expanded=True) as status:
                try:
                    async with websockets.connect(uri) as websocket:
                        while True:
                            message = await websocket.recv()
                            data = json.loads(message)
                            
                            if data.get("status") == "running":
                                status.update(label=f"⏳ {data.get('message')}")
                            elif data.get("status") == "completed":
                                if data.get("step") == "editing":
                                    st.session_state.creative_report = data.get("data")
                                    status.update(label="✅ Report polished and ready!", state="complete")
                                    break
                                else:
                                    completed_message = {
                                        "search": f"Found {len(data.get('data', []))} articles. Now profiling...",
                                        "profiling": "Profiling complete. Now selecting diverse sources...",
                                        "selection": f"Selected {len(data.get('data', []))} articles. Now synthesizing...",
                                        "synthesis": "Initial report structured. Now polishing...",
                                    }.get(data.get("step"), "Step completed.")
                                    status.update(label=f"✅ {completed_message}")
                            elif data.get("status") == "error":
                                status.update(label=f"💥 Agent crashed: {data.get('message')}", state="error")
                                break
                except Exception as e:
                    st.error(f"Failed to connect to WebSocket: {e}")

        asyncio.run(listen_to_websocket())

    except requests.exceptions.RequestException as e:
        st.error(f"Failed to start process: {e}")

if "creative_report" in st.session_state:
    st.markdown("---")
    st.header("The Full Signal")
    st.markdown(st.session_state.creative_report)