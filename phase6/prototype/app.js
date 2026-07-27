
// 1. Data State
let trustData = null;
let densityFlags = null;
let userProfiles = null;
let currentProfile = 'user_a'; // Default to Cold Start User
let currentCategory = 'electronics'; // Default category tab
let showTrustedOnly = false;         // "Blinkit Trusted" filter toggle in the grid

function toggleTrustedOnly() {
    showTrustedOnly = !showTrustedOnly;
    renderProducts();
}
let currentPdpProductId = null; // Product currently open in the PDP sheet

// Emojis
const EMOJIS = {
    'earbuds': '🎧', 'powerbank': '🔋', 'cable': '🔌', 'headphones': '🎧', 'led': '💡', 'adapter': '🔌',
    'moisturizer': '🧴', 'concealer': '💄', 'face_wash': '🫧', 'shampoo': '🧴', 'razor': '🪒', 'kajal': '👁️',
    'tablets': '💊', 'antiseptic': '⚕️', 'spray': '🩹', 'ors': '💧', 'vaporub': '🤧', 'bandaid': '🩹',
    'diaper': '🍼', 'baby_wash': '🧸', 'baby_lotion': '🧴', 'baby_powder': '🍼', 'baby_soap': '🧼',
    'detergent': '🧼', 'pet_food': '🐕', 'condom': '🛡️',
    'adapter': '🔌', 'phone_stand': '📱',
    'toilet_cleaner': '🚽', 'floor_cleaner': '🧽', 'glass_cleaner': '🪟', 'garbage_bags': '🗑️', 'dishwash': '🍽️',
    'pet_treats': '🦴', 'cat_food': '🐈', 'pet_shampoo': '🧴', 'cat_litter': '🐈',
    'sanitary_pad': '🩸', 'intimate_wash': '🧴', 'panty_liner': '🌸',
    'electronics': '🔌', 'personal_care_beauty': '💄', 'pharmacy_health': '💊', 'baby': '🧸', 'home_cleaning': '🧹', 'pet': '🐕', 'intimate_personal': '🛡️',
    // grocery / daily category emojis
    'vegetables_fruits': '🥬', 'dairy_bread_eggs': '🥛', 'munchies': '🍿', 'cold_drinks_juices': '🥤',
    'atta_rice_dal': '🌾', 'tea_coffee': '☕', 'biscuits_bakery': '🍪', 'sweet_tooth': '🍫',
    'masala_oil': '🧂', 'instant_frozen': '🧊',
    // new expansion category emojis
    'books': '📚', 'jewellery': '💍', 'spiritual': '🕉️', 'stationery_games': '✏️', 'supplements': '💪', 'sports_outdoor': '🏏',
    // new expansion subcategory emojis
    'fiction': '📖', 'self_help': '📗', 'non_fiction': '📘', 'children': '📙', 'academic': '🎓',
    'earrings': '💎', 'necklace': '📿', 'ring': '💍', 'bracelet': '📿', 'bangles': '💫', 'pendant': '🔮',
    'incense': '🪔', 'diya': '🪔', 'idol': '🕉️', 'pooja': '🛕', 'camphor': '🔥', 'rudraksha': '📿',
    'pen': '🖊️', 'notebook': '📓', 'chess': '♟️', 'ludo': '🎲', 'cards': '🃏', 'art': '🖍️', 'carrom': '⚫',
    'whey_protein': '💪', 'multivitamin': '💊', 'omega3': '🐟', 'plant_protein': '🌱', 'beauty': '✨', 'bar': '🍫',
    'cricket_bat': '🏏', 'football': '⚽', 'badminton': '🏸', 'ball_sports': '🏀', 'fitness': '🤸', 'outdoor': '🥏',
    // grocery subcategory emojis
    'tomato': '🍅', 'onion': '🧅', 'banana': '🍌', 'apple': '🍎', 'potato': '🥔',
    'milk': '🥛', 'bread': '🍞', 'eggs': '🥚', 'butter': '🧈', 'paneer': '🧀',
    'chips': '🍟', 'namkeen': '🥨', 'popcorn': '🍿', 'snacks': '🍿',
    'softdrink': '🥤', 'juice': '🧃', 'energydrink': '⚡',
    'atta': '🌾', 'rice': '🍚', 'dal': '🫘', 'flour': '🌾',
    'tea': '🍵', 'coffee': '☕', 'healthdrink': '🥤',
    'biscuits': '🍪', 'rusk': '🍞', 'cake': '🍰', 'cookies': '🍪',
    'chocolate': '🍫', 'icecream': '🍨', 'candy': '🍬',
    'oil': '🛢️', 'salt': '🧂', 'spices': '🌶️', 'noodles': '🍜', 'frozenfood': '🧊'
};

// ── Master category list (real Blinkit-style categories) ──
// type 'grocery' = habitual everyday (no AI trial signal); 'trial' = non-grocery trial categories with AI trust signals.
const ALL_CATEGORIES = [
    { id: 'vegetables_fruits', name: 'Vegetables & Fruits', type: 'grocery' },
    { id: 'dairy_bread_eggs', name: 'Dairy, Bread & Eggs', type: 'grocery' },
    { id: 'atta_rice_dal', name: 'Atta, Rice & Dal', type: 'grocery' },
    { id: 'masala_oil', name: 'Masala, Oil & More', type: 'grocery' },
    { id: 'munchies', name: 'Munchies', type: 'grocery' },
    { id: 'cold_drinks_juices', name: 'Cold Drinks & Juices', type: 'grocery' },
    { id: 'tea_coffee', name: 'Tea, Coffee & Health Drinks', type: 'grocery' },
    { id: 'biscuits_bakery', name: 'Biscuits & Bakery', type: 'grocery' },
    { id: 'sweet_tooth', name: 'Sweet Tooth', type: 'grocery' },
    { id: 'instant_frozen', name: 'Instant & Frozen', type: 'grocery' },
    { id: 'electronics', name: 'Electronics', type: 'trial' },
    { id: 'personal_care_beauty', name: 'Beauty & Personal Care', type: 'trial' },
    { id: 'pharmacy_health', name: 'Pharmacy & Health', type: 'trial' },
    { id: 'baby', name: 'Baby Care', type: 'trial' },
    { id: 'home_cleaning', name: 'Home & Cleaning', type: 'trial' },
    { id: 'pet', name: 'Pet Care', type: 'trial' },
    { id: 'intimate_personal', name: 'Intimate Care', type: 'trial' },
    { id: 'books', name: 'Books', type: 'trial' },
    { id: 'jewellery', name: 'Jewellery', type: 'trial' },
    { id: 'spiritual', name: 'Spiritual Needs', type: 'trial' },
    { id: 'stationery_games', name: 'Stationery & Games', type: 'trial' },
    { id: 'supplements', name: 'Supplements', type: 'trial' },
    { id: 'sports_outdoor', name: 'Sports & Outdoor Games', type: 'trial' }
];
const GROCERY_IDS = new Set(ALL_CATEGORIES.filter(c => c.type === 'grocery').map(c => c.id));
const catDisplayName = id => trustData?.category_signals?.[id]?.display_name || ALL_CATEGORIES.find(c => c.id === id)?.name || id;

// ── Real product images (keyword photos with a reliable placeholder fallback) ──
const IMAGE_KW = {
    earbuds: 'earbuds', powerbank: 'power bank', cable: 'usb cable', headphones: 'headphones', led: 'desk lamp', adapter: 'usb adapter', phone_stand: 'phone stand',
    moisturizer: 'face cream', concealer: 'makeup', face_wash: 'face wash', shampoo: 'shampoo', razor: 'razor', kajal: 'eyeliner',
    tablets: 'medicine tablets', antiseptic: 'antiseptic liquid', spray: 'spray bottle', ors: 'medicine sachet', vaporub: 'ointment', bandaid: 'bandage',
    diaper: 'baby diaper', baby_wash: 'baby wash', baby_lotion: 'baby lotion', baby_powder: 'baby powder', baby_soap: 'soap',
    detergent: 'laundry detergent', dishwash: 'dishwashing', toilet_cleaner: 'cleaning bottle', floor_cleaner: 'floor cleaner', glass_cleaner: 'spray cleaner', garbage_bags: 'garbage bag',
    pet_food: 'dog food', cat_food: 'cat food', pet_treats: 'dog treats', pet_shampoo: 'pet grooming', cat_litter: 'cat litter',
    condom: 'condom', sanitary_pad: 'sanitary pad', intimate_wash: 'wash bottle', panty_liner: 'hygiene',
    tomato: 'tomato', onion: 'onion', banana: 'banana', apple: 'apple', potato: 'potato',
    milk: 'milk', bread: 'bread', eggs: 'eggs', butter: 'butter', paneer: 'paneer cheese',
    chips: 'potato chips', namkeen: 'snacks', popcorn: 'popcorn', snacks: 'snacks',
    softdrink: 'soft drink', juice: 'fruit juice', energydrink: 'energy drink',
    atta: 'wheat flour', rice: 'rice', dal: 'lentils', flour: 'flour',
    tea: 'tea', coffee: 'coffee', healthdrink: 'health drink',
    biscuits: 'biscuits', rusk: 'toast rusk', cake: 'cake', cookies: 'cookies',
    chocolate: 'chocolate', icecream: 'ice cream', candy: 'candy',
    oil: 'cooking oil', salt: 'salt', spices: 'spices', noodles: 'instant noodles', frozenfood: 'frozen food'
};
// Real, brand-matched product photos are bundled locally under img/<product_id>-N.jpg
// (sourced per product from OpenFoodFacts / OpenBeautyFacts / OpenPetFoodFacts /
// OpenProductsFacts / DummyJSON). imgManifest maps product_id -> how many exist,
// so galleries never show a broken/placeholder slide.
let imgManifest = {};
const IMG_VER = '14'; // bump when images are re-fetched so browsers load fresh copies (fixes stale card/PDP mismatch)
function productImages(product) {
    // New expanded catalog ships an explicit per-product image list (pooled per
    // subcategory). Prefer it; fall back to the id-based manifest lookup for any
    // legacy product that predates the `images` field.
    if (Array.isArray(product.images) && product.images.length) {
        return product.images.map(f => `img/${f}?v=${IMG_VER}`);
    }
    const pid = product.product_id || product.id;
    const n = imgManifest[pid] || 3;
    return Array.from({ length: n }, (_, i) => `img/${pid}-${i + 1}.jpg?v=${IMG_VER}`);
}
function placeholderImg(product) {
    const label = (product.product_name || '').split(' ').slice(0, 3).join(' ');
    return `https://placehold.co/500x500/f4f5f7/8a8f98?text=${encodeURIComponent(label)}`;
}
function imgTag(url, product, cls) {
    return `<img src="${url}" class="${cls}" onerror="this.onerror=null;this.src='${placeholderImg(product)}'">`;
}

