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

const SMART_REPLIES = [
    { kw: ['baby','diaper','infant','wipe','newborn','toddler'], reply: 'We have a great Baby Care section! You\'ll find diapers, baby wash, lotions, powder, and baby food — all delivered in minutes. Tap below to explore!' },
    { kw: ['electronic','earphone','earbud','headphone','charger','power bank','cable','gadget','phone'], reply: 'Check out our Electronics section! We have wireless earbuds, power banks, chargers, neckbands, and more — all under ₹2000 with delivery in minutes.' },
    { kw: ['beauty','face wash','moisturi','skin','makeup','shampoo','lotion','cream','serum','perfume'], reply: 'Our Beauty & Personal Care section has body wash, lotions, hand wash, perfumes and more. Great options for your daily routine, delivered in minutes!' },
    { kw: ['medicine','pharmacy','health','pain','fever','cold','tablet','first aid','antiseptic','dettol','bandage','vitamin'], reply: 'Need health essentials? Our Pharmacy section has pain relief, antiseptics, first aid, multivitamins, and more. Delivered to your door in minutes!' },
    { kw: ['clean','detergent','floor','toilet','harpic','dish','mop','garbage','home'], reply: 'Home cleaning supplies? We\'ve got toilet cleaners, floor cleaners, detergents, garbage bags, and more in our Home & Cleaning section!' },
    { kw: ['pet','dog','cat','food','treat','litter','puppy','kitten'], reply: 'We love pets too! Check out our Pet Care section for dog food, cat food, treats, pet shampoo, and cat litter. Delivered in minutes!' },
    { kw: ['intimate','sanitary','pad','condom','feminine','panty liner'], reply: 'Our Intimate Care section has everything you need — sanitary pads, intimate wash, and more. Discreet packaging, delivered in minutes.' },
    { kw: ['snack','chip','munch','namkeen','popcorn','biscuit','cookie'], reply: 'Craving snacks? We have chips, namkeen, popcorn, biscuits, cookies and more in our Munchies & Biscuits sections. All under ₹200!' },
    { kw: ['drink','cold drink','juice','coke','pepsi','frooti','soda','water'], reply: 'Thirsty? Check out our Cold Drinks & Juices section — soft drinks, juices, energy drinks, all chilled and delivered in minutes!' },
    { kw: ['tea','coffee','chai','green tea','bru','nescafe'], reply: 'Tea or coffee lover? We have a great Tea & Coffee section with green tea, instant coffee, health drinks and more!' },
    { kw: ['chocolate','sweet','candy','ice cream','mithai','dessert'], reply: 'Got a sweet tooth? Our Sweet Tooth section has chocolates, ice cream, candies, and traditional sweets — perfect treats delivered fast!' },
    { kw: ['milk','bread','egg','butter','paneer','cheese','curd','dairy'], reply: 'Daily essentials? Our Dairy, Bread & Eggs section has fresh milk, bread, eggs, butter, paneer, cheese and curd. Fresh and delivered in minutes!' },
    { kw: ['atta','rice','dal','flour','grain','wheat'], reply: 'Stocking up on staples? We have atta, rice, dal, and flour in our Atta, Rice & Dal section — all the pantry essentials you need!' },
    { kw: ['oil','masala','spice','salt','jeera','haldi','mirch'], reply: 'Need cooking essentials? Our Masala & Oil section has cooking oils, salt, and all kinds of spices for your kitchen!' },
    { kw: ['noodle','maggi','instant','frozen','soup','ready to eat'], reply: 'Quick meals? Check our Instant & Frozen section for noodles, soups, frozen foods, and ready-to-eat options!' },
    { kw: ['vegetable','fruit','apple','potato','onion','tamatar','sabzi','fresh'], reply: 'Fresh produce? Our Vegetables & Fruits section has farm-fresh veggies and fruits delivered to your door in minutes!' },
    { kw: ['refund','cancel','order','complaint','return','wrong','damage','missing'], reply: 'I\'m only a product discovery assistant and can\'t process refunds or handle order issues. Please contact Blinkit Customer Support through the app for help with your order.' },
    { kw: ['hello','hi','hey','hii','namaste','good morning','good evening'], reply: 'Hello! Welcome to Blinkit. I can help you discover products across 17 categories. What are you looking for today?' },
    { kw: ['thank','thanks','dhanyavad','shukriya'], reply: 'You\'re welcome! Happy to help. Feel free to ask anytime you need to find something on Blinkit!' },
];

function getSmartReply(text) {
    const t = text.toLowerCase();
    for (const r of SMART_REPLIES) {
        if (r.kw.some(k => t.includes(k))) return r.reply;
    }
    return 'I can help you find products on Blinkit! Try asking about categories like baby care, electronics, snacks, dairy, beauty, pharmacy, pet care, or home cleaning. You can also browse all categories below!';
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    const loadingId = appendLoading();

    // Simulate natural typing delay (300-800ms)
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

    removeLoading(loadingId);
    const reply = getSmartReply(text);
    chatHistory.push({ role: 'assistant', content: reply });
    appendMessage('assistant', reply);
    appendActionLinks(reply, text);
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
