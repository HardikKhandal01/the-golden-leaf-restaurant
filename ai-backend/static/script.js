// GSAP SCROLL SYSTEM INITIALIZATION
gsap.registerPlugin(ScrollTrigger);

// Responsive execution check hook parameter
const isMobile = window.innerWidth <= 768;

// 1. Room Immersive Scaling Vector (Adaptive factor based on device state viewport)
gsap.to(".bedroom .scene-img", {
    scale: isMobile ? 1.25 : 1.4, // Lower adaptive limit for mobile avoids pixel blur stretch layout anomalies
    ease: "none",
    scrollTrigger: {
        trigger: ".tour-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
    }
});

// 2. Hotspots Presentation Management
function showInfo(text) {
    const box = document.getElementById("info-box");
    const infoText = document.getElementById("info-text");
    infoText.innerText = text;
    box.classList.remove("hidden");
}

function closeInfo() {
    document.getElementById("info-box").classList.add("hidden");
}

// 3. Scene Switcher Mechanics (Suite to Bath)
function switchScene(sceneName) {
    closeInfo();
    document.querySelectorAll('.scene').forEach(scene => scene.classList.remove('active-scene'));
    
    if(sceneName === 'bathroom') {
        document.querySelector('.bathroom').classList.add('active-scene');
    } else {
        document.querySelector('.bedroom').classList.add('active-scene');
    }
}

// 4. Interactive Expanding Navbar Search Engine
function toggleSearch() {
    const searchInput = document.getElementById("nav-search-input");
    searchInput.classList.toggle("open-search");
    if(searchInput.classList.contains("open-search")) {
        searchInput.focus();
    }
}

// 5. Chat Drawer Display Management (Fluid Native Toggle System)
function toggleChat() {
    const chatContainer = document.getElementById("chat-container");
    const triggerBtn = document.querySelector(".chat-trigger-btn");
    
    chatContainer.classList.toggle("hidden");
    
    // Mobile layouts keep the main corner floating triggers persistent behind immersive modes
    if (!window.matchMedia("(max-width: 768px)").matches) {
        triggerBtn.classList.toggle("hidden");
    }
    
    // Auto focus text input area upon click trigger activation loop parameters
    if (!chatContainer.classList.contains("hidden")) {
        setTimeout(() => {
            document.getElementById("user-input").focus();
        }, 100);
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    
    // Smooth scrolling animation container frame mapping
    chatBox.animate({
        scrollTop: chatBox.scrollHeight
    }, { duration: 200, fill: "forwards" });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// 6. Seamless AJAX Connection to Flask Route Pipeline
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const message = inputField.value.trim();
    if (message === "") return;

    appendMessage(message, "user");
    inputField.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        appendMessage(data.reply, "bot");
    } catch (error) {
        appendMessage("I apologize, our digital server link is encountering high volume. Please call our direct desk immediately.", "bot");
    }
}

// Global Click Listener: Search bar outside boundaries dismissal setup mapping
document.addEventListener("click", function (event) {
    const searchContainer = document.querySelector(".search-container");
    const searchInput = document.getElementById("nav-search-input");
    
    if (searchContainer && !searchContainer.contains(event.target) && searchInput.classList.contains("open-search")) {
        searchInput.classList.remove("open-search");
    }
});

// Dynamic Resize Engine updates context loops on layout scale alterations
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});