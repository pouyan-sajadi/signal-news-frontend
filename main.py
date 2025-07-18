import streamlit as st
from app.core.process import process_news
from app.core.logger import logger

st.set_page_config(
    page_title="Signal-Cut Through Noise", 
    page_icon="📡",
    layout="wide"
)

# --- CUSTOM STYLES ---
st.markdown("""
<style>
    /* Core body and text */
    body {
        color: #000000; /* Dark green for general text */
    }
    .stApp {
        background-color: #F5F7FA; /* Light grey background */
    }
    
    /* Headers - Important elements get larger sizes */
    h1 {
        color: #1B5E20; /* Very dark green for headers */
        font-weight: 600;
    }
    h2 {
        color: #1B5E20;
        font-weight: 600;
    }
    h3 {
        color: #1B5E20;
        font-weight: 600;
    }
    h4, h5, h6 {
        color: #1B5E20;
        font-weight: 600;
    }
    
    /* General markdown text */
    .stMarkdown {
        color: #000000; /* Dark green for markdown text */
    }
    .stMarkdown p {
        line-height: 1.6;
    }
    
    /* Bold text in markdown - for important labels */
    .stMarkdown p strong {
        color: #000000; /* Darker green for emphasis */
    }
    
    /* Buttons - Important CTAs */
    .stButton>button {
        background-color: #2E7D32; /* Dark green */
        color: #FFFFFF;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        padding: 12px 24px !important;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background-color: #1B5E20;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
    }

    /* Expander and containers */
    .stExpander {
        border-color: #66BB6A !important;
        border-radius: 8px;
        background-color: #FFFFFF;
    }
    .stExpander header {
        color: #1B5E20;
        font-weight: 500;
    }


    /* Text input - Important user interaction */
    .stTextInput label {
        color: #1B5E20 !important;
    }
    .stTextInput label p, .stTextInput label em {
    }
    .stTextInput input {
        background-color: #FFFFFF !important;
        color: #0D3E10 !important;
        border: 1px solid #66BB6A;
        padding: 10px 12px !important;
        height: 50px !important;
    }
    .stTextInput input::placeholder {
        color: #66BB6A !important;
        opacity: 0.7;
    }
    .stTextInput input:focus {
        border-color: #388E3C !important;
        box-shadow: 0 0 0 1px #388E3C;
    }

    /* Radio buttons and sliders */
    .stRadio label, .stSlider label {
        color: #1B5E20 !important;
    }
    
    /* Warning and error messages */
    .stAlert.st-warning {
        background-color: #FFF9C4;
        color: #F57C00;
        border: 1px solid #FFB74D;
    }
    .stAlert.st-error {
        background-color: #FFEBEE;
        color: #C62828;
        border: 1px solid #EF5350;
    }

    /* Status messages */
    div[data-testid="stStatusContainer"] {
        background-color: #FFFFFF;
        border: 1px solid #81C784;
    }
    
    /* Dividers */
    hr {
        border-color: #81C784;
    }
    
    /* Footer - less important */
    div[style*='text-align: center'] {
        color: #1B5E20 !important;
    }
    
    /* Links */
    a {
        color: #2E7D32 !important;
        text-decoration: none;
    }
    a:hover {
        color: #0D3E10 !important;
        text-decoration: underline;
    }
    
    /* Code blocks */
    code {
        background-color: #C8E6C9;
        color: #0D3E10;
        padding: 2px 6px;
        border-radius: 4px;
    }
    
    /* Captions and help text - less important */
    .stCaption, [data-testid="stCaptionContainer"] {
        color: #0D3E10 !important;
    }
    
    /* Small text elements */
    small, .small {
        color: #0D3E10 !important;
    }
    
    /* General paragraph and list items */
    p, li {
        line-height: 1.6;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 10px;
        background-color: #F5F7FA;
    }
    ::-webkit-scrollbar-thumb {
        background-color: #66BB6A;
        border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background-color: #388E3C;
    }
    
    /* Hide streamlit elements */
    .css-pxxe24 {
        visibility: hidden;
    }
    
    /* Toast notifications */
    .stToast {
        background-color: #FFFFFF !important;
        color: #1B5E20 !important;
        border: 1px solid #66BB6A !important;
    }
    
    /* Special styling for inline styles */
    div[data-testid="stHorizontalBlock"] > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) {
        padding-top: 0rem;

    }
    .stExpander header {
    color: #1B5E20;
    font-weight: 500;
    }
    /* Target h4 elements in markdown */
    .stMarkdown h4 {
        color: #1B5E20;
    }
    h1 {
    color: #1B5E20;
    font-weight: 600;
    }
    /* Target the main report container's markdown elements */
    div[data-testid="stVerticalBlock"] > div:has(> div > div > h2) ~ div .stMarkdown p {
    }

    /* Keep the bold text at the same size */
    div[data-testid="stVerticalBlock"] > div:has(> div > div > h2) ~ div .stMarkdown p strong {
}            
</style>
""", unsafe_allow_html=True)