// Seed realistic past-order history for each demo profile so the Orders page
// (and the Profile tab's recent-orders widget) actually shows history that
// matches what user_profiles.json declares for that persona — total_orders_90d,
// categories_purchased_90d, and last_non_grocery_purchase — instead of a blank
// "No orders yet" on a fresh browser. Runs once (localStorage-guarded); never
// overwrites orders a real session already placed.
const ORDER_SEED_VERSION = 'v1';
function seedOrderHistory() {
    if (localStorage.getItem('blinkit_orders_seeded') === ORDER_SEED_VERSION) return;
    if (JSON.parse(localStorage.getItem('blinkit_orders') || '[]').length) {
        localStorage.setItem('blinkit_orders_seeded', ORDER_SEED_VERSION);
        return;
    }

    const byCat = {};
    trustData.products.forEach(p => (byCat[p.category] = byCat[p.category] || []).push(p));
    const pick = (catId, n, offset) => {
        const pool = byCat[catId] || [];
        if (!pool.length) return [];
        const out = [];
        for (let i = 0; i < n; i++) out.push(pool[(offset + i * 7) % pool.length]);
        return out;
    };
    const toItem = (p, qty) => ({
        id: p.product_id, name: p.product_name, price: p.price, mrp: p.mrp,
        image: p.image || p.subcategory, category: p.category, category_name: catDisplayName(p.category), qty
    });
    const GROCERY_CATS = ALL_CATEGORIES.filter(c => c.type === 'grocery').map(c => c.id);
    const orderTotal = items => items.reduce((s, i) => s + i.price * i.qty, 0);
    const daysAgoISO = d => new Date(Date.now() - d * 86400000 - Math.random() * 3600000).toISOString();

    let orderSeq = 1;
    const mkOrder = (profileId, daysAgo, items, novelCategories = []) => ({
        orderId: 'BK' + String(20000000 + orderSeq++).padStart(8, '0'),
        profile: profileId,
        placedAt: daysAgoISO(daysAgo),
        items,
        total: orderTotal(items),
        payment: (orderSeq % 2 === 0) ? 'cod' : 'upi',
        novelCategories
    });

    const orders = [];

    // user_a — Cold Start (Grocery Loyalist): total_orders_90d=34, groceries only,
    // no trial-category purchase (last_non_grocery_purchase: null).
    for (let i = 0; i < 34; i++) {
        const cat = GROCERY_CATS[i % GROCERY_CATS.length];
        const items = pick(cat, 1 + (i % 3), i).map(p => toItem(p, 1 + (i % 2)));
        if (items.length) orders.push(mkOrder('user_a', Math.floor(i * (89 / 34)) + 1, items));
    }

    // user_b — Electronics Explorer: total_orders_90d=12 (9 grocery + 3 electronics).
    // First electronics order 70 days ago is their CCAR activation (novel);
    // repeat electronics purchases at 42 and 15 days ago (days_ago:15 matches
    // last_non_grocery_purchase) prove the trial stuck.
    for (let i = 0; i < 9; i++) {
        const cat = GROCERY_CATS[i % GROCERY_CATS.length];
        const items = pick(cat, 1 + (i % 2), i + 3).map(p => toItem(p, 1));
        if (items.length) orders.push(mkOrder('user_b', 20 + i * 7, items));
    }
    [[70, true], [42, false], [15, false]].forEach(([d, isNovel], i) => {
        const items = pick('electronics', 1, i * 5).map(p => toItem(p, 1));
        if (items.length) orders.push(mkOrder('user_b', d, items, isNovel ? ['electronics'] : []));
    });

    // user_c — Dormant Buyer (Out of Window): total_orders_90d=8, groceries only
    // within the window, PLUS one lapsed personal_care_beauty trial 120 days ago
    // (outside the 90d window — never repeated, hence "dormant"/not CCAR-active).
    for (let i = 0; i < 8; i++) {
        const cat = GROCERY_CATS[i % GROCERY_CATS.length];
        const items = pick(cat, 1 + (i % 2), i + 1).map(p => toItem(p, 1));
        if (items.length) orders.push(mkOrder('user_c', 5 + i * 10, items));
    }
    const beautyItems = pick('personal_care_beauty', 2, 2).map(p => toItem(p, 1));
    if (beautyItems.length) orders.push(mkOrder('user_c', 120, beautyItems, ['personal_care_beauty']));

    orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)); // newest first, matches placeOrder's unshift
    localStorage.setItem('blinkit_orders', JSON.stringify(orders));
    localStorage.setItem('blinkit_orders_seeded', ORDER_SEED_VERSION);
}

async function init() {
    const cb = `?v=${IMG_VER}`; // cache-bust data so catalog/image updates show without a manual clear
    const trustRes = await fetch('../data/trust_signals_automated.json' + cb);
    trustData = await trustRes.json();

    const densityRes = await fetch('../data/category_density_flags.json' + cb);
    densityFlags = await densityRes.json();

    const userRes = await fetch('../data/user_profiles.json' + cb);
    userProfiles = await userRes.json();

    // Manifest of locally-bundled product images (product_id -> count).
    try { imgManifest = await (await fetch('img/manifest.json' + cb)).json(); } catch (e) { imgManifest = {}; }

    seedOrderHistory();

    renderApp();
    applyUrlIntent();
}

// Deep-link support so chatbot / shared links can land on a category, a
// search, or the categories view — e.g. index.html?cat=baby or ?q=diapers
function applyUrlIntent() {
    const p = new URLSearchParams(location.search);
    const cat = p.get('cat'), q = p.get('q'), view = p.get('view');
    if (cat && ALL_CATEGORIES.some(c => c.id === cat)) {
        selectCategory(cat);
    } else if (q) {
        const inp = document.getElementById('searchInput');
        if (inp) inp.value = q;
        doSearch(q);
    } else if (view === 'categories') {
        showView('categories');
    }
}

function renderApp() {
    renderCategoryNav();
    renderRecommendationStrip();
    renderCategoryView();
    updateCartBadge();
}

// Logic: Check if we show AI signals based on density flags (Phase 5 override)
function evaluateConfidenceGate(categoryId) {
    // Grocery / everyday categories are the user's habitual lanes — no AI trial signal, no sparse warning.
    if (GROCERY_IDS.has(categoryId)) {
        return { show_ai_signals: false, recommend: false, is_grocery: true, reason: "grocery" };
    }

    const flag = densityFlags.categories[categoryId]?.density_flag || 'sparse';

    if (flag === 'sparse' && !['baby', 'home_cleaning', 'pet', 'intimate_personal'].includes(categoryId)) {
        return { show_ai_signals: false, recommend: false, reason: "sparse_category" };
    }

    const history = userProfiles.users[currentProfile].categories_purchased_90d || [];
    const hasBoughtCategory = history.includes(categoryId);
    
    return {
        show_ai_signals: true,
        recommend: !hasBoughtCategory,
        is_novel: !hasBoughtCategory,
        reason: "eligible"
    };
}

function switchProfile(profileId) {
    currentProfile = profileId;
    renderApp();
    // Keep the current view in sync with the newly selected profile.
    if (typeof currentView !== 'undefined') {
        if (currentView === 'profile') renderProfile();
        else if (currentView === 'categories') renderCategoriesOverview();
    }
}

function renderRecommendationStrip() {
    const strip = document.getElementById('recStrip');
    strip.innerHTML = '';
    
    const categoriesToEvaluate = ['electronics', 'personal_care_beauty', 'pharmacy_health', 'baby', 'home_cleaning', 'pet', 'intimate_personal', 'books', 'jewellery', 'spiritual', 'stationery_games', 'supplements', 'sports_outdoor'];
    
    categoriesToEvaluate.forEach(catId => {
        const gateStatus = evaluateConfidenceGate(catId);
        
        if (gateStatus.recommend) {
            const catData = trustData.category_signals[catId];
            const div = document.createElement('div');
            
            div.innerHTML = `
                <div class="glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ai-glow relative overflow-hidden mb-4 border border-primary-fixed/30 bg-surface">
                    <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed rounded-full blur-3xl opacity-40 pointer-events-none"></div>
                    <div class="flex items-center gap-4 relative z-10">
                        <div class="w-16 h-16 rounded-2xl bg-primary-fixed/40 flex items-center justify-center shrink-0 p-3 shadow-sm ring-1 ring-primary-fixed/50">
                            <img src="img/icons/${catId}.svg?v=${IMG_VER}" alt="${catData.display_name}" class="w-full h-full object-contain">
                        </div>
                        <div>
                            <h2 class="font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface mb-1">Try ${catData.display_name}</h2>
                            <p class="font-body-md text-body-md text-on-surface-variant">Because you recently bought Groceries, we found these perfect pairings for you.</p>
                        </div>
                    </div>
                    <button class="shrink-0 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:-translate-y-1 shadow-md transition-all z-10" onclick="selectCategory('${catId}')">
                        Explore
                    </button>
                </div>
            `;
            strip.appendChild(div.firstElementChild);
        }
    });

    if (strip.innerHTML === '') {
        strip.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-on-surface-variant);">No new recommendations right now.</div>';
    }
}

