import os
import re
import logging
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import google.generativeai as genai
from dotenv import load_dotenv

# -------------------------------------------------------------------
# 1. ENTERPRISE LOGGING & CONFIGURATION
# -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [ReqID: %(process)d] - %(message)s',
    handlers=[logging.FileHandler("server_operations.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.critical("CRITICAL: Gemini API Key missing from environment.")
    raise ValueError("System Halted: Missing API Key.")

genai.configure(api_key=GEMINI_API_KEY)

# -------------------------------------------------------------------
# 2. FLASK APP & SECURITY SHIELDS (CORS & RATE LIMITING)
# -------------------------------------------------------------------
app = Flask(__name__)

# Strict CORS: Only allowing requests from legitimate origins
CORS(app, resources={r"/chat": {"origins": "*"}}) # In production, replace "*" with your GitHub Pages URL

# Anti-Spam: Limiting requests per IP to prevent billing fraud
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["500 per day", "100 per hour"],
    storage_uri="memory://"
)

# -------------------------------------------------------------------
# 3. AI IDENTITY & KNOWLEDGE BASE (RESTAURANT OPTIMIZED)
# -------------------------------------------------------------------
# =====================================================================
# 3. AI IDENTITY & KNOWLEDGE BASE (HYBRID UI OPTIMIZED)
# =====================================================================
SYSTEM_PROMPT = """
You are 'Ghoomar', the elite AI Reservation Concierge for 'The Golden Leaf Restaurant'.
Tone: Hospitable, professional, and warmly Indian (use 'Namaste' selectively).

KNOWLEDGE BASE:
- Timings: 5:00 PM - 11:00 PM (Mon-Fri) | 12:00 PM - 12:00 AM (Weekends).
- Menu: Truffle Parmesan Fries, Prime Ribeye Steak, Paneer Butter Masala, Chocolate Lava Cake.

CRITICAL UI TRIGGERS (HYBRID CHAT):
You do not ask for booking details one by one. You use rich UI forms. Follow these strict rules:

RULE 1: If the user indicates they want to book a table, DO NOT ask for their name or date. Instead, reply EXACTLY with this:
"It would be my pleasure to secure a table for you. Please fill out these quick details:"
[SHOW_BOOKING_FORM]

RULE 2: The system will silently send you a message starting with "[FORM_SUBMITTED...]". When you receive this, summarize their details elegantly and ask for their final confirmation. You MUST append this to your reply:
[SHOW_CONFIRMATION_BUTTONS]

RULE 3: If the user clicks Confirm, reply with a warm confirmation, suggest a signature dish or ask if they want to see the menu, and append:
[LEAD_GENERATED: Name="<name>", Phone="<phone>", Date="<date>", Guests="<guests>"]
"""

# Advanced Context Model Setup
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT
)

# In-Memory Conversation State (Solves the "No Memory" issue)
# Note: For massive scale, this would be moved to Redis.
chat_sessions = {}

# -------------------------------------------------------------------
# 4. DATA SANITIZATION & VALIDATION
# -------------------------------------------------------------------
def sanitize_input(text):
    """Removes HTML tags and limits length to prevent injection and buffer attacks."""
    if not text:
        return ""
    text = text[:1000] # Hard limit on characters
    clean_text = re.sub(r'<[^>]*>', '', text) # Strip HTML
    return clean_text.strip()

def extract_and_log_lead(ai_response):
    """Detects the secret code from the AI, logs the business lead, and cleans the output."""
    lead_pattern = r'\[LEAD_GENERATED:.*?\]'
    lead_match = re.search(lead_pattern, ai_response)
    
    if lead_match:
        lead_data = lead_match.group(0)
        # In a real business, this saves to a Database or emails the Manager
        logger.info(f"💰 NEW BUSINESS LEAD SECURED: {lead_data}")
        
        # Remove the internal code so the user doesn't see it
        clean_response = re.sub(lead_pattern, '', ai_response).strip()
        return clean_response
    return ai_response

# -------------------------------------------------------------------
# 5. CORE API ROUTES
# -------------------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    # Ye command backend ko bolegi ki API text ki jagah UI design show karo
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
@limiter.limit("15 per minute") # Extra strict limit on the chat endpoint
def chat():
    start_time = datetime.now()
    
    # 1. Input Extraction & Validation
    raw_message = request.json.get("message", "")
    user_ip = get_remote_address()
    
    user_message = sanitize_input(raw_message)
    if not user_message:
        logger.warning(f"Empty or invalid request rejected from IP: {user_ip}")
        return jsonify({"reply": "I could not process that. How may I assist you with The Golden Leaf menu today?"}), 400

    # 2. Memory Management (Load or Create Session)
    if user_ip not in chat_sessions:
        logger.info(f"Creating new conversation memory sequence for IP: {user_ip}")
        chat_sessions[user_ip] = model.start_chat(history=[])
    
    session = chat_sessions[user_ip]

    # 3. AI Execution & Error Handling
    try:
        logger.info(f"Processing request for IP: {user_ip} | Tokens approx: {len(user_message.split())}")
        response = session.send_message(user_message)
        
        # 4. Lead Generation Interception
        final_reply = extract_and_log_lead(response.text)
        
        # Analytics Tracking
        execution_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Response successfully delivered in {execution_time}s")
        
        return jsonify({"reply": final_reply})

    except Exception as e:
        # Segmented Error Handling
        error_msg = str(e).lower()
        if "quota" in error_msg or "exhausted" in error_msg:
            logger.error("CRITICAL: Gemini API Quota Exceeded.")
            return jsonify({"reply": "Our reservation desk is currently experiencing high volume. Please call us directly to book your table."}), 503
        else:
            logger.error(f"Internal System Error: {str(e)}")
            return jsonify({"reply": "I am undergoing a brief system optimization. Please contact our manager at +1 (555) 234-5678 for immediate assistance."}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)