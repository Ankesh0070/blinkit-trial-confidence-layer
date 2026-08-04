document.addEventListener('DOMContentLoaded', () => {
    injectChatbot();
    loadChatCatalog();
});

// The chatbot searches the real product catalog so it can confirm a specific
// product ("do you have maggi?") or say a polite "coming soon" when we don't.
let CHAT_CATALOG = [];
async function loadChatCatalog() {
    // Reuse the store's already-loaded catalog when available (same page).
    if (window.trustData && Array.isArray(window.trustData.products)) {
        CHAT_CATALOG = window.trustData.products;
        return;
    }
    for (const path of ['../data/trust_signals_automated.json', 'data/trust_signals_automated.json']) {
        try {
            const r = await fetch(path);
            if (!r.ok) continue;
            const j = await r.json();
            if (Array.isArray(j.products) && j.products.length) { CHAT_CATALOG = j.products; return; }
        } catch (e) { /* try next path */ }
    }
}

function injectChatbot() {
    if (document.getElementById('chatWidget')) return;
    
    const html = `
    <!-- Chatbot FAB & Window -->
    <div id="chatWidget" class="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[110] flex flex-col items-end pointer-events-none">
        <!-- Chat Window -->
        <div id="chatWindow" class="pointer-events-none opacity-0 scale-90 w-[350px] h-[500px] max-h-[70vh] bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden mb-4 transition-[opacity,transform] duration-200 ease-out origin-bottom-right">
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
                <div class="self-start max-w-[85%] bg-surface-container p-3 rounded-2xl rounded-tl-sm text-on-surface font-body-md text-sm border border-outline-variant/20 shadow-sm whitespace-pre-wrap">
                    Hey — bata do kya chahiye ya kya problem hai, main real products suggest kar dunga jo 10 min mein deliver ho jayenge ⚡

Try: "sar dard ho raha hai", "acne ho gaya", "gym stack chahiye", "dinner banana hai", "bacha bimar hai"

Hindi, Tamil, Telugu ya any Indian language mein pooch sakte ho 🙂</div>
            </div>
            <!-- Input Area -->
            <div class="p-3 bg-surface border-t border-outline-variant/20 flex gap-2 items-center">
                <input type="text" id="chatInput" placeholder="Ask in any language..." class="flex-1 bg-surface-container-high rounded-full px-4 py-2 text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface border-none" onkeypress="handleChatKeyPress(event)">
                <button onclick="sendMessage()" class="bg-primary text-on-primary p-2 rounded-full hover:bg-primary-fixed-dim transition-colors flex items-center justify-center shadow-md">
                    <span class="material-symbols-outlined text-[20px]">send</span>
                </button>
            </div>
        </div>
        
        <!-- FAB -->
        <button id="chatFab" onclick="toggleChat()" class="pointer-events-auto w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center relative">
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
        chatWindow.classList.remove('pointer-events-none', 'opacity-0', 'scale-90');
        chatWindow.classList.add('pointer-events-auto', 'opacity-100', 'scale-100');
    } else {
        chatWindow.classList.remove('pointer-events-auto', 'opacity-100', 'scale-100');
        chatWindow.classList.add('pointer-events-none', 'opacity-0', 'scale-90');
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

// --- Specific-product lookup against the real catalog ---------------------
const CHAT_STOP = new Set(['the', 'a', 'an', 'is', 'are', 'do', 'you', 'have', 'got', 'any',
    'some', 'me', 'i', 'want', 'need', 'show', 'find', 'get', 'buy', 'looking', 'for', 'to',
    'and', 'or', 'of', 'my', 'please', 'can', 'could', 'would', 'there', 'in', 'stock',
    'available', 'sell', 'selling', 'price', 'cost', 'ka', 'ki', 'ke', 'hai', 'kya', 'koi',
    'chahiye', 'mujhe', 'dikhao', 'do', 'de', 'karo', 'milega', 'mil', 'sakta']);
const chatNorm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function chatTokens(q) {
    return chatNorm(q).split(' ').filter(t => t.length > 2 && !CHAT_STOP.has(t));
}

function findProducts(q) {
    if (!CHAT_CATALOG.length) return [];
    const tokens = chatTokens(q);
    if (!tokens.length) return [];
    // Score by how many query tokens each product matches, then keep only the
    // best-matching set so "boat earbuds" returns boAt earbuds, not boAt chargers.
    const scored = [];
    for (const p of CHAT_CATALOG) {
        const hay = chatNorm(`${p.product_name} ${p.subcategory} ${p.category}`);
        let s = 0;
        for (const t of tokens) if (hay.includes(t)) s++;
        if (s > 0) scored.push({ p, s });
    }
    if (!scored.length) return [];
    const max = Math.max(...scored.map(x => x.s));
    return scored.filter(x => x.s === max).map(x => x.p);
}

// Word-boundary test so greeting "hi" doesn't fire inside "chips".
function hasWholeWord(text, word) {
    return new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text);
}

// ============================================================
// PROBLEM / SITUATION INTENTS — the "concierge" layer
// Turn conversational asks like "sar dard ho raha hai" or
// "acne ho gaya" into a concrete shopping list. Each intent
// maps to catalog search tokens + an empathetic reply. When
// matched, we render real product cards inline in chat.
// ============================================================
const PROBLEM_INTENTS = [
    // ── Health & wellness ───────────────────────────────────
    { keywords: ['headache','sar dard','sirdard','head pain','migraine','sardard'],
      tokens: ['paracetamol','pain relief','balm','tablet'],
      reply: "Sar dard? A paracetamol tablet + a cooling balm usually helps within an hour. Delivered in 10 min 💊" },
    { keywords: ['fever','bukhar','temperature','body ache','badan dard'],
      tokens: ['paracetamol','thermometer','ors','tablet'],
      reply: "Bukhar? Take a paracetamol, keep an ORS for hydration, and check temp with a thermometer. Ye sab yahan hain 🌡️" },
    { keywords: ['cough','cold','khasi','jukham','sardi','throat','gala kharab'],
      tokens: ['vaporub','ors','antiseptic','vitamin'],
      reply: "Cold/cough ke liye — vaporub for the chest, ORS for hydration, and vitamin C. Add karo yahan se 🤧" },
    { keywords: ['stomach','pet dard','pet me dard','stomach pain','diarrhea','dast','loose motion','acidity','gas'],
      tokens: ['ors','antacid','sachet','tablet'],
      reply: "Pet ki problem? An ORS sachet + antacid usually settles it in an hour. Yeh rahe:" },
    { keywords: ['baby sick','bacha bimar','bacha ro','infant fever','baccha bimar','baby crying'],
      tokens: ['ors','baby wash','diaper','baby lotion'],
      reply: "Bacha bimar hai — pehle ORS for hydration, phir a soothing baby wash + fresh diapers. Ye rahe:" },
    { keywords: ['cut','wound','chot','bleeding','scrape'],
      tokens: ['antiseptic','bandaid','bandage','spray'],
      reply: "Chot lagi hai? Antiseptic first, phir band-aid/bandage. Yeh sab quick delivery ho jayega:" },

    // ── Skincare & beauty ───────────────────────────────────
    { keywords: ['acne','pimple','daane','breakout','face broke','muhase'],
      tokens: ['face wash','moisturizer','serum'],
      reply: "Acne ke liye — gentle face wash + non-comedogenic moisturizer + a niacinamide serum. Consistency = key:" },
    { keywords: ['dry skin','skin dry','flaky','rukhi twacha','skin flake'],
      tokens: ['moisturizer','lotion','face cream'],
      reply: "Dry skin? A rich moisturizer + body lotion combo lagega. Try these:" },
    { keywords: ['hair fall','hair loss','baal jhad','baal gir','hair thin'],
      tokens: ['shampoo','hair oil','biotin','supplement'],
      reply: "Hair fall? Biotin supplement + a mild shampoo + weekly oiling — 6-8 weeks mein farak dikhega:" },
    { keywords: ['dark circle','under eye','dark spot','pigmentation'],
      tokens: ['serum','concealer','cream'],
      reply: "Dark circles ke liye — under-eye serum + concealer for instant cover-up. Long-term ke liye good sleep also 😅" },

    // ── Cooking / meals ─────────────────────────────────────
    { keywords: ['dinner banana','dinner cook','khana banana','quick meal','dinner idea'],
      tokens: ['atta','noodles','rice','dal','paneer'],
      reply: "Dinner options — instant se lekar proper meal tak, yahan dono hain:" },
    { keywords: ['breakfast','nashta','morning food','subah ka nasht'],
      tokens: ['bread','butter','milk','eggs','coffee'],
      reply: "Nashta ke liye — bread + butter + milk classic combo. Ye rahe:" },
    { keywords: ['tea','chai','coffee','morning drink'],
      tokens: ['tea','coffee','milk','biscuit'],
      reply: "Chai/coffee session? Ye rahe essentials:" },
    { keywords: ['party','guests','mehmaan','get together','friends aa rahe','function'],
      tokens: ['chips','namkeen','cold drink','chocolate','biscuit'],
      reply: "Mehmaan aa rahe hain? Ye sab 10 min mein deliver ho jayega:" },

    // ── Fitness & lifestyle ─────────────────────────────────
    { keywords: ['gym','workout','fitness','protein','muscle','bodybuilding'],
      tokens: ['whey protein','protein bar','supplement','multivitamin'],
      reply: "Gym stack? Whey protein + protein bars + a multivitamin — solid combo for muscle recovery 💪" },
    { keywords: ['weight loss','diet','healthy eating','wajan kam'],
      tokens: ['oats','green tea','supplement','protein bar'],
      reply: "Weight loss journey? Oats + green tea + protein bars replace sugar cravings. Try these:" },
    { keywords: ['study','exam','padhai','all nighter','late night work'],
      tokens: ['coffee','energy drink','chocolate','nuts'],
      reply: "Padhai/deadline mode? Focus fuel — coffee, dark chocolate, energy drinks:" },

    // ── Home & pets ─────────────────────────────────────────
    { keywords: ['house dirty','ghar ganda','cleaning day','deep clean','safai'],
      tokens: ['floor cleaner','detergent','toilet cleaner','dishwash','garbage bag'],
      reply: "Cleaning day? Yahan poora essentials pack hai — floor + toilet + dish + laundry:" },
    { keywords: ['pet hungry','dog food','cat food','pet snack','doggy','kitty'],
      tokens: ['pet food','treats','pet shampoo'],
      reply: "Pet ke liye? Food + treats + grooming — sab 10 min mein 🐕" },

    // ── Period / intimate ───────────────────────────────────
    { keywords: ['period','periods','monthly','menstrual','cramp','maasik'],
      tokens: ['sanitary pad','pain relief','tablet'],
      reply: "Period essentials — sanitary pads + pain relief for cramps. Discreet packaging mein aata hai:" }
];

function matchProblemIntent(text) {
    const t = text.toLowerCase();
    for (const intent of PROBLEM_INTENTS) {
        if (intent.keywords.some(k => t.includes(k))) return intent;
    }
    return null;
}

// Broader token-based search — a problem intent hands us 3-5 token stems and
// we pull the top matches (spread across sub-products for variety).
function findProductsByTokens(tokens, limit = 6) {
    if (!CHAT_CATALOG.length || !tokens.length) return [];
    const scored = new Map(); // pid -> { p, score }
    for (const p of CHAT_CATALOG) {
        const hay = chatNorm(`${p.product_name || ''} ${p.subcategory || ''} ${p.category || ''}`);
        let s = 0;
        for (const t of tokens) if (hay.includes(chatNorm(t))) s++;
        if (s > 0) {
            const pid = p.product_id || p.id;
            const prev = scored.get(pid);
            if (!prev || s > prev.score) scored.set(pid, { p, score: s });
        }
    }
    const arr = [...scored.values()];
    arr.sort((a, b) => b.score - a.score || (a.p.price || 0) - (b.p.price || 0));
    // Spread across distinct subcategories for a more useful mix.
    const seenSub = new Set();
    const spread = [];
    const overflow = [];
    for (const { p } of arr) {
        const sub = p.subcategory || p.category || '_';
        if (!seenSub.has(sub)) { seenSub.add(sub); spread.push(p); }
        else overflow.push(p);
        if (spread.length >= limit) break;
    }
    if (spread.length < limit) spread.push(...overflow.slice(0, limit - spread.length));
    return spread;
}

// Best-effort product image resolver — mirrors the main app's logic but
// self-contained so the chatbot works even without app.js.
function chatProductImg(p) {
    if (typeof productImages === 'function') {
        const arr = productImages(p);
        if (arr && arr[0]) return arr[0];
    }
    if (Array.isArray(p.images) && p.images.length) {
        const base = document.location.pathname.includes('/prototype/') ? 'img/' : 'prototype/img/';
        return base + p.images[0];
    }
    return `https://placehold.co/200x200/f4f5f7/8a8f98?text=${encodeURIComponent((p.product_name || '').split(' ').slice(0,2).join(' '))}`;
}