function renderCategoryNav() {
    const nav = document.getElementById('categoryNav');
    nav.innerHTML = '';

    ALL_CATEGORIES.forEach(cat => {
        const catId = cat.id;
        const isActive = currentCategory === catId;
        const btn = document.createElement('button');

        if (isActive) {
            btn.className = "shrink-0 px-5 py-2.5 rounded-full font-label-md text-label-md bg-primary-fixed/40 text-on-surface border border-primary-fixed/50 whitespace-nowrap shadow-sm";
        } else {
            btn.className = "shrink-0 px-5 py-2.5 rounded-full font-label-md text-label-md bg-surface-container text-on-surface-variant hover:bg-surface-variant transition-colors border border-outline-variant/20 whitespace-nowrap";
        }

        btn.onclick = () => selectCategory(catId);
        btn.innerHTML = `${EMOJIS[catId] || '🛒'} ${cat.name}`;
        nav.appendChild(btn);
    });
}

function selectCategory(categoryId) {
    currentCategory = categoryId;
    renderCategoryNav();          // keep the home pills in sync
    showView('products');         // open the dedicated products page (renders the grid)
}

function renderCategoryView() {
    const gateStatus = evaluateConfidenceGate(currentCategory);
    const fallbackMessage = document.getElementById('fallbackMessage');

    if (gateStatus.reason === 'sparse_category') {
        fallbackMessage.style.display = 'block';
        document.getElementById('mentionCount').textContent = densityFlags.categories[currentCategory]?.mentions || 0;
    } else {
        fallbackMessage.style.display = 'none';
    }

    renderProducts();
}

