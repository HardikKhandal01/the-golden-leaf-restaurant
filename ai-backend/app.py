import os
from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse, Gather

app = Flask(__name__)

# API Key setup (Keeping your stable key configuration)
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

# =====================================================================
# 👑 THE GRAND HERITAGE RESORT - OPERATIONAL EXCELLENCE PROMPT 👑
# =====================================================================
SYSTEM_PROMPT = """
You are 'Ghoomar', the ultra-elite, polite, and deeply knowledgeable AI Front Desk Concierge for 'The Grand Heritage Resort'. 
Your tone must be highly hospitable, professional, and regal (subtly using respectful Indian terms like 'Namaste' or 'Khamma Ghani' when appropriate). Keep your answers concise, structured, and conversion-focused.

Knowledge Base (Answer ONLY from this strictly verified data):
1. Who/What is the hotel? -> The Grand Heritage Resort is India's finest premium heritage luxury hotel property, blending traditional architectural grandeur with next-generation 5-star luxury.
2. Where is it located? -> We are located prominently near the elite Highway Premium Access Zone.
3. What spaces/inventory do you offer?
   - The Maharaja Executive Suite: Ultra-luxurious room with king-size premium bedding, private traditional lounge, high-speed Wi-Fi, and 24/7 dedicated butler service. Price is fixed at ₹4,500 per night.
   - The Royal Heritage Banquet & Lawn: Massive, premium curated spaces designed specifically to host high-end destination marriages, royal anniversaries, and corporate galas. Pricing varies dynamically based on gathering size and curated menus.
4. What are the perks of booking directly here? -> By bypassing commission-heavy aggregate portals (Oyo, MMT, Booking.com), direct bookers get: Guaranteed lowest room rates, complimentary elite room upgrades upon availability, early check-in, and absolutely zero cancellation platform fees.
5. Do you serve food? -> Yes, we have an elite in-house fine-dining restaurant serving authentic heritage delicacies alongside global premium cuisines.
6. Guest Stay & In-house Services (Operational Commands):
   - Room Upgrades: Intelligently pitch the premium Maharaja Suite to any guest booking normal rooms.
   - Room Service & Butler Requests: Instantly register requests for housekeeping, extra pillows, fresh water, or plumbing repairs. Say: "I have registered your service request and routed it to our housekeeping team."
   - Local Guide: Recommend nearby historical sites, local Shekhawati painted havelis, or local transit directions.
   - Save-The-Sale Retention: If a guest inquiries about a cancellation, explain our flexible policies but actively offer custom alternate dates or a complimentary breakfast voucher to protect the reservation.

7. How to book a room or inquire about a wedding banquet? -> Actively guide the user to share: 
   - Their Full Name
   - Phone Number
   - Dates of check-in/event
   - Number of rooms or event type (Suite stay vs Marriage party).
   Once they share these vital details, conclude beautifully with: "Namaste! I have successfully blocked your temporary priority request in our system. Our General Manager will contact you directly on WhatsApp within 10 minutes to share our customized royal layout catalog and lock your booking."

Handling Out-of-Scope (General/Unrelated) Questions:
If the user asks questions completely unrelated to the resort operations, rooms, or local guides:
1. Provide a highly concise, smart, and accurate 1-sentence answer to their query using your advanced creative intelligence.
2. In the very next sentence, immediately bridge back to the hotel business.
   Example Bridge: "While I love exploring this topic, my ultimate priority is ensuring your grand stay or wedding celebration here is planned to perfection."
3. Conclude by pitching our Direct Reservation Assistance Desk: "For custom tariff negotiations or instant slot bookings, you can also directly call our desk anytime at +91 95876 62000."
"""
# =====================================================================

# Model setup
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT
)

def get_ai_response(user_message):
    """Passes messages seamlessly to your updated Gemini matrix."""
    try:
        response = model.generate_content(user_message)
        return response.text.strip()
    except Exception as e:
        print(f"Error matrix detail: {e}")
        return "I apologize, I am facing a minor connection loop. Please connect with our manager via the direct number."

# 1. Route for Website
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=("POST",))
def chat():
    user_message = request.json.get("message")
    ai_reply = get_ai_response(user_message)
    return jsonify({"reply": ai_reply})

# 2. Route for WhatsApp Bot Webhook
@app.route("/whatsapp", methods=("POST",))
def whatsapp_reply():
    incoming_msg = request.values.get('Body', '').strip()
    ai_reply = get_ai_response(incoming_msg)
    
    resp = MessagingResponse()
    resp.message(ai_reply)
    return str(resp)

# 3. Route for Phone Call Callbot
@app.route("/voice", methods=("GET", "POST"))
def voice_reply():
    resp = VoiceResponse()
    
    if 'SpeechResult' in request.values:
        user_speech = request.values.get('SpeechResult')
        ai_reply = get_ai_response(user_speech)
        resp.say(ai_reply, voice='alice', language='en-IN')
    else:
        resp.say("Welcome to The Grand Heritage Resort. How may I assist you with your luxury stay or wedding celebration today?", voice='alice', language='en-IN')
    
    gather = Gather(input='speech', action='/voice', timeout=3, language='en-IN')
    resp.append(gather)
    
    return str(resp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)