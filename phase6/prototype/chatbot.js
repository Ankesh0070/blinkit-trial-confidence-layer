document.addEventListener('DOMContentLoaded', () => {
    injectChatbot();
});

function injectChatbot() {
    if (document.getElementById('chatWidget')) return;
    
    const html = `
    <!-- Chatbot FAB & Window -->
    <div id="chatWidget" class="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[110] flex flex-col items-end">
        <!-- Chat Window -->
        <div id="chatWindow" class="hidden w-[350px] h-[500px] max-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden mb-4 transition-all duration-300 transform origin-bottom-right">
            <!-- Header -->
            <div class="bg-primary flex items-center justify-between p-4 text-on-primary">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined">smart_toy</span>
                    <span class="font-headline-md text-lg">Discovery Assistant</span>
                </div>
                <button onclick="toggleChat()" class="hover:bg-primary-fixed-dim rounded-full p-1 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <!-- Messages Area -->
            <div id="chatMessages" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface-container-lowest">
                <!-- Initial greeting -->
                <div class="self-start max-w-[85%] bg-surface-container p-3 rounded-2xl rounded-tl-sm text-on-surface font-body-md text-sm border border-outline-variant/20 shadow-sm">
                    Hi! I'm your Blinkit product discovery assistant. What are you looking for today?
                </div>
            </div>
            <!-- Input Area -->
            <div class="p-3 bg-surface border-t border-outline-variant/20 flex gap-2 items-center">
                <input type="text" id="chatInput" placeholder="Ask about products..." class="flex-1 bg-surface-container-high rounded-full px-4 py-2 text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface border-none" onkeypress="handleChatKeyPress(event)">
                <button onclick="sendMessage()" class="bg-primary text-on-primary p-2 rounded-full hover:bg-primary-fixed-dim transition-colors flex items-center justify-center shadow-md">
                    <span class="material-symbols-outlined text-[20px]">send</span>
                </button>
            </div>
        </div>
        
        <!-- FAB -->
        <button id="chatFab" onclick="toggleChat()" class="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center relative">
            <span class="material-symbols-outlined text-3xl">chat</span>
        </button>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// --- Chatbot Logic ---
let chatHistory = [];
let isChatOpen = false;

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
    } else {
        chatWindow.classList.add('hidden');
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });
    
    // show loading
    const loadingId = appendLoading();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory })
        });
        
        const data = await response.json();
        removeLoading(loadingId);

        if (data.success) {
            chatHistory.push({ role: 'assistant', content: data.reply });
            appendMessage('assistant', data.reply);
            appendActionLinks(data.reply, text);   // clickable "Explore →" links
        } else {
            appendMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    } catch (err) {
        console.error(err);
        removeLoading(loadingId);
        appendMessage('assistant', 'Network error. Please try again.');
    }
}

function appendMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `max-w-[85%] p-3 rounded-2xl text-sm font-body-md border border-outline-variant/20 shadow-sm ${
        role === 'user' 
        ? 'self-end bg-primary-container text-on-primary-container rounded-tr-sm' 
        : 'self-start bg-surface-container text-on-surface rounded-tl-sm'
    }`;
    msgDiv.textContent = content;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendLoading() {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    const id = 'loading-' + Date.now();
    msgDiv.id = id;
    msgDiv.className = 'self-start max-w-[85%] bg-surface-container p-3 rounded-2xl rounded-tl-sm text-on-surface font-body-md text-sm flex gap-1 items-center border border-outline-variant/20 shadow-sm h-10';
    msgDiv.innerHTML = '<div class="w-1.5 h-1.5 bg-on-surface/50 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-on-surface/50 rounded-full animate-bounce" style="animation-delay: 0.1s"></div><div class="w-1.5 h-1.5 bg-on-surface/50 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>';
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ============================================================
// ACTION LINKS — turn the assistant's category suggestions into
// clickable links that take the user straight to that category.
// Self-contained (works even on pages where app.js isn't loaded).
// ============================================================
const CHAT_CATEGORIES = [
    { id: 'electronics', name: 'Electronics', emoji: '🔌', kw: ['electronic', 'earbud', 'headphone', 'charger', 'power bank', 'powerbank', 'cable', 'gadget', 'adapter', 'phone stand'] },
    { id: 'personal_care_beauty', name: 'Beauty & Personal Care', emoji: '💄', kw: ['beauty', 'personal care', 'skincare', 'skin care', 'face wash', 'moisturiz', 'makeup', 'shampoo', 'razor', 'kajal', 'concealer', 'cosmetic'] },
    { id: 'pharmacy_health', name: 'Pharmacy & Health', emoji: '💊', kw: ['pharmacy', 'medicine', 'health', 'tablet', 'pain relief', 'first aid', 'antiseptic', 'ors', 'band-aid', 'bandage'] },
    { id: 'baby', name: 'Baby Care', emoji: '🧸', kw: ['baby', 'diaper', 'infant', 'wipes', 'baby wash', 'baby lotion', 'baby powder'] },
    { id: 'home_cleaning', name: 'Home & Cleaning', emoji: '🧹', kw: ['clean', 'detergent', 'floor', 'toilet', 'dishwash', 'home care', 'glass cleaner', 'garbage'] },
    { id: 'pet', name: 'Pet Care', emoji: '🐕', kw: ['pet', 'dog', 'cat', 'litter', 'pet food', 'treats'] },
    { id: 'intimate_personal', name: 'Intimate Care', emoji: '🛡️', kw: ['intimate', 'sanitary', 'sanitary pad', 'feminine', 'condom', 'panty liner'] }
];

// In-page navigation if the store app is loaded; otherwise let the href load it.
function chipNav(catId) {
    if (typeof selectCategory === 'function' && document.getElementById('productGrid')) {
        selectCategory(catId);
        if (isChatOpen) toggleChat();
        return false; // handled in-page, don't follow the link
    }
    return true; // e.g. from the dashboard — follow href to the store
}

function extractChatActions(replyText, userText) {
    const t = (replyText + ' ' + userText).toLowerCase();
    // Whole-word match so "cat" doesn't fire on "category", "pet" on "carpet", etc.
    const hasWord = (phrase) => new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t);
    const found = [];
    CHAT_CATEGORIES.forEach(c => {
        const hit = hasWord(c.name.toLowerCase())
            || hasWord(c.id.replace(/_/g, ' '))
            || c.kw.some(k => hasWord(k));
        if (hit) found.push(c);
    });
    return found.slice(0, 3);
}

function appendActionLinks(replyText, userText) {
    let actions = extractChatActions(replyText, userText);
    const messagesDiv = document.getElementById('chatMessages');
    const wrap = document.createElement('div');
    wrap.className = 'self-start max-w-[90%] flex flex-wrap gap-2 -mt-1';

    if (actions.length === 0) {
        // Always give at least one link.
        wrap.innerHTML = `
            <a href="index.html?view=categories" onclick="return chipCategories()"
               class="inline-flex items-center gap-1 bg-primary-container text-on-primary-container text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant/20 hover:opacity-90 transition-opacity">
               🧭 Browse all categories <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>`;
    } else {
        wrap.innerHTML = actions.map(c => `
            <a href="index.html?cat=${c.id}" onclick="return chipNav('${c.id}')"
               class="inline-flex items-center gap-1 bg-primary-container text-on-primary-container text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant/20 hover:opacity-90 transition-opacity">
               ${c.emoji} Explore <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>`).join('');
    }
    messagesDiv.appendChild(wrap);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function chipCategories() {
    if (typeof showView === 'function' && document.getElementById('productGrid')) {
        showView('categories');
        if (isChatOpen) toggleChat();
        return false;
    }
    return true;
}