// Shared product-card builder (used by home grid, search, categories).
function createProductCard(product, showAi) {
    const pid = product.product_id || product.id;
    let aiHtml = '';
    if (showAi && product.trust_signals && product.trust_signals.review_highlights.length) {
        const highlight = product.trust_signals.review_highlights[0];
        const trust = product.trust_signals;
        aiHtml = `
            <div class="mt-auto">
                <div class="ai-trust-badge rounded-xl p-3 flex flex-col gap-1 bg-primary-fixed/20 border border-primary-fixed/30">
                    <div class="flex items-center gap-1.5 text-on-surface">
                        <span class="material-symbols-outlined text-[16px] text-[#F7D032]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                        <span class="font-label-sm font-semibold">Theme: ${highlight.theme.replace(/_/g, ' ')}</span>
                    </div>
                    <p class="font-label-sm text-[11px] text-on-surface-variant leading-tight">Based on ${trust.total_ratings}+ verified ratings</p>
                </div>
            </div>`;
    }

    const card = document.createElement('div');
    card.className = "product-card rounded-3xl overflow-hidden flex flex-col cursor-pointer group bg-surface shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow";
    card.onclick = () => openPdp(pid);

    const imgs = productImages(product);
    const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
    const trusted = product.trust_signals && product.trust_signals.trusted_pick;
    card.innerHTML = `
        <div class="product-image-container relative aspect-square bg-white overflow-hidden">
            ${imgTag(imgs[0], product, 'w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500')}
            ${off ? `<span class="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">${off}% OFF</span>` : ''}
            ${imgs.length > 1 ? `<span class="absolute bottom-2 right-2 bg-white/85 backdrop-blur text-on-surface text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">photo_library</span>${imgs.length}</span>` : ''}
            ${trusted ? `<span class="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-[#F7D032] to-[#F2C94C] text-[#111] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-md border border-black/10" title="Blinkit Trusted: high ratings, high reorder rate"><span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1;">verified</span>Trusted</span>` : ''}
        </div>
        <div class="p-4 flex-grow flex flex-col gap-2">
            <h3 class="font-label-md text-label-md text-on-surface line-clamp-2">${product.product_name}</h3>
            <div class="font-headline-md text-on-surface font-bold">₹${product.price} <span class="text-xs text-outline font-normal line-through">₹${product.mrp}</span></div>
            <div class="flex items-center gap-1 text-[11px] font-semibold text-[#0d8345] -mt-1">
                <span class="material-symbols-outlined text-[13px]" style="font-variation-settings:'FILL' 1;">bolt</span> Delivery in minutes
            </div>
            ${aiHtml}
        </div>`;
    return card;
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    const all = trustData.products.filter(p => p.category === currentCategory);
    const trustedCount = all.filter(p => p.trust_signals?.trusted_pick).length;
    const products = showTrustedOnly ? all.filter(p => p.trust_signals?.trusted_pick) : all;
    const gateStatus = evaluateConfidenceGate(currentCategory);
    const heading = document.getElementById('productsHeading');
    if (heading) {
        heading.textContent = `${EMOJIS[currentCategory] || ''} ${catDisplayName(currentCategory)}`;
    }

    // Filter toolbar — "All (n)" and "Blinkit Trusted (n)" toggle chips.
    let toolbar = document.getElementById('productsToolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'productsToolbar';
        toolbar.className = 'flex items-center gap-2 mb-4 -mt-1 overflow-x-auto no-scrollbar';
        grid.parentNode.insertBefore(toolbar, grid);
    }
    toolbar.innerHTML = `
        <button onclick="showTrustedOnly=false;renderProducts();" class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${!showTrustedOnly ? 'bg-on-surface text-surface border-on-surface' : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-primary/50'}">
            All (${all.length})
        </button>
        <button onclick="showTrustedOnly=true;renderProducts();" class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${showTrustedOnly ? 'bg-gradient-to-r from-[#F7D032] to-[#F2C94C] text-[#111] border-[#F7D032]' : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-[#F7D032]'}">
            <span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' 1;">verified</span>
            Blinkit Trusted (${trustedCount})
        </button>
    `;

    if (!products.length) {
        grid.innerHTML = `<div class="col-span-full text-center text-sm text-on-surface-variant py-10">No Trusted picks in this category. Try All.</div>`;
        return;
    }

    products.forEach(product => grid.appendChild(createProductCard(product, gateStatus.show_ai_signals)));
}

// Image slider state for the PDP gallery.
let pdpImages = [];
let pdpSlideIdx = 0;

function renderPdpGallery(product) {
    pdpImages = productImages(product);
    pdpSlideIdx = 0;
    const slides = pdpImages.map(url => `<div class="w-full shrink-0 aspect-square">${imgTag(url, product, 'w-full h-full object-contain bg-white')}</div>`).join('');
    const multi = pdpImages.length > 1;
    const dots = pdpImages.map((_, i) => `<button onclick="pdpGoto(${i})" class="pdp-dot w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-primary w-5' : 'bg-white/70 border border-outline-variant/40'}"></button>`).join('');
    const controls = multi ? `
            <button onclick="pdpSlide(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur shadow flex items-center justify-center hover:bg-white transition-colors">
                <span class="material-symbols-outlined text-on-surface">chevron_left</span>
            </button>
            <button onclick="pdpSlide(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur shadow flex items-center justify-center hover:bg-white transition-colors">
                <span class="material-symbols-outlined text-on-surface">chevron_right</span>
            </button>
            <div id="pdpDots" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">${dots}</div>` : '';
    return `
        <div class="relative aspect-square w-full rounded-2xl overflow-hidden bg-white mb-4 select-none border border-outline-variant/20"
             ontouchstart="pdpTouchStart(event)" ontouchend="pdpTouchEnd(event)">
            <div id="pdpSlides" class="flex h-full transition-transform duration-300" style="transform:translateX(0%)">${slides}</div>
            ${controls}
        </div>`;
}

function pdpGoto(i) {
    if (!pdpImages.length) return;
    pdpSlideIdx = (i + pdpImages.length) % pdpImages.length;
    const track = document.getElementById('pdpSlides');
    if (track) track.style.transform = `translateX(-${pdpSlideIdx * 100}%)`;
    document.querySelectorAll('#pdpDots .pdp-dot').forEach((d, idx) => {
        d.className = `pdp-dot w-2 h-2 rounded-full transition-all ${idx === pdpSlideIdx ? 'bg-primary w-5' : 'bg-white/70 border border-outline-variant/40'}`;
    });
}
function pdpSlide(dir) { pdpGoto(pdpSlideIdx + dir); }
let pdpTouchX = null;
function pdpTouchStart(e) { pdpTouchX = e.changedTouches[0].clientX; }
function pdpTouchEnd(e) {
    if (pdpTouchX === null) return;
    const dx = e.changedTouches[0].clientX - pdpTouchX;
    if (Math.abs(dx) > 40) pdpSlide(dx < 0 ? 1 : -1);
    pdpTouchX = null;
}

function openPdp(productId) {
    const product = trustData.products.find(p => p.product_id === productId || p.id === productId);
    const pdpContent = document.getElementById('pdpContent');
    const unifiedId = product.product_id || product.id;
    currentPdpProductId = unifiedId;

    const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
    const trusted = product.trust_signals && product.trust_signals.trusted_pick;
    const trustedBadge = trusted ? `
        <div class="mb-3 flex items-center gap-2.5 bg-gradient-to-r from-[#FFF8E3] to-[#FFF3D0] border border-[#F7D032]/60 rounded-xl px-3 py-2.5 shadow-sm">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F7D032] to-[#E8A33D] flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-white text-[20px]" style="font-variation-settings:'FILL' 1;">verified</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-[11px] font-black uppercase tracking-wider text-[#7A5B06] leading-none">Blinkit Trusted</div>
                <div class="text-[11px] text-on-surface-variant leading-tight mt-0.5">${product.trust_signals.trusted_pick_reason}</div>
            </div>
        </div>` : '';
    const priceBlock = `
        <div class="mb-5">
            <h2 class="font-headline-md text-on-surface mb-1">${product.product_name}</h2>
            ${trustedBadge}
            <div class="flex items-center gap-2">
                <span class="font-headline-md font-bold text-on-surface">₹${product.price}</span>
                ${product.mrp > product.price ? `<span class="text-sm text-outline line-through">₹${product.mrp}</span>` : ''}
                ${off ? `<span class="text-xs font-bold text-on-primary bg-primary px-2 py-0.5 rounded-md">${off}% OFF</span>` : ''}
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold text-[#0d8345] mt-1">
                <span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">bolt</span> Delivery in minutes
            </div>
        </div>`;

    let aiSection = '';
    if (product.trust_signals && product.trust_signals.review_highlights.length) {
        const highlight = product.trust_signals.review_highlights[0];
        aiSection = `
        <div id="pdpAiBox" class="glass-panel p-6 rounded-3xl ai-glow relative overflow-hidden mb-6 border border-primary-fixed/30 bg-primary-fixed/10">
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div class="flex items-center gap-2 mb-4 relative z-10">
                <span class="material-symbols-outlined text-[#F7D032]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                <span class="font-label-md font-bold text-on-surface">AI Review Analysis</span>
            </div>
            <div class="grid grid-cols-2 gap-4 relative z-10 mb-4">
                <div class="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                    <div class="text-2xl font-bold text-on-surface mb-1">${product.trust_signals.repeat_purchase_pct}%</div>
                    <div class="text-xs text-on-surface-variant text-center">Repeat Purchase Rate</div>
                </div>
                <div class="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                    <div class="text-2xl font-bold text-on-surface mb-1">${product.trust_signals.avg_rating}★</div>
                    <div class="text-xs text-on-surface-variant text-center">Avg Rating (${product.trust_signals.total_ratings}+)</div>
                </div>
            </div>
            <div class="bg-surface rounded-2xl p-4 relative z-10 shadow-sm">
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Top Theme</div>
                <div class="inline-block bg-primary-fixed/40 text-on-surface px-3 py-1 rounded-full text-xs font-semibold mb-3">${highlight.theme.replace(/_/g, ' ')}</div>
                <div class="text-sm italic text-on-surface-variant">"${highlight.sample_quote}"</div>
            </div>
        </div>
        <button id="liveAiBtn" class="w-full bg-surface-container-high text-on-surface py-3 rounded-xl font-label-md font-bold shadow-sm hover:bg-surface-variant transition-colors mb-3 border border-outline-variant/30" onclick="runLiveAnalysis('${unifiedId}')">
            ✨ Run Live LLM Analysis (Groq)
        </button>`;
    }

    pdpContent.innerHTML = `
        <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-4"></div>
        ${renderPdpGallery(product)}
        ${priceBlock}
        ${aiSection}
        <button class="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold shadow-md hover:opacity-90 transition-opacity" onclick="addToCart()">Add to Cart</button>
        <button class="w-full mt-2 bg-surface-container-high text-on-surface py-4 rounded-xl font-label-md font-bold hover:bg-surface-container-highest transition-colors" onclick="buyNow()">Buy Now</button>
        ${renderPdpReviews(product)}
    `;

    document.getElementById('pdpSheet').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('pdpContent').classList.remove('translate-y-full');

    // Populate the review list now that the reviews section is in the DOM.
    if (product.trust_signals && Array.isArray(product.trust_signals.reviews) && product.trust_signals.reviews.length) {
        renderPdpReviewList(unifiedId);
    }
}

// ============================================================
// REVIEWS SECTION (PDP)
// Renders 5-30 realistic reviews per product with distribution
// bars, verified-buyer chips, filter, and Show-more pagination.
// ============================================================
let currentPdpReviewsShown = 10;
let currentPdpReviewFilter = 'all'; // 'all' | 'verified' | 5 | 4 | 3

function renderPdpReviews(product) {
    const ts = product && product.trust_signals;
    const reviews = (ts && ts.reviews) || [];
    if (!reviews.length) return '';

    // Reset UI state for each PDP open
    currentPdpReviewsShown = 10;
    currentPdpReviewFilter = 'all';

    // Distribution counts (1-5 stars)
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    const total = reviews.length;
    const verifiedCount = reviews.filter(r => r.verified).length;

    const bar = (stars) => {
        const c = dist[stars - 1];
        const pct = total ? Math.round((c / total) * 100) : 0;
        return `
            <div class="flex items-center gap-2 text-xs">
                <span class="w-6 font-semibold text-on-surface">${stars}★</span>
                <div class="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div class="h-full bg-[#0d8345] rounded-full" style="width:${pct}%"></div>
                </div>
                <span class="w-8 text-right text-on-surface-variant tabular-nums">${c}</span>
            </div>`;
    };

    return `
    <div id="pdpReviewsSection" class="mt-8 border-t border-outline-variant/30 pt-6">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#F7D032]" style="font-variation-settings:'FILL' 1;">reviews</span>
                <h3 class="font-headline-md font-bold text-on-surface">What working professionals say</h3>
            </div>
            <span class="text-xs font-semibold text-on-surface-variant">${total} review${total !== 1 ? 's' : ''}</span>
        </div>

        <!-- Summary row: big rating + distribution bars -->
        <div class="grid grid-cols-[auto,1fr] gap-4 items-center bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 mb-5">
            <div class="text-center px-2">
                <div class="text-4xl font-bold text-on-surface leading-none">${ts.avg_rating}</div>
                <div class="text-[10px] text-on-surface-variant mt-1">out of 5</div>
                <div class="text-[10px] text-[#0d8345] font-semibold mt-2">${verifiedCount} verified</div>
            </div>
            <div class="flex flex-col gap-1.5">
                ${[5,4,3,2,1].map(bar).join('')}
            </div>
        </div>

        <!-- Filter chips -->
        <div id="pdpReviewFilters" class="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            ${reviewFilterChip('all', `All (${total})`)}
            ${reviewFilterChip('verified', `Verified (${verifiedCount})`)}
            ${dist[4] > 0 ? reviewFilterChip(5, `5★ (${dist[4]})`) : ''}
            ${dist[3] > 0 ? reviewFilterChip(4, `4★ (${dist[3]})`) : ''}
            ${dist[2] > 0 ? reviewFilterChip(3, `3★ (${dist[2]})`) : ''}
        </div>

        <!-- Review list -->
        <div id="pdpReviewList" class="flex flex-col gap-3"></div>

        <!-- Show more -->
        <button id="pdpReviewMoreBtn" class="hidden w-full mt-4 bg-surface-container-high text-on-surface py-3 rounded-xl font-label-md font-bold hover:bg-surface-container-highest transition-colors" onclick="pdpShowMoreReviews()">
            Show more reviews
        </button>
    </div>
    `;
}

function reviewFilterChip(id, label) {
    const active = currentPdpReviewFilter === id;
    return `<button onclick="pdpFilterReviews('${id}')" class="chip-${id} shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-primary/50'}">${label}</button>`;
}

function pdpFilterReviews(id) {
    // 'all' and 'verified' stay strings, star levels are ints
    currentPdpReviewFilter = (id === 'all' || id === 'verified') ? id : parseInt(id, 10);
    currentPdpReviewsShown = 10;
    // Re-render filter chips (active state) and list
    const product = trustData.products.find(p => (p.product_id || p.id) === currentPdpProductId);
    if (!product) return;
    const ts = product.trust_signals;
    const reviews = ts.reviews || [];
    const dist = [0,0,0,0,0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    const total = reviews.length;
    const verifiedCount = reviews.filter(r => r.verified).length;
    const filtersEl = document.getElementById('pdpReviewFilters');
    if (filtersEl) {
        filtersEl.innerHTML = `
            ${reviewFilterChip('all', `All (${total})`)}
            ${reviewFilterChip('verified', `Verified (${verifiedCount})`)}
            ${dist[4] > 0 ? reviewFilterChip(5, `5★ (${dist[4]})`) : ''}
            ${dist[3] > 0 ? reviewFilterChip(4, `4★ (${dist[3]})`) : ''}
            ${dist[2] > 0 ? reviewFilterChip(3, `3★ (${dist[2]})`) : ''}
        `;
    }
    renderPdpReviewList(currentPdpProductId);
}

function pdpShowMoreReviews() {
    currentPdpReviewsShown += 10;
    renderPdpReviewList(currentPdpProductId);
}

function renderPdpReviewList(productId) {
    const product = trustData.products.find(p => (p.product_id || p.id) === productId);
    if (!product) return;
    const listEl = document.getElementById('pdpReviewList');
    const moreBtn = document.getElementById('pdpReviewMoreBtn');
    if (!listEl) return;

    const all = (product.trust_signals && product.trust_signals.reviews) || [];
    const filtered = all.filter(r => {
        if (currentPdpReviewFilter === 'all') return true;
        if (currentPdpReviewFilter === 'verified') return r.verified;
        return r.rating === currentPdpReviewFilter;
    });

    // Sort: most recent first (days > weeks > months, roughly)
    const dateWeight = (d) => {
        const m = /^(\d+)\s+(day|week|month)/.exec(d || '');
        if (!m) return 999999;
        const n = parseInt(m[1], 10);
        const unit = m[2];
        return unit === 'day' ? n : unit === 'week' ? n * 7 : n * 30;
    };
    const sorted = [...filtered].sort((a, b) => dateWeight(a.date) - dateWeight(b.date));

    const toShow = sorted.slice(0, currentPdpReviewsShown);
    listEl.innerHTML = toShow.map(r => reviewCard(r)).join('') ||
        `<div class="text-sm text-on-surface-variant text-center py-6">No reviews match this filter.</div>`;

    if (moreBtn) {
        if (sorted.length > currentPdpReviewsShown) {
            moreBtn.classList.remove('hidden');
            moreBtn.textContent = `Show ${Math.min(10, sorted.length - currentPdpReviewsShown)} more reviews`;
        } else {
            moreBtn.classList.add('hidden');
        }
    }
}

function reviewCard(r) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const starColor = r.rating >= 4 ? '#0d8345' : r.rating === 3 ? '#c07a00' : '#c53030';
    const initials = (r.reviewer || 'AB').split(' ').map(s => s[0] || '').join('').slice(0, 2).toUpperCase();
    const avatarColors = ['#F7D032','#0d8345','#3B82F6','#D64545','#8B5CF6','#EC4899','#14B8A6','#F97316'];
    const avatarBg = avatarColors[initials.charCodeAt(0) % avatarColors.length];
    return `
    <div class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20">
        <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background:${avatarBg}">${initials}</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-on-surface">${escapeHtml(r.reviewer || 'Anonymous')}</span>
                    ${r.verified ? '<span class="text-[10px] font-bold text-[#0d8345] bg-[#0d8345]/10 px-1.5 py-0.5 rounded">✓ Verified Buyer</span>' : ''}
                    <span class="text-[10px] text-on-surface-variant">${escapeHtml(r.city || '')} · ${escapeHtml(r.date || '')}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm tabular-nums" style="color:${starColor}; letter-spacing:1px;">${stars}</span>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">${(r.theme || '').replace(/_/g, ' ')}</span>
                </div>
                <p class="text-sm text-on-surface mt-2 leading-relaxed">${escapeHtml(r.text || '')}</p>
            </div>
        </div>
    </div>`;
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

async function runLiveAnalysis(productId) {
    const product = trustData.products.find(p => p.product_id === productId || p.id === productId);
    const btn = document.getElementById('liveAiBtn');
    const aiBox = document.getElementById('pdpAiBox');
    
    btn.innerHTML = 'Analyzing with LLM...';
    btn.disabled = true;
    
    try {
        const rawReviews = product.trust_signals.review_highlights.map(r => r.sample_quote).join(". ");
        const response = await fetch('/api/analyze-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewText: rawReviews.substring(0, 1000), // send first 1000 chars
                provider: 'groq'
            })
        });
        
        const data = await response.json();
        if (data.success && data.analysis) {
            aiBox.innerHTML = `
                <div class="flex items-center gap-2 mb-4 relative z-10">
                    <span class="material-symbols-outlined text-primary">auto_awesome</span>
                    <span class="font-label-md font-bold text-on-surface">Live LLM Analysis</span>
                    <span class="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] ml-auto font-bold">LIVE</span>
                </div>
                <div class="grid grid-cols-2 gap-4 relative z-10 mb-4">
                    <div class="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-primary/20">
                        <div class="text-lg font-bold text-on-surface mb-1">${data.analysis.sentiment.toUpperCase()}</div>
                        <div class="text-[10px] text-on-surface-variant text-center">Sentiment</div>
                    </div>
                    <div class="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-primary/20">
                        <div class="text-lg font-bold text-on-surface mb-1">${Math.round(data.analysis.confidence * 100)}%</div>
                        <div class="text-[10px] text-on-surface-variant text-center">Confidence Score</div>
                    </div>
                </div>
                <div class="bg-surface rounded-2xl p-4 relative z-10 shadow-sm border border-primary/20">
                    <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Live Extracted Theme</div>
                    <div class="inline-block bg-primary-fixed/40 text-on-surface px-3 py-1 rounded-full text-xs font-semibold mb-3">${data.analysis.theme}</div>
                </div>
            `;
            btn.innerHTML = 'Analysis Complete';
        } else {
            throw new Error(data.error || 'Failed to analyze');
        }
    } catch(e) {
        console.error(e);
        btn.innerHTML = 'Analysis Failed';
        btn.classList.add('bg-error-container', 'text-on-error-container');
    }
}

function closePdp() {
    document.getElementById('pdpSheet').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('pdpContent').classList.add('translate-y-full');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface px-6 py-3 rounded-full shadow-lg font-label-md z-[200] transition-opacity duration-300';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================================
// CART → CHECKOUT → ORDER → CROSS-CATEGORY ACTIVATION (CCAR)
// The end-to-end trial journey. A completed order in a category
// outside the user's 90-day history activates CCAR (North Star).
// ============================================================

let cart = JSON.parse(localStorage.getItem('blinkit_cart') || '[]');

function saveCart() {
    localStorage.setItem('blinkit_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
    } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
    }
}

function findProduct(productId) {
    return trustData.products.find(p => (p.product_id || p.id) === productId);
}

// Categories the current profile has NOT purchased in the 90-day lookback.
function isNovelCategory(categoryId) {
    const history = userProfiles.users[currentProfile].categories_purchased_90d || [];
    return !history.includes(categoryId);
}

function addToCart(productId, opts = {}) {
    productId = productId || currentPdpProductId;
    const product = findProduct(productId);
    if (!product) return;

    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: productId,
            name: product.product_name,
            price: product.price,
            mrp: product.mrp,
            image: product.image || product.subcategory,
            category: product.category,
            category_name: catDisplayName(product.category),
            qty: 1
        });
    }
    saveCart();
    closePdp();

    if (opts.checkout) {
        openCheckout();
    } else {
        showToast(`${product.product_name} added to cart`);
    }
}

// PDP "Buy Now" → straight to checkout with the item added.
function buyNow() {
    addToCart(currentPdpProductId, { checkout: true });
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
}

// Fee model reflecting Pattern C ("Tax on Trials"): small, cautious
// trial baskets are disproportionately penalised. Fees are shown
// transparently — fee policy is finance-owned / out of scope.
function computeFees(itemTotal) {
    const deliveryFee = itemTotal === 0 ? 0 : (itemTotal >= 199 ? 0 : 25);
    const handlingFee = itemTotal === 0 ? 0 : 9;
    const smallCartFee = (itemTotal > 0 && itemTotal < 100) ? 20 : 0;
    const fees = deliveryFee + handlingFee + smallCartFee;
    const total = itemTotal + fees;
    const feePct = itemTotal > 0 ? Math.round((fees / itemTotal) * 100) : 0;
    return { deliveryFee, handlingFee, smallCartFee, fees, total, feePct };
}

function cartItemTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function cartSavings() {
    return cart.reduce((s, i) => s + Math.max(0, (i.mrp - i.price)) * i.qty, 0);
}

// A category counts toward CCAR only if it's a non-grocery TRIAL category new to the user.
function isTrialNovel(categoryId) {
    return !GROCERY_IDS.has(categoryId) && isNovelCategory(categoryId);
}

// Distinct novel (new-to-user) trial categories currently in the cart.
function novelCategoriesInCart() {
    const set = new Set();
    cart.forEach(i => { if (isTrialNovel(i.category)) set.add(i.category); });
    return [...set];
}

// ---- App Sheet helpers (shared by cart / checkout / confirmation) ----
function openAppSheet(html) {
    const content = document.getElementById('appSheetContent');
    content.innerHTML = html;
    content.scrollTop = 0;
    document.getElementById('appSheet').classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('translate-y-full', 'md:translate-y-6');
}

function closeAppSheet() {
    const content = document.getElementById('appSheetContent');
    document.getElementById('appSheet').classList.add('opacity-0', 'pointer-events-none');
    content.classList.add('translate-y-full', 'md:translate-y-6');
}

function emoji(item) {
    return EMOJIS[item.image] || EMOJIS[item.category] || '📦';
}

function feeRow(label, value, opts = {}) {
    const right = value === 0
        ? `<span class="text-blinkit-green font-semibold" style="color:#0d8345">FREE</span>`
        : `<span class="${opts.strong ? 'font-bold text-on-surface' : 'text-on-surface-variant'}">₹${value}</span>`;
    return `<div class="flex justify-between text-sm py-1"><span class="text-on-surface-variant">${label}</span>${right}</div>`;
}

// ---- 1) CART ----
function openCart() { renderCart(); }

