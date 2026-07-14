/**
 * app.js
 * Main initialization file for animations, UI interactions, and listeners.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Init AOS Animations ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }

    // --- 2. Live Table Stats Updates ---
    const updateLiveStats = () => {
        const stats = Storage.getLiveStats();
        
        const availableEl = document.getElementById('liveAvailable');
        const bookedEl = document.getElementById('liveBooked');
        const vipEl = document.getElementById('liveVIP');

        if (availableEl) availableEl.textContent = stats.available < 10 ? `0${stats.available}` : stats.available;
        if (bookedEl) bookedEl.textContent = stats.booked < 10 ? `0${stats.booked}` : stats.booked;
        if (vipEl) vipEl.textContent = stats.vip < 10 ? `0${stats.vip}` : stats.vip;
    };

    // Initial load and listen for updates
    updateLiveStats();
    window.addEventListener('bookingUpdated', updateLiveStats);

    // --- 3. Navbar Scroll Behavior ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Change navbar background opacity on scroll
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        } else {
            navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        // Active link switching
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- 4. Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinksContainer.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- 5. AI Receptionist Mock Click ---
    const aiBtns = document.querySelectorAll('#btnAiAssist, .floating-ai-btn');
    aiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert("AI Receptionist System Initializing... (Future Voiceflow/ElevenLabs Integration here)");
        });
    });
});
// --- 6. AI RECEPTIONIST INTEGRATION (Secure Fetch) ---
document.addEventListener('DOMContentLoaded', () => {
    // Ye URL Render.com deploy hone ke baad milega. Abhi local testing ke liye localhost hai.
    // Replace this with your Render URL later (e.g., 'https://ghoomar-ai.onrender.com/chat')
    const AI_BACKEND_URL = 'http://127.0.0.1:5000/chat'; 

    const aiBtns = document.querySelectorAll('.floating-ai-btn, #btnAiAssist');
    
    // Creating Chat Widget HTML dynamically so you don't clutter your index.html
    const chatWidgetHTML = `
        <div class="chat-container hidden" id="chatContainer">
            <div class="chat-header">
                <div class="header-info">
                    <div class="avatar">🎧</div>
                    <div>
                        <h3 style="color: white; margin-bottom: 2px; font-size:1rem;">Ghoomar | AI</h3>
                        <span style="color: #2ecc71; font-size: 0.75rem;">Online | Golden Leaf Desk</span>
                    </div>
                </div>
                <button class="close-btn" id="closeChatBtn" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            <div class="chat-box" id="chatBox">
                <div class="message bot-message">Namaste! Welcome to The Golden Leaf. I can assist you with our menu, timings, or table reservations. How may I serve you today?</div>
            </div>
            <div class="input-area">
                <input type="text" id="aiUserInput" placeholder="Ask about our menu..." onkeypress="handleAIKeyPress(event)">
                <button onclick="sendAIMessage()" style="background:var(--primary-gold); border:none; padding:10px 15px; cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);

    const chatContainer = document.getElementById('chatContainer');
    const closeChatBtn = document.getElementById('closeChatBtn');
    
    // Open Chat
    aiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatContainer.classList.remove('hidden');
        });
    });

    // Close Chat
    closeChatBtn.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });
});

// Global Function for Sending Message
async function sendAIMessage() {
    const inputField = document.getElementById("aiUserInput");
    const message = inputField.value.trim();
    if (message === "") return;

    appendAIMessage(message, "user");
    inputField.value = "";

    // Show typing indicator
    const chatBox = document.getElementById("chatBox");
    const typingId = 'typing-' + Date.now();
    chatBox.innerHTML += `<div class="message bot-message" id="${typingId}">...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // ACTUAL CONNECTION TO BACKEND
        const response = await fetch('http://127.0.0.1:5000/chat', { // CHANGE THIS URL ONCE HOSTED
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        // Remove typing indicator and show real reply
        document.getElementById(typingId).remove();
        appendAIMessage(data.reply, "bot");
    } catch (error) {
        document.getElementById(typingId).remove();
        appendAIMessage("I apologize, our cloud server is currently offline. Please call our direct desk.", "bot");
    }
}

function appendAIMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.handleAIKeyPress = function(event) {
    if (event.key === "Enter") {
        sendAIMessage();
    }
}