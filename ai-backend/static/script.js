/**
 * THE GOLDEN LEAF - FINAL AI CONCIERGE LOGIC ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');

    if(sendBtn) sendBtn.addEventListener('click', () => processUserMessage());
    
    if(userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                processUserMessage();
            }
        });
    }

    if(clearChatBtn) clearChatBtn.addEventListener('click', resetChatUI);
});

async function processUserMessage(forcedText = null, isHiddenFromUI = false) {
    const inputElement = document.getElementById('userInput');
    const messageText = forcedText || inputElement.value.trim();

    if (!messageText) return;

    if (!isHiddenFromUI) {
        appendMessage(messageText, 'user');
        if(inputElement) inputElement.value = '';
        hideQuickActions();
    }

    const typingId = showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        removeElement(typingId);
        handleAIResponse(data.reply);

    } catch (error) {
        console.error("Transmission Error:", error);
        removeElement(typingId);
        appendMessage("I apologize, our secure servers are currently undergoing maintenance. Please contact our desk directly.", 'bot');
    }
}

// --- HYBRID UI INTERCEPTOR ---
function handleAIResponse(replyText) {
    let cleanText = replyText;
    let showForm = false;
    let showButtons = false;

    if (cleanText.includes('[SHOW_BOOKING_FORM]')) {
        cleanText = cleanText.replace('[SHOW_BOOKING_FORM]', '').trim();
        showForm = true;
    }

    if (cleanText.includes('[SHOW_CONFIRMATION_BUTTONS]')) {
        cleanText = cleanText.replace('[SHOW_CONFIRMATION_BUTTONS]', '').trim();
        showButtons = true;
    }

    if (cleanText) {
        appendMessage(cleanText, 'bot');
    }

    if (showForm) appendBookingForm();
    if (showButtons) appendConfirmationButtons();
}

// --- DYNAMIC FORM GENERATION WITH SMART TIME PICKER ---
function appendBookingForm() {
    const chatDisplay = document.getElementById('chatDisplay');
    const formId = 'bookingForm-' + Date.now();
    const today = new Date().toISOString().split('T')[0];

    // Generate Hour Options (01 to 12)
    let hourOptions = '<option value="" disabled selected>HH</option>';
    for (let i = 1; i <= 12; i++) {
        let val = i < 10 ? '0' + i : i;
        hourOptions += `<option value="${val}">${val}</option>`;
    }

    // Generate Minute Options (Luxury Standard 15-min Intervals)
    let minuteOptions = '<option value="" disabled selected>MM</option>';
    ['00', '15', '30', '45'].forEach(m => {
        minuteOptions += `<option value="${m}">${m}</option>`;
    });

    const formHTML = `
        <div class="chat-form-card" id="${formId}">
            <input type="text" id="bf-name" placeholder="Full Name" required>
            <input type="tel" id="bf-phone" placeholder="Mobile Number" required>
            
            <div style="display:flex; gap:10px; width:100%;">
                <input type="date" id="bf-date" min="${today}" style="flex:1;" required title="Select Booking Date">
                
                <div class="custom-time-picker" title="Select Time">
                    <select id="bf-hour" required>${hourOptions}</select>
                    <span class="time-colon">:</span>
                    <select id="bf-minute" required>${minuteOptions}</select>
                    <select id="bf-ampm" required>
                        <option value="PM" selected>PM</option>
                        <option value="AM">AM</option>
                    </select>
                </div>
            </div>
            
            <select id="bf-guests" required>
                <option value="" disabled selected>Number of Guests</option>
                <option value="1">1 Person</option>
                <option value="2">2 Persons</option>
                <option value="3-4">3 to 4 Persons</option>
                <option value="5+">5+ (Group)</option>
            </select>
            <select id="bf-occasion" required>
                <option value="" disabled selected>Occasion (Optional)</option>
                <option value="Casual Dining">Casual Dining</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Business Meeting">Business</option>
            </select>
            <button type="button" onclick="submitBookingForm('${formId}')">Continue Reservation</button>
        </div>
    `;
    
    chatDisplay.insertAdjacentHTML('beforeend', formHTML);
    scrollToBottom();

    // The Smart Logic: Auto-switch AM/PM based on Restaurant Hours
    setTimeout(() => {
        const hourSelect = document.getElementById('bf-hour');
        const ampmSelect = document.getElementById('bf-ampm');
        if (hourSelect && ampmSelect) {
            hourSelect.addEventListener('change', (e) => {
                const hr = parseInt(e.target.value);
                if (hr >= 1 && hr <= 11) {
                    ampmSelect.value = 'PM';
                }
            });
        }
    }, 100);
}

window.submitBookingForm = function(formId) {
    const name = document.getElementById('bf-name').value;
    const phone = document.getElementById('bf-phone').value;
    const date = document.getElementById('bf-date').value;
    
    const hh = document.getElementById('bf-hour').value;
    const mm = document.getElementById('bf-minute').value;
    const ampm = document.getElementById('bf-ampm').value;
    const time = `${hh}:${mm} ${ampm}`;
    
    const guests = document.getElementById('bf-guests').value;
    let occasion = document.getElementById('bf-occasion').value;
    if (!occasion) occasion = "Casual Dining";

    if (!name || !phone || !date || hh === "" || mm === "" || !guests) {
        alert("Please select the complete Date, Time, and Guest details to proceed.");
        return;
    }

    removeElement(formId);
    appendMessage(`Here are my details for the ${occasion}: ${date} at ${time} for ${guests} guests.`, 'user');

    const hiddenPayload = `[FORM_SUBMITTED: Name="${name}", Phone="${phone}", Date="${date}", Time="${time}", Guests="${guests}", Occasion="${occasion}"]`;
    processUserMessage(hiddenPayload, true);
}

window.handleConfirmation = function(buttonsId, userResponse) {
    removeElement(buttonsId);
    processUserMessage(userResponse);
}

// --- GLOBAL ATTACHMENTS FOR HTML BUTTONS ---
window.sendQuickMessage = function(text) {
    processUserMessage(text);
}

// --- UTILITIES ---
function hideQuickActions() {
    const quickActions = document.getElementById('quickActions');
    if (quickActions && !quickActions.classList.contains('hidden')) {
        quickActions.style.opacity = '0';
        setTimeout(() => quickActions.classList.add('hidden'), 300);
    }
}

function appendMessage(text, sender) {
    const chatDisplay = document.getElementById('chatDisplay');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    msgDiv.textContent = text; 
    chatDisplay.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const chatDisplay = document.getElementById('chatDisplay');
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    typingDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    chatDisplay.appendChild(typingDiv);
    scrollToBottom();
    return typingId;
}

function removeElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.remove();
}

function scrollToBottom() {
    const chatDisplay = document.getElementById('chatDisplay');
    requestAnimationFrame(() => {
        chatDisplay.scrollTo({ top: chatDisplay.scrollHeight, behavior: 'smooth' });
    });
}

function resetChatUI() {
    const chatDisplay = document.getElementById('chatDisplay');
    const quickActions = document.getElementById('quickActions');
    const messages = chatDisplay.querySelectorAll('.message, .chat-form-card, .chat-action-buttons');
    messages.forEach(msg => msg.remove());
    if (quickActions) {
        quickActions.classList.remove('hidden');
        setTimeout(() => quickActions.style.opacity = '1', 50);
    }
    scrollToBottom();
}