st.title("Pick your topic, pick your style – see every side of the story")

# Initialize session state variables
if 'current_report' not in st.session_state:
    st.session_state.current_report = None
if 'report_history' not in st.session_state:
    st.session_state.report_history = []
if 'new_report_generated' not in st.session_state:
    st.session_state.new_report_generated = False
if 'report_just_finished' not in st.session_state:
    st.session_state.report_just_finished = False

# --- TOP-LEVEL ARCHIVING LOGIC ---
# This runs at the very top of every script execution
if st.session_state.report_just_finished:
    if st.session_state.current_report and st.session_state.current_report.get("creative_report"):
        st.session_state.report_history.insert(0, st.session_state.current_report)
        st.session_state.new_report_generated = True # Trigger balloons/toast for the archived report
    st.session_state.current_report = None # Clear current report to make space for new search
    st.session_state.report_just_finished = False # Reset the flag

# --- UI CONTAINERS ---
main_report_container = st.container()
history_container = st.container()
about_container = st.container()

# --- MAIN APPLICATION UI ---

st.markdown("<h4 style='font-size: 80px !important;'>Turn any news topic into a multi-perspective report with your choice of focus, depth, and tone</h4>", unsafe_allow_html=True)
st.write("")  # Empty line
st.write("")  # Empty line
st.write("")  # Empty line

# Topic Input
topic_input = st.text_input(
    "*What's happening that you want the full story on?*",
    value="",
    placeholder="Try: tech layoffs, Middle East tensions, AI advancements, Meta's new AI team...",
    key="topic_input"
)

# Analysis Settings
st.markdown("### Analysis Settings")

col_spacer1, col1, col_spacer2, col2, col_spacer3, col3, col_spacer4 = st.columns([0.1, 2, 0.5, 2, 0.5, 2, 0.5])

with col1:
    st.markdown("**🎯 What to Emphasize**")
    st.caption("Choose which aspects of the story matter most to you")
    
    focus = st.radio(
        "",
        options=[
            "Just the facts",
            "Human Impact", 
            "The Clash",
            "Hidden Angles",
            "The Money Trail"
        ],
        index=0,
        key="focus_setting",
        help='''
        **Just the facts**: Core information, data, and verified claims only
        
        **Human Impact**: Personal stories and how real people are affected
        
        **The Clash**: Conflicting viewpoints and who's arguing what
        
        **Hidden Angles**: Overlooked details and underreported perspectives
        
        **The Money Trail**: Financial implications and who profits/pays
        '''
    )

with col2:
    st.markdown("**📏 How Much Detail**")
    st.caption("Control the length and depth of your report")
    
    depth = st.select_slider(
        "",
        options=[1, 2, 3],
        value=2,
        format_func=lambda x: {
            1: "Quick Scan",
            2: "Standard Read",
            3: "Deep Dive"
        }[x],
        key="depth_setting",
        help='''
        **Quick Scan (30 sec)**: Key points only, perfect for a quick update
        
        **Standard Read (2 min)**: Balanced coverage with context
        
        **Deep Dive (5+ min)**: Comprehensive analysis with full details
        '''
    )