function renderCart() {
    if (cart.length === 0) {
        openAppSheet(`
            <div class="p-6">
                <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6 md:hidden"></div>
                <div class="flex flex-col items-center text-center py-10">
                    <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-4xl mb-4">🛒</div>
                    <h2 class="font-headline-md text-on-surface mb-1">Your cart is empty</h2>
                    <p class="text-sm text-on-surface-variant mb-6">Discover a new category and start a trial.</p>
                    <button onclick="closeAppSheet()" class="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md font-bold">Browse products</button>
                </div>
            </div>`);
        return;
    }

    const itemTotal = cartItemTotal();
    const fees = computeFees(itemTotal);
    const savings = cartSavings();
    const novel = novelCategoriesInCart();

    const itemsHtml = cart.map(item => `
        <div class="flex items-center gap-3 py-3 border-b border-outline-variant/15">
            <div class="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center text-2xl shrink-0">${emoji(item)}</div>
            <div class="flex-1 min-w-0">
                <div class="font-label-md text-on-surface line-clamp-1">${item.name}</div>
                <div class="text-xs text-on-surface-variant flex items-center gap-1">
                    ${isTrialNovel(item.category) ? '<span class="text-[10px] bg-primary-fixed/50 text-on-surface px-1.5 py-0.5 rounded-full font-semibold">✨ New trial</span>' : `<span>${item.category_name}</span>`}
                </div>
                <div class="text-sm font-bold text-on-surface mt-0.5">₹${item.price} <span class="text-[11px] text-outline font-normal line-through">₹${item.mrp}</span></div>
            </div>
            <div class="flex items-center gap-2 bg-primary text-on-primary rounded-lg overflow-hidden shrink-0">
                <button onclick="changeQty('${item.id}', -1)" class="px-2.5 py-1.5 font-bold hover:bg-primary-fixed-dim">−</button>
                <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                <button onclick="changeQty('${item.id}', 1)" class="px-2.5 py-1.5 font-bold hover:bg-primary-fixed-dim">+</button>
            </div>
        </div>
    `).join('');

    // Trial-basket economics annotation (Supporting Metric: fees as % of trial-order value)
    const trialEconNote = (novel.length > 0 && fees.feePct >= 15) ? `
        <div class="mt-3 flex items-start gap-2 bg-error-container/40 border border-error/20 rounded-xl p-3">
            <span class="material-symbols-outlined text-[18px] text-error mt-0.5">info</span>
            <p class="text-[11px] text-on-surface-variant leading-snug">
                Fees are <b>${fees.feePct}%</b> of this trial basket. Small first-time baskets carry a higher relative fee (the "tax on trials"). Fee policy is finance-owned; tracked here as <b>trial-basket economics</b>.
            </p>
        </div>` : '';

    openAppSheet(`
        <div class="sticky top-0 bg-surface z-10 px-6 pt-4 pb-3 border-b border-outline-variant/15">
            <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-3 md:hidden"></div>
            <div class="flex items-center justify-between">
                <h2 class="font-headline-md text-on-surface">Your Cart <span class="text-sm font-normal text-on-surface-variant">(${cart.reduce((s,i)=>s+i.qty,0)} items)</span></h2>
                <button onclick="closeAppSheet()" class="p-1.5 rounded-full hover:bg-surface-variant/40"><span class="material-symbols-outlined text-on-surface-variant">close</span></button>
            </div>
        </div>
        <div class="px-6">
            ${novel.length > 0 ? `
            <div class="mt-4 flex items-center gap-2 bg-primary-fixed/25 border border-primary-fixed/40 rounded-xl p-3">
                <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;color:#f7d032">auto_awesome</span>
                <p class="text-xs text-on-surface leading-snug"><b>First trial in ${novel.map(c=>trustData.category_signals[c].display_name).join(' & ')}.</b> Completing this order activates a new category for you.</p>
            </div>` : ''}
            <div>${itemsHtml}</div>

            <div class="mt-4 bg-surface-container-low rounded-2xl p-4">
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bill details</div>
                ${feeRow('Item total', itemTotal)}
                ${feeRow('Delivery fee', fees.deliveryFee)}
                ${feeRow('Handling fee', fees.handlingFee)}
                ${fees.smallCartFee ? feeRow('Small cart fee', fees.smallCartFee) : ''}
                <div class="border-t border-outline-variant/20 mt-2 pt-2 flex justify-between font-bold text-on-surface">
                    <span>To pay</span><span>₹${fees.total}</span>
                </div>
                ${savings > 0 ? `<div class="mt-2 text-xs font-semibold" style="color:#0d8345">You save ₹${savings} on MRP</div>` : ''}
                ${trialEconNote}
            </div>

            <div class="flex items-center gap-2 mt-4 text-xs text-on-surface-variant">
                <span class="material-symbols-outlined text-[18px]" style="color:#0d8345">bolt</span> Delivery in <b class="text-on-surface">10 minutes</b> to your saved address
            </div>
        </div>
        <div class="sticky bottom-0 bg-surface px-6 py-4 border-t border-outline-variant/15 mt-4">
            <button onclick="openCheckout()" class="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                Proceed to Checkout · ₹${fees.total}
                <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    `);
}

// ---- 2) CHECKOUT ----
let selectedPayment = 'cod';
function selectPayment(method) {
    selectedPayment = method;
    renderCheckout();
}

function openCheckout() {
    if (cart.length === 0) { showToast('Your cart is empty'); return; }
    renderCheckout();
}

function renderCheckout() {
    const itemTotal = cartItemTotal();
    const fees = computeFees(itemTotal);
    const novel = novelCategoriesInCart();

    const payOption = (id, icon, label, sub) => `
        <button onclick="selectPayment('${id}')" class="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedPayment===id ? 'border-primary bg-primary-fixed/15' : 'border-outline-variant/30 bg-surface-container-lowest'}">
            <span class="material-symbols-outlined text-on-surface">${icon}</span>
            <div class="flex-1">
                <div class="font-label-md text-on-surface">${label}</div>
                <div class="text-[11px] text-on-surface-variant">${sub}</div>
            </div>
            <span class="material-symbols-outlined ${selectedPayment===id ? 'text-primary' : 'text-outline-variant'}" style="font-variation-settings:'FILL' ${selectedPayment===id?1:0}">${selectedPayment===id ? 'check_circle' : 'radio_button_unchecked'}</span>
        </button>`;

    openAppSheet(`
        <div class="sticky top-0 bg-surface z-10 px-6 pt-4 pb-3 border-b border-outline-variant/15">
            <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-3 md:hidden"></div>
            <div class="flex items-center gap-2">
                <button onclick="renderCart()" class="p-1.5 rounded-full hover:bg-surface-variant/40"><span class="material-symbols-outlined text-on-surface-variant">arrow_back</span></button>
                <h2 class="font-headline-md text-on-surface">Checkout</h2>
            </div>
        </div>
        <div class="px-6 py-4 flex flex-col gap-4">
            <!-- Address -->
            <div class="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-primary mt-0.5" style="font-variation-settings:'FILL' 1">location_on</span>
                <div class="flex-1">
                    <div class="font-label-md text-on-surface">Deliver to Home</div>
                    <div class="text-xs text-on-surface-variant leading-snug">B-204, Sunrise Apartments, Sigra, Varanasi, 221010</div>
                </div>
                <button onclick="showToast('Address editing is out of scope for this prototype')" class="text-primary text-xs font-bold">Change</button>
            </div>

            <!-- Delivery ETA -->
            <div class="flex items-center gap-2 bg-primary-fixed/20 rounded-2xl p-4">
                <span class="material-symbols-outlined" style="color:#0d8345">bolt</span>
                <div class="text-sm text-on-surface"><b>10 minute</b> delivery · arriving from Sigra dark store</div>
            </div>

            <!-- Payment -->
            <div>
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment method</div>
                <div class="flex flex-col gap-2">
                    ${payOption('cod', 'payments', 'Cash on Delivery', 'Pay when your order arrives')}
                    ${payOption('upi', 'account_balance', 'UPI', 'Pay via any UPI app (simulated)')}
                </div>
                <p class="text-[10px] text-on-surface-variant mt-2">Prototype checkout — no real payment is processed.</p>
            </div>

            <!-- Bill -->
            <div class="bg-surface-container-low rounded-2xl p-4">
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bill details</div>
                ${feeRow('Item total', itemTotal)}
                ${feeRow('Delivery fee', fees.deliveryFee)}
                ${feeRow('Handling fee', fees.handlingFee)}
                ${fees.smallCartFee ? feeRow('Small cart fee', fees.smallCartFee) : ''}
                <div class="border-t border-outline-variant/20 mt-2 pt-2 flex justify-between font-bold text-on-surface">
                    <span>To pay</span><span>₹${fees.total}</span>
                </div>
            </div>
        </div>
        <div class="sticky bottom-0 bg-surface px-6 py-4 border-t border-outline-variant/15">
            <button onclick="placeOrder()" class="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                Place Order · ₹${fees.total}
            </button>
        </div>
    `);
}

// ---- 3) PLACE ORDER + CCAR ACTIVATION ----
function placeOrder() {
    const itemTotal = cartItemTotal();
    const fees = computeFees(itemTotal);
    const novel = novelCategoriesInCart();
    const orderId = 'BK' + Date.now().toString().slice(-8);
    const orderedItems = [...cart];

    // Update the in-memory user profile — this is what moves CCAR.
    const profile = userProfiles.users[currentProfile];
    novel.forEach(catId => {
        if (!profile.categories_purchased_90d.includes(catId)) {
            profile.categories_purchased_90d.push(catId);
        }
        if (catId !== 'groceries_fresh' && catId !== 'snacks_beverages' && catId !== 'dairy') {
            profile.last_non_grocery_purchase = { category: catId, days_ago: 0 };
            profile.is_ccar_active = true;
        }
    });

    // Persist to order history (powers the Orders page + reorder loop).
    const orders = JSON.parse(localStorage.getItem('blinkit_orders') || '[]');
    orders.unshift({
        orderId,
        profile: currentProfile,
        placedAt: new Date().toISOString(),
        items: orderedItems,
        total: fees.total,
        payment: selectedPayment,
        novelCategories: novel.filter(c => c !== 'groceries_fresh' && c !== 'snacks_beverages' && c !== 'dairy')
    });
    localStorage.setItem('blinkit_orders', JSON.stringify(orders));

    // Clear the cart; the trial is complete.
    cart = [];
    saveCart();

    renderConfirmation({ orderId, fees, novel, orderedItems, payment: selectedPayment });

    // Reflect the activated categories across the app (rec strip stops nudging
    // a category the user has now purchased).
    renderApp();
}