// Open PDP if the store app is present, otherwise deep-link to it.
function chatOpenProduct(pid) {
    if (typeof openPdp === 'function' && document.getElementById('pdpContent')) {
        openPdp(pid);
        if (isChatOpen) toggleChat();
        return false;
    }
    location.href = `index.html?pdp=${encodeURIComponent(pid)}`;
    return false;
}

// Add-from-card: uses the store's addToCart when available, else navigates.
function chatAddProduct(pid) {
    if (typeof addProductToCart === 'function') {
        const p = CHAT_CATALOG.find(x => (x.product_id || x.id) === pid);
        if (p) addProductToCart(p);
    } else if (typeof addToCart === 'function') {
        addToCart(pid);
    } else {
        return chatOpenProduct(pid);
    }
    // Small toast-like feedback inside chat
    const feedback = document.createElement('div');
    feedback.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#0d8345] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-[9999] transition-opacity';
    feedback.textContent = '✓ Added to cart';
    document.body.appendChild(feedback);
    setTimeout(() => { feedback.style.opacity = '0'; setTimeout(() => feedback.remove(), 300); }, 1400);
    return false;
}

// Render product cards inline inside the chat window. Called after a
// problem intent match or when the standard product search returns hits.
function appendProductCards(products) {
    if (!products || !products.length) return;
    const messagesDiv = document.getElementById('chatMessages');
    const wrap = document.createElement('div');
    wrap.className = 'self-start max-w-full w-full';
    const cardHtml = products.slice(0, 6).map(p => {
        const pid = p.product_id || p.id;
        const name = (p.product_name || '').replace(/"/g, '&quot;');
        const img = chatProductImg(p);
        const price = p.price != null ? `₹${p.price}` : '';
        const mrp = (p.mrp && p.mrp > p.price) ? `<span class="text-[9px] text-outline line-through ml-1">₹${p.mrp}</span>` : '';
        const off = (p.mrp && p.mrp > p.price) ? `<span class="text-[9px] font-bold text-on-primary bg-primary px-1 py-0.5 rounded absolute top-1 left-1">${Math.round((1 - p.price / p.mrp) * 100)}% OFF</span>` : '';
        return `
        <div class="shrink-0 w-32 bg-surface rounded-xl border border-outline-variant/25 p-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div class="w-full h-20 bg-surface-container-lowest rounded-lg mb-1.5 flex items-center justify-center overflow-hidden relative" onclick="return chatOpenProduct('${pid}')">
                ${off}
                <img src="${img}" alt="${name}" class="max-w-full max-h-full object-contain" onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend', '<span style=&quot;font-size:24px;&quot;>📦</span>');">
            </div>
            <div class="text-[11px] font-semibold text-on-surface leading-tight line-clamp-2 h-8" onclick="return chatOpenProduct('${pid}')">${name}</div>
            <div class="flex items-center justify-between mt-1.5">
                <div class="flex flex-col leading-tight">
                    <span class="text-xs font-bold text-on-surface">${price}</span>
                    ${mrp ? `<span class="text-[9px] text-outline line-through">₹${p.mrp}</span>` : ''}
                </div>
                <button onclick="event.stopPropagation(); return chatAddProduct('${pid}')" class="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-md hover:bg-primary/20 whitespace-nowrap">ADD</button>
            </div>
        </div>`;
    }).join('');
    wrap.innerHTML = `<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">${cardHtml}</div>`;
    messagesDiv.appendChild(wrap);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Decide the assistant's reply: specific product first (user's priority),
// then greeting/canned, then category hint, then a polite coming-soon.
function buildReply(text) {
    const t = text.toLowerCase();

    // 1) Specific product lookup wins — "lays chips", "maggi", "boat earbuds".
    const hits = findProducts(text);
    if (hits.length) {
        const names = [...new Set(hits.map(p => p.product_name))].slice(0, 3);
        const cheapest = hits.reduce((a, b) => (b.price < a.price ? b : a));
        const list = names.map(n => '• ' + n).join('\n');
        const more = hits.length > names.length ? `\n…and ${hits.length - names.length} more` : '';
        return {
            text: `Yes! We have ${hits.length} option${hits.length > 1 ? 's' : ''} for you 🛒\n\n${list}${more}\n\nStarting at ₹${cheapest.price} · delivered in minutes ⚡\nTap below to see them all 👇`,
            searchQuery: chatTokens(text).join(' ')
        };
    }

    // 2) Greetings / thanks / refund — whole-word so "hi" != "chips".
    const isCanned = r => r.kw.includes('hello') || r.kw.includes('thank') || r.kw.includes('refund');
    for (const r of SMART_REPLIES) {
        if (isCanned(r) && r.kw.some(k => hasWholeWord(t, k))) return { text: r.reply, browse: true };
    }

    // 3) Category hint if the words map to one (substring stems like "moisturi").
    for (const r of SMART_REPLIES) {
        if (!isCanned(r) && r.kw.some(k => t.includes(k))) return { text: r.reply, browse: false };
    }

    // 4) Truly nothing — polite "coming soon".
    const q = text.trim().replace(/[<>]/g, '');
    return {
        text: `Sorry! "${q}" abhi humaare paas available nahi hai 😔\n\nHum ise jaldi hi laa rahe hain — stay tuned! 🚀🔜\n\nTab tak aap ye popular categories explore kar sakte hain 👇`,
        browse: true
    };
}

// Ask the multilingual AI assistant (detects & replies in the user's own
// language/script, including Hinglish). Local catalog search still runs so
// the AI is given real product facts (never invents names/prices) and so we
// have an accurate "View products" link regardless of what language the
// reply comes back in.
async function askAiReply(text) {
    const hits = findProducts(text);
    const catalogFacts = hits.slice(0, 5).map(p => ({ name: p.product_name, price: p.price, category: p.category }));
    const searchQuery = hits.length ? chatTokens(text).join(' ') : null;

    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory.slice(-8), catalogFacts }),
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error('chat api http ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'chat api failed');
    return { text: data.reply, categoryIds: data.category_ids || [], searchQuery };
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    // Problem/situation intent — highest-priority path. If the user is
    // describing a problem ("sar dard ho raha hai"), we skip the AI round-
    // trip, give an empathetic canned reply, and render real product cards
    // in-place so they can add to cart without leaving chat.
    const problem = matchProblemIntent(text);
    if (problem) {
        const products = findProductsByTokens(problem.tokens);
        // Small artificial delay so it doesn't feel jarring.
        const loadingId = appendLoading();
        await new Promise(r => setTimeout(r, 350));
        removeLoading(loadingId);
        chatHistory.push({ role: 'assistant', content: problem.reply });
        appendMessage('assistant', problem.reply);
        if (products.length) {
            appendProductCards(products);
            // Also offer a shortcut to see everything in that category.
            appendActionLinks({
                text: problem.reply,
                searchQuery: problem.tokens.slice(0, 2).join(' ')
            }, text);
        } else {
            appendActionLinks({ text: problem.reply, browse: true }, text);
        }
        return;
    }

    const loadingId = appendLoading();

    let reply;
    try {
        reply = await askAiReply(text);
    } catch (e) {
        // AI unavailable (no API key, offline, rate-limited, etc.) — fall back
        // to the local rule-based assistant so chat still works (English/Hinglish only).
        await new Promise(r => setTimeout(r, 200));
        reply = buildReply(text);
    }

    removeLoading(loadingId);
    chatHistory.push({ role: 'assistant', content: reply.text });
    appendMessage('assistant', reply.text);

    // If the standard product search turned up hits, render cards inline
    // instead of just a text list — this is the direct-name path
    // ("do you have maggi?") where the reply text already listed names.
    const directHits = findProducts(text);
    if (directHits && directHits.length) {
        appendProductCards(directHits);
    }

    appendActionLinks(reply, text);
}

function appendMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `max-w-[85%] p-3 rounded-2xl text-sm font-body-md border border-outline-variant/20 shadow-sm whitespace-pre-wrap ${
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
    { id: 'intimate_personal', name: 'Intimate Care', emoji: '🛡️', kw: ['intimate', 'sanitary', 'sanitary pad', 'feminine', 'condom', 'panty liner'] },
    { id: 'books', name: 'Books', emoji: '📚', kw: ['book', 'novel', 'fiction', 'self help', 'read', 'author', 'paperback', 'story', 'academic', 'guide'] },
    { id: 'jewellery', name: 'Jewellery', emoji: '💍', kw: ['jewellery', 'jewelry', 'earring', 'necklace', 'ring', 'bracelet', 'bangle', 'pendant', 'anklet', 'jhumka'] },
    { id: 'spiritual', name: 'Spiritual Needs', emoji: '🕉️', kw: ['spiritual', 'pooja', 'puja', 'agarbatti', 'incense', 'diya', 'idol', 'camphor', 'dhoop', 'rudraksha', 'temple', 'god'] },
    { id: 'stationery_games', name: 'Stationery & Games', emoji: '✏️', kw: ['stationery', 'pen', 'notebook', 'chess', 'ludo', 'cards', 'uno', 'carrom', 'board game', 'sketch', 'geometry'] },
    { id: 'supplements', name: 'Supplements', emoji: '💪', kw: ['supplement', 'protein', 'whey', 'multivitamin', 'omega', 'biotin', 'collagen', 'mass gainer', 'protein bar', 'gym', 'nutrition'] },
    { id: 'sports_outdoor', name: 'Sports & Outdoor Games', emoji: '🏏', kw: ['sports', 'cricket', 'bat', 'football', 'badminton', 'volleyball', 'basketball', 'skipping', 'frisbee', 'outdoor', 'game', 'ball'] },
    { id: 'vegetables_fruits', name: 'Vegetables & Fruits', emoji: '🥬', kw: ['vegetable', 'fruit', 'apple', 'potato', 'onion', 'tamatar', 'sabzi', 'fresh'] },
    { id: 'dairy_bread_eggs', name: 'Dairy, Bread & Eggs', emoji: '🥛', kw: ['milk', 'bread', 'egg', 'butter', 'paneer', 'cheese', 'curd', 'dairy'] },
    { id: 'atta_rice_dal', name: 'Atta, Rice & Dal', emoji: '🌾', kw: ['atta', 'rice', 'dal', 'flour', 'grain', 'wheat'] },
    { id: 'masala_oil', name: 'Masala, Oil & More', emoji: '🧂', kw: ['oil', 'masala', 'spice', 'salt', 'jeera', 'haldi', 'mirch'] },
    { id: 'munchies', name: 'Munchies', emoji: '🍿', kw: ['snack', 'chip', 'munch', 'namkeen', 'popcorn'] },
    { id: 'cold_drinks_juices', name: 'Cold Drinks & Juices', emoji: '🥤', kw: ['drink', 'cold drink', 'juice', 'coke', 'pepsi', 'frooti', 'soda', 'water'] },
    { id: 'tea_coffee', name: 'Tea, Coffee & Health Drinks', emoji: '☕', kw: ['tea', 'coffee', 'chai', 'green tea', 'bru', 'nescafe'] },
    { id: 'biscuits_bakery', name: 'Biscuits & Bakery', emoji: '🍪', kw: ['biscuit', 'cookie', 'rusk', 'cake', 'bakery'] },
    { id: 'sweet_tooth', name: 'Sweet Tooth', emoji: '🍫', kw: ['chocolate', 'sweet', 'candy', 'ice cream', 'mithai', 'dessert'] },
    { id: 'instant_frozen', name: 'Instant & Frozen', emoji: '🧊', kw: ['noodle', 'maggi', 'instant', 'frozen', 'soup', 'ready to eat'] }
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

function appendActionLinks(reply, userText) {
    // Back-compat: allow a plain string reply too.
    if (typeof reply === 'string') reply = { text: reply };
    const messagesDiv = document.getElementById('chatMessages');
    const wrap = document.createElement('div');
    wrap.className = 'self-start max-w-[90%] flex flex-wrap gap-2 -mt-1';
    const chip = (href, onclick, label) =>
        `<a href="${href}" onclick="${onclick}" class="inline-flex items-center gap-1 bg-primary-container text-on-primary-container text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant/20 hover:opacity-90 transition-opacity">${label} <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>`;

    // Product match -> one chip that opens the search results for that query.
    if (reply.searchQuery) {
        const q = reply.searchQuery.replace(/'/g, '');
        wrap.innerHTML = chip(`index.html?q=${encodeURIComponent(q)}`, `return chipSearch('${q}')`, `🔍 View products`);
        messagesDiv.appendChild(wrap);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return;
    }

    // AI-provided category ids (language-agnostic — works no matter what
    // language the reply text came back in).
    let actions = [];
    if (Array.isArray(reply.categoryIds) && reply.categoryIds.length) {
        actions = reply.categoryIds.map(id => CHAT_CATEGORIES.find(c => c.id === id)).filter(Boolean).slice(0, 3);
    }
    // Fallback: legacy English keyword-matching (only relevant for the local
    // rule-based reply path, which is always in English).
    if (!actions.length && !reply.browse) {
        actions = extractChatActions(reply.text, userText);
    }
    if (actions.length === 0) {
        wrap.innerHTML = chip('index.html?view=categories', 'return chipCategories()', '🧭 Browse all categories');
    } else {
        wrap.innerHTML = actions.map(c =>
            chip(`index.html?cat=${c.id}`, `return chipNav('${c.id}')`, `${c.emoji} Explore`)).join('');
    }
    messagesDiv.appendChild(wrap);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// In-page search if the store app is loaded; otherwise follow the href.
function chipSearch(query) {
    if (typeof doSearch === 'function' && document.getElementById('searchGrid')) {
        doSearch(query);
        if (isChatOpen) toggleChat();
        return false;
    }
    return true;
}

function chipCategories() {
    if (typeof showView === 'function' && document.getElementById('productGrid')) {
        showView('categories');
        if (isChatOpen) toggleChat();
        return false;
    }
    return true;
}