with col3:
    st.markdown("**✍️ Writing Style**")
    st.caption("How should we present the information?")
    
    tone_option = st.radio(
        "",
        options=[
            "Grandma Mode",
            "Gen Z Mode",
            "Express Mode", 
            "Commentary Mode"
        ],
        index=0,
        key="tone_setting",
        help='''
        **Grandma Mode**: Clear, patient explanations with context
        
        **Gen Z Mode**: Quick, energetic, with current references
        
        **Express Mode**: Crisp, efficient, straight to the point
        
        **Commentary Mode**: Includes analysis and connects the dots
        '''
    )

# Map tone_option to the tone expected by the agent
tone_mapping = {
            "Express Mode": "Sharp & Snappy",
            "Grandma Mode": "Grandma Mode",
            "Gen Z Mode": "Gen Z Mode",
            "Commentary Mode": "News with attitude" 
        }
tone = tone_mapping.get(tone_option, "Quick Hit Mode") 

st.markdown('''
<style>
    div[data-testid="stHorizontalBlock"] > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) {
        padding-top: 0rem;
    }
</style>
''', unsafe_allow_html=True)

# Deploy Button
generate_btn = st.button("**Build My Report**", type="primary", use_container_width=True)

# --- UI CONTAINERS ---
main_report_container = st.container()
status_container = st.container()
history_container = st.container()
about_container = st.container()

# --- DISPLAY ARCHIVED REPORTS (Always Visible) ---
with history_container:
    st.markdown("---")
    st.header("Previous Reports")
    if st.session_state.report_history:
        for i, report_data in enumerate(st.session_state.report_history):
            with st.expander(f"Report for '{report_data.get('topic', 'N/A')}'", expanded=False):
                st.markdown(report_data.get('creative_report', 'No report available.'))
    else:
        st.info("No previous reports yet. Search for a report above to see it appear here:)")

# --- ABOUT SECTION (Always Visible) ---
with about_container:
    st.markdown("---")
    with st.expander("About This Application"):
        st.markdown('''
        ### Break free from your news bubble. Get the FULL story.

        **The Problem:** Every news source has bias. CNN leans left, Fox leans right. TechCrunch loves startups, Reuters stays diplomatic. 
        Your location, their politics, the author's expertise—it all shapes what you read. Relying on 1-2 sources? You're missing half the story.

        **The Solution:** This smart news analyzer automatically:
        - **Finds stories you'd miss** (sources from different countries, politics, industries)
        - **Identifies each source's angle** (who's pro/anti, regional vs global perspective)
        - **Shows you the full debate** (what supporters say vs what critics argue)  
        - **Delivers one balanced summary** (all viewpoints in 2 minutes of reading)

        **Bottom line:** Get the nuanced, multi-angle story in 2 minutes instead of spending an hour tab-hopping between biased sources.

        ---

        **How it works:**
        - 🕷️ **Search Agent**: Crawls Google News for fresh articles
        - 🧠 **Profiler Agent**: Tags sources by tone, region, and bias  
        - 🎯 **Diversity Selector**: Picks articles that actually disagree with each other
        - 🗣️ **Debate Synthesizer**: Crafts a structured report with multiple viewpoints
        - 🎨 **Creative Editor**: Polishes the final output based on selected tone and depth.

        **Pro tip**: Try controversial topics like "AI regulation", "crypto crash", or "remote work debate" for insightful results.
        ''')

# --- PROCESSING LOGIC ---
if generate_btn:
    if topic_input.strip():
        logger.info(f"🧠 User requested topic: {topic_input}")

        # Archive the previous valid report
        if st.session_state.current_report and st.session_state.current_report.get("creative_report"):
            st.session_state.report_history.insert(0, st.session_state.current_report)
        
        # Reset the current report state
        st.session_state.current_report = {
            "topic": topic_input,
            "creative_report": None,
            "agent_details": {}
        }
        st.session_state.new_report_generated = False
        st.session_state.report_just_finished = False # Ensure this is false for a new run

        with status_container: # Use the new status container
            st.markdown("### Agents Status")
            st.markdown("*Grab a coffee - this might take up to a minute...*")
            with st.status("🚀 Initializing agent swarm...", expanded=True) as status:
                def update_ui_callback(output):
                    step = output.get("step")
                    status_val = output.get("status")
                    data = output.get("data")
                    message = output.get("message")

                    if status_val == "running":
                        status.update(label=f"⏳ {message}")
                    elif status_val == "completed":
                        st.session_state.current_report["agent_details"][step] = data
                        completed_message = {
                            "search": f"Found {len(data)} articles. Now profiling...",
                            "profiling": "Profiling complete. Now selecting diverse sources...",
                            "selection": f"Selected {len(data)} articles. Now synthesizing...",
                            "synthesis": "Initial report structured. Now polishing...",
                            "editing": "Report polished and ready!"
                        }.get(step, "Step completed.")
                        
                        if step == "editing":
                            st.session_state.current_report["creative_report"] = data
                            st.session_state.report_just_finished = True # Set the new flag here
                        
                        status.update(label=f"✅ {completed_message}")

                    elif status_val == "error":
                        status.update(label=f"💥 Agent crashed: {message}", state="error")

                user_preferences = {'focus': focus, 'depth': depth, 'tone': tone}
                process_successful = process_news(topic_input, user_preferences, status_callback=update_ui_callback)
                
                if process_successful:
                    status.update(label="✅ Mission accomplished!", state="complete")
                # If process_successful is False, a specific error message would have already been set by notify
                # so we don't need to update the status here with a generic error.

    else:
        st.warning("🎯 **Hey!** You forgot to enter a topic.")

# --- DISPLAY CURRENT REPORT ---
# This block will always display the last completed report in main_report_container
if st.session_state.current_report and st.session_state.current_report.get("creative_report"):
    with main_report_container:
        st.markdown("---")
        st.header("The Full Signal")
        st.markdown(st.session_state.current_report['creative_report'])  # Let Streamlit process markdown normally

        if st.session_state.new_report_generated:
            st.toast("Your report is ready!", icon="🎉")
            st.session_state.new_report_generated = False # Reset the flag

        with st.expander("🔍 **Nerd Stats** - See how the report was generated"):
            agent_details = st.session_state.current_report.get("agent_details", {})
            raw_news_list = agent_details.get('search')
            profiling_output = agent_details.get('profiling')
            selected_articles = agent_details.get('selection')

            if raw_news_list:
                st.markdown("#### 🕷️ Raw Intel")
                for i, article in enumerate(raw_news_list, 1):
                    st.markdown(f"{i}. {article.get('date', 'No date')} - [{article.get('title', 'Untitled')}]({article.get('url', '#')})")
                st.divider()
            if profiling_output:
                st.markdown("#### 🏷️ AI Profiling")
                profiling_lookup = {item["id"]: item for item in profiling_output}
                if raw_news_list:
                    for article in raw_news_list:
                        profile = profiling_lookup.get(article["id"], {})
                        tags = [f"**{k.title()}**: `{v}`" for k, v in profile.items() if k != 'id']
                        st.markdown(f"**📄 {article.get('title', 'Untitled')}**")
                        if tags:
                            st.markdown(" • ".join(tags))
                        else:
                            st.markdown("*Agent couldn't analyze this one* 🤷")
                        st.markdown("---")
                st.divider()
            if selected_articles:
                st.markdown("#### 🎯 Final Selection")
                for i, article in enumerate(selected_articles, 1):
                    st.markdown(f"{i}. [{article.get('title', 'Untitled')}]({article.get('url', '#')})")

# --- FOOTER ---
st.markdown("---")
st.markdown('''
<div style='text-align: center; color: #666; font-size: 0.9em;'>
Built with Python, Streamlit, and a lot of caffeine :D | <a href="https://github.com/pouyan-sajadi/news-agent-v2" target="_blank">GitHub Project</a>
</div>
''', unsafe_allow_html=True)