function renderConfirmation({ orderId, fees, novel, orderedItems, payment }) {
    const novelNames = novel
        .filter(c => c !== 'groceries_fresh' && c !== 'snacks_beverages' && c !== 'dairy')
        .map(c => trustData.category_signals[c].display_name);

    const ccarPanel = novelNames.length > 0 ? `
        <div class="mt-5 rounded-2xl p-5 border border-primary-fixed/40 ai-glow relative overflow-hidden text-center" style="background:linear-gradient(135deg, rgba(247,208,50,0.18), rgba(247,208,50,0.04))">
            <div class="text-3xl mb-1">🎉</div>
            <div class="font-headline-md text-on-surface mb-1">Cross-Category Activation!</div>
            <p class="text-sm text-on-surface-variant leading-snug">
                You just placed your <b>first trial</b> in <b>${novelNames.join(' & ')}</b> on Blinkit.
                This counts toward the North Star metric — <b>CCAR</b>.
            </p>
            <div class="mt-3 inline-flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface shadow-sm">
                <span class="material-symbols-outlined text-[16px]" style="color:#0d8345">trending_up</span>
                +1 new category this month
            </div>
        </div>
        <div class="mt-3 flex items-start gap-2 px-1">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">psychology</span>
            <p class="text-[11px] text-on-surface-variant leading-snug">The real test is the <b>second purchase</b>. We'll check in after your first ${novelNames[0]} experience — a good first trial is what makes a category stick.</p>
        </div>` : `
        <div class="mt-5 text-center text-sm text-on-surface-variant">Thanks for your order! Items from categories you already shop.</div>`;

    const itemsLine = orderedItems.map(i => `${i.qty}× ${i.name}`).join(', ');

    openAppSheet(`
        <div class="p-6 text-center">
            <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-5 md:hidden"></div>
            <div class="w-20 h-20 mx-auto rounded-full bg-primary-fixed/30 flex items-center justify-center mb-3">
                <span class="material-symbols-outlined text-5xl" style="font-variation-settings:'FILL' 1;color:#0d8345">check_circle</span>
            </div>
            <h2 class="font-headline-lg text-on-surface">Order Placed!</h2>
            <p class="text-sm text-on-surface-variant mt-1">Arriving in <b class="text-on-surface">10 minutes</b></p>

            <div class="mt-5 bg-surface-container-low rounded-2xl p-4 text-left">
                <div class="flex justify-between text-sm py-1"><span class="text-on-surface-variant">Order ID</span><span class="font-bold text-on-surface">${orderId}</span></div>
                <div class="flex justify-between text-sm py-1"><span class="text-on-surface-variant">Paid via</span><span class="text-on-surface">${payment === 'cod' ? 'Cash on Delivery' : 'UPI (simulated)'}</span></div>
                <div class="flex justify-between text-sm py-1"><span class="text-on-surface-variant">Amount</span><span class="font-bold text-on-surface">₹${fees.total}</span></div>
                <div class="text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/20 leading-snug">${itemsLine}</div>
            </div>

            ${ccarPanel}

            <button onclick="closeAppSheet(); showView('home');" class="w-full mt-6 bg-primary text-on-primary py-4 rounded-xl font-label-md font-bold shadow-md hover:opacity-90">Continue Shopping</button>
            <a onclick="closeAppSheet(); showView('orders');" class="block mt-2 text-primary text-sm font-semibold cursor-pointer">View your orders →</a>
        </div>
    `);
}

// ============================================================
// NAVIGATION VIEWS (Home / Categories / Search / Orders)
// Lightweight in-page router — every nav button lands somewhere
// real, and every path can reach the checkout journey.
// ============================================================
let currentView = 'home';

function showView(name, opts = {}) {
    currentView = name;
    const views = { home: 'homeView', products: 'productsView', categories: 'categoriesView', search: 'searchView', orders: 'ordersView', profile: 'profileView' };
    Object.values(views).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== views[name]);
    });

    // Highlight the active nav item (desktop + mobile).
    const activeMap = { home: ['navHome', 'mnavHome'], categories: ['navCategories', 'mnavCategories'], orders: ['navOrders', 'mnavOrders'], profile: ['navProfile', 'mnavProfile'] };
    ['navHome','navCategories','navOrders','navProfile','mnavHome','mnavCategories','mnavOrders','mnavProfile'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('bg-primary-fixed/30','bg-primary-fixed/40','text-on-surface','font-bold','border-r-4','border-primary');
        el.classList.add('text-on-surface-variant');
    });
    (activeMap[name] || []).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('text-on-surface-variant');
        el.classList.add(id.startsWith('m') ? 'bg-primary-fixed/40' : 'bg-primary-fixed/30', 'text-on-surface', 'font-bold');
    });

    if (name === 'products') renderCategoryView();
    if (name === 'categories') renderCategoriesOverview();
    if (name === 'orders') renderOrders();
    if (name === 'profile') renderProfile();
    if (!opts.silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Categories overview ----
function renderCategoriesOverview() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    const tile = cat => {
        const count = trustData.products.filter(p => p.category === cat.id).length;
        const isTrial = cat.type === 'trial';
        const novel = isTrial && isNovelCategory(cat.id);
        const tag = !isTrial
            ? '<span class="mt-1 inline-flex items-center gap-1 self-start text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">Everyday</span>'
            : (novel
                ? '<span class="mt-1 inline-flex items-center gap-1 self-start text-[10px] bg-primary-fixed/50 text-on-surface px-2 py-0.5 rounded-full font-semibold">✨ New for you</span>'
                : '<span class="mt-1 inline-flex items-center gap-1 self-start text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">Already tried</span>');
        return `
            <button onclick="selectCategory('${cat.id}')" class="text-left product-card rounded-3xl p-5 flex flex-col gap-1.5 cursor-pointer bg-surface shadow-sm border border-outline-variant/20 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div class="w-14 h-14 rounded-2xl bg-primary-fixed/30 flex items-center justify-center p-2.5 mb-1"><img src="img/icons/${cat.id}.svg?v=${IMG_VER}" alt="${cat.name}" class="w-full h-full object-contain"></div>
                <div class="font-label-md text-on-surface leading-tight">${cat.name}</div>
                <div class="text-xs text-on-surface-variant">${count} products</div>
                ${tag}
            </button>`;
    };

    const grocery = ALL_CATEGORIES.filter(c => c.type === 'grocery');
    const trial = ALL_CATEGORIES.filter(c => c.type === 'trial');
    const gridCls = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';

    container.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;color:#f7d032">auto_awesome</span>
                <h3 class="font-headline-md text-on-surface">New categories to try</h3>
            </div>
            <p class="text-xs text-on-surface-variant mb-3">Backed by AI trust signals from real reviews — try with confidence.</p>
            <div class="${gridCls}">${trial.map(tile).join('')}</div>
        </div>
        <div>
            <h3 class="font-headline-md text-on-surface mb-1">Your everyday</h3>
            <p class="text-xs text-on-surface-variant mb-3">Groceries and daily essentials you already shop.</p>
            <div class="${gridCls}">${grocery.map(tile).join('')}</div>
        </div>`;
}

// ---- Search ----
function openMobileSearch() {
    showView('search');
    setTimeout(() => { const el = document.getElementById('searchInputMobile'); if (el) el.focus(); }, 50);
}

// Word-based relevance score: rewards whole-word and word-prefix matches only
// (not arbitrary substrings), so a single letter doesn't flood the results and
// ranking is by relevance rather than catalog order.
function searchScore(text, tokens) {
    const words = (text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    let s = 0;
    for (const t of tokens) {
        if (words.includes(t)) s += 4;                       // exact word
        else if (words.some(w => w.startsWith(t))) s += 3;   // word prefix
    }
    return s;
}

function doSearch(query) {
    query = (query || '').trim().toLowerCase();
    // Keep both search inputs in sync.
    const d = document.getElementById('searchInput'), m = document.getElementById('searchInputMobile');
    if (d && d.value.toLowerCase() !== query) d.value = query;
    if (m && m.value.toLowerCase() !== query) m.value = query;

    if (query.length === 0) { showView('home'); return; }
    showView('search', { silent: true });

    const tokens = query.split(/\s+/).filter(Boolean);

    // Categories whose name matches the typed words → shown as jump-in chips.
    const catMatches = ALL_CATEGORIES.filter(c => searchScore(catDisplayName(c.id), tokens) > 0);
    const matchedCatIds = new Set(catMatches.map(c => c.id));

    // Products ranked by word relevance; products in a matched category are
    // included too (so searching a category name lists its items).
    const scored = trustData.products.map(p => {
        let s = Math.max(searchScore(p.product_name, tokens), searchScore(p.subcategory, tokens));
        if (matchedCatIds.has(p.category)) s = Math.max(s, 2);
        return { p, s };
    }).filter(x => x.s > 0);
    scored.sort((a, b) => b.s - a.s || (b.p.trust_signals?.avg_rating || 0) - (a.p.trust_signals?.avg_rating || 0));
    const results = scored.slice(0, 48).map(x => x.p);

    const grid = document.getElementById('searchGrid');
    grid.innerHTML = '';

    // Category suggestions row (word-matched categories).
    if (catMatches.length) {
        const chips = catMatches.map(c =>
            `<button onclick="selectCategory('${c.id}')" class="inline-flex items-center gap-1.5 bg-primary-fixed/30 text-on-surface px-3 py-1.5 rounded-full text-sm font-semibold border border-primary-fixed/40 hover:bg-primary-fixed/50 transition-colors">${EMOJIS[c.id] || '🔎'} ${catDisplayName(c.id)}</button>`
        ).join('');
        const row = document.createElement('div');
        row.className = 'col-span-full';
        row.innerHTML = `<div class="text-xs font-semibold text-on-surface-variant mb-2">Categories</div><div class="flex flex-wrap gap-2 mb-4">${chips}</div>`;
        grid.appendChild(row);
    }

    document.getElementById('searchMeta').textContent =
        `${scored.length} match${scored.length === 1 ? '' : 'es'} for "${query}"${catMatches.length ? ` · ${catMatches.length} categor${catMatches.length === 1 ? 'y' : 'ies'}` : ''}`;

    if (results.length === 0 && catMatches.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-on-surface-variant">No matches. Try "earbuds", "chess", "protein", "books"…</div>`;
        return;
    }
    results.forEach(p => {
        const showAi = evaluateConfidenceGate(p.category).show_ai_signals;
        grid.appendChild(createProductCard(p, showAi));
    });
}

// ---- Orders + reorder (second-purchase loop) ----
function renderOrders() {
    const list = document.getElementById('ordersList');
    if (!list) return;
    const orders = JSON.parse(localStorage.getItem('blinkit_orders') || '[]').filter(o => o.profile === currentProfile);

    if (orders.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center text-center py-16">
                <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-4xl mb-4">📦</div>
                <h3 class="font-headline-md text-on-surface mb-1">No orders yet</h3>
                <p class="text-sm text-on-surface-variant mb-6">Try a new category and your orders will show up here.</p>
                <button onclick="showView('categories')" class="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md font-bold">Explore categories</button>
            </div>`;
        return;
    }

    list.innerHTML = orders.map(o => {
        const when = new Date(o.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const itemsLine = o.items.map(i => `${i.qty}× ${i.name}`).join(', ');
        const novelBadge = (o.novelCategories && o.novelCategories.length)
            ? `<span class="inline-flex items-center gap-1 text-[10px] bg-primary-fixed/40 text-on-surface px-2 py-0.5 rounded-full font-semibold">✨ New-category trial</span>` : '';
        return `
            <div class="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-4 mb-3">
                <div class="flex items-center justify-between mb-1">
                    <div class="font-label-md text-on-surface">Order ${o.orderId}</div>
                    <div class="text-xs text-on-surface-variant">${when}</div>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-[11px] text-on-surface-variant">₹${o.total} · ${o.payment === 'cod' ? 'COD' : 'UPI'}</span>
                    ${novelBadge}
                </div>
                <div class="text-sm text-on-surface-variant leading-snug mb-3">${itemsLine}</div>
                <div class="flex gap-2">
                    <button onclick="reorder('${o.orderId}')" class="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-label-md font-bold text-sm hover:opacity-90 flex items-center justify-center gap-1.5">
                        <span class="material-symbols-outlined text-[18px]">refresh</span> Reorder
                    </button>
                    <div class="flex-1 flex items-center justify-center gap-1 text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
                        <span class="material-symbols-outlined text-[16px]" style="color:#0d8345">check_circle</span> Delivered
                    </div>
                </div>
            </div>`;
    }).join('');
}

// Reorder = the "second purchase" — the real test of whether a trial stuck.
function reorder(orderId) {
    const orders = JSON.parse(localStorage.getItem('blinkit_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;
    order.items.forEach(oi => {
        const product = findProduct(oi.id);
        if (!product) return;
        const existing = cart.find(i => i.id === oi.id);
        if (existing) existing.qty += oi.qty;
        else cart.push({ ...oi });
    });
    saveCart();
    if (order.novelCategories && order.novelCategories.length) {
        showToast('Second purchase — this is what makes a category stick! 🎯');
    } else {
        showToast('Items added back to your cart');
    }
    openCheckout();
}

// ---- User Profile view ----
const GROCERY_NAMES = { groceries_fresh: 'Groceries & Fresh', snacks_beverages: 'Snacks & Beverages', dairy: 'Dairy' };
const GROCERY_EMOJI = { groceries_fresh: '🥬', snacks_beverages: '🍫', dairy: '🥛' };

function renderProfile() {
    const el = document.getElementById('profileContent');
    if (!el) return;
    const u = userProfiles.users[currentProfile];

    const catName = c => trustData.category_signals[c]?.display_name || GROCERY_NAMES[c] || c;
    const catEmoji = c => EMOJIS[c] || GROCERY_EMOJI[c] || '🛒';

    const newCatsTried = (u.categories_purchased_90d || []).filter(c => trustData.category_signals[c]);
    const allCats = u.categories_purchased_90d || [];
    const diversity = u.diversity_ratio || { novel_categories_shown: 0, novel_categories_clicked: 0 };
    const myOrders = JSON.parse(localStorage.getItem('blinkit_orders') || '[]').filter(o => o.profile === currentProfile);

    const stat = (icon, value, label) => `
        <div class="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px] text-on-surface">${icon}</span>
            </div>
            <div>
                <div class="font-headline-md text-on-surface leading-none">${value}</div>
                <div class="text-[11px] text-on-surface-variant mt-1">${label}</div>
            </div>
        </div>`;

    const catChips = allCats.map(c =>
        `<span class="inline-flex items-center gap-1 text-xs font-semibold ${trustData.category_signals[c] ? 'bg-primary-fixed/40 text-on-surface' : 'bg-surface-container text-on-surface-variant'} px-3 py-1.5 rounded-full">${catEmoji(c)} ${catName(c)}</span>`
    ).join(' ');

    const ccarCard = u.is_ccar_active ? `
        <div class="rounded-2xl p-5 border border-primary-fixed/40 ai-glow relative overflow-hidden" style="background:linear-gradient(135deg, rgba(247,208,50,0.18), rgba(247,208,50,0.04))">
            <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-on-surface" style="font-variation-settings:'FILL' 1;color:#0d8345">workspace_premium</span>
                <h3 class="font-headline-md text-on-surface">Cross-Category Active ✓</h3>
            </div>
            <p class="text-sm text-on-surface-variant">You've broken out of single-category shopping — you count toward the CCAR North Star this month. Keep the streak: a second purchase is what makes a category stick.</p>
        </div>` : `
        <div class="rounded-2xl p-5 border border-outline-variant/30 bg-surface-container-low">
            <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-on-surface-variant">rocket_launch</span>
                <h3 class="font-headline-md text-on-surface">Try your first new category</h3>
            </div>
            <p class="text-sm text-on-surface-variant mb-3">You mostly shop groceries. Trying one new category activates cross-category shopping for you.</p>
            <button onclick="showView('categories')" class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md font-bold text-sm">Explore categories</button>
        </div>`;

    const ordersBlock = myOrders.length ? myOrders.slice(0, 3).map(o => {
        const when = new Date(o.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return `
            <div class="flex items-center justify-between py-2.5 border-b border-outline-variant/15 last:border-0">
                <div class="min-w-0">
                    <div class="text-sm font-medium text-on-surface">Order ${o.orderId}</div>
                    <div class="text-[11px] text-on-surface-variant truncate">${o.items.map(i => i.name).join(', ')}</div>
                </div>
                <div class="text-right shrink-0 ml-3">
                    <div class="text-sm font-semibold text-on-surface">₹${o.total}</div>
                    <div class="text-[10px] text-on-surface-variant">${when}</div>
                </div>
            </div>`;
    }).join('') : `<p class="text-sm text-on-surface-variant py-2">No orders in this session yet.</p>`;

    el.innerHTML = `
        <!-- Identity header -->
        <div class="bg-surface rounded-3xl border border-outline-variant/20 shadow-sm p-6 mb-4 flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary-fixed/50 flex items-center justify-center text-3xl shrink-0">${currentProfile === 'user_b' ? '🔌' : '🛒'}</div>
            <div class="flex-1 min-w-0">
                <h2 class="font-headline-lg text-on-surface leading-tight">${u.persona}</h2>
                <p class="text-sm text-on-surface-variant">${u.user_id} · Habituated grocery regular</p>
                <div class="mt-1.5">
                    ${u.is_ccar_active
                        ? '<span class="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary-fixed/50 text-on-surface px-2.5 py-1 rounded-full">✓ Cross-category active</span>'
                        : '<span class="inline-flex items-center gap-1 text-[11px] font-semibold bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full">Grocery-only so far</span>'}
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            ${stat('shopping_bag', u.total_orders_90d, 'Orders (90 days)')}
            ${stat('grid_view', newCatsTried.length, 'New categories tried')}
            ${stat('hub', `${diversity.novel_categories_shown}:${diversity.novel_categories_clicked}`, 'Novel shown : clicked')}
            ${stat('workspace_premium', u.is_ccar_active ? 'Yes' : 'No', 'CCAR active')}
        </div>

        <!-- CCAR status -->
        <div class="mb-5">${ccarCard}</div>

        <!-- Categories shopped -->
        <div class="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-4">
            <h3 class="font-headline-md text-on-surface mb-3">Categories you shop</h3>
            <div class="flex flex-wrap gap-2">${catChips || '<span class="text-sm text-on-surface-variant">None yet</span>'}</div>
        </div>

        <!-- Recent orders -->
        <div class="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-5 mb-4">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-headline-md text-on-surface">Recent orders</h3>
                <button onclick="showView('orders')" class="text-primary text-sm font-semibold">View all</button>
            </div>
            ${ordersBlock}
        </div>
    `;
}

// ---- Notifications ----
function showNotifications() {
    const novelNow = ['electronics','personal_care_beauty','pharmacy_health','baby','home_cleaning','pet','intimate_personal']
        .filter(c => evaluateConfidenceGate(c).recommend);
    const msg = novelNow.length
        ? `${novelNow.length} new ${novelNow.length === 1 ? 'category' : 'categories'} to try, starting with ${trustData.category_signals[novelNow[0]].display_name}`
        : 'You are all caught up. No new category nudges right now.';
    showToast('🔔 ' + msg);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    if (typeof init === 'function') init();
});


