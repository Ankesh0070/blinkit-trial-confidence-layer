/* ============================================================
   Phase 3 — Personalisation & Confidence Gate
   Application Logic
   ============================================================ */

// ---- State ----
let currentCategory = 'electronics';
let showBadges = true;
let isQAVerified = false;
let trustData = null;
let densityFlags = null;
let userProfiles = null;
let currentUser = null;

// Metrics Simulation
let metrics = {
    trials: 0,
    repeatPurchases: 0,
    abandonments: 0
};

// Theme Mapping
const THEMES = {
    'electronics': { color: '#4d9ef5', rgb: '77, 158, 245' },
    'personal_care_beauty': { color: '#d55bbd', rgb: '213, 91, 189' },
    'pharmacy_health': { color: '#26c255', rgb: '38, 194, 85' }
};

// Emoji Mapping
const EMOJIS = {
    'earbuds': '🎧', 'powerbank': '🔋', 'cable': '🔌', 'headphones': '🎧', 'led': '💡', 'adapter': '🔌',
    'moisturizer': '🧴', 'concealer': '💄', 'face_wash': '🫧', 'shampoo': '🧴', 'razor': '🪒', 'kajal': '👁️',
    'tablets': '💊', 'antiseptic': '⚕️', 'spray': '🩹', 'ors': '💧', 'vaporub': '🤧', 'bandaid': '🩹'
};

// ---- Init ----
async function init() {
    try {
        const trustRes = await fetch('../data/trust_signals_automated.json');
        trustData = await trustRes.json();
        
        const densityRes = await fetch('../data/category_density_flags.json');
        densityFlags = await densityRes.json();
        
        const userRes = await fetch('../data/user_profiles.json');
        userProfiles = await userRes.json();
        
        switchUser('user_a'); // Default to Cold Start User
    } catch (e) {
        console.error("Error loading data:", e);
        document.getElementById('productGrid').innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center;">Error loading pipeline data. Ensure you are running a local server.</div>';
    }
}

// ---- User Switcher & Personalisation Logic ----
function switchUser(userId) {
    currentUser = userProfiles.users[userId];
    
    // Evaluate Confidence Gate for all categories to build the Rec Strip
    renderRecommendationStrip();
    
    // Re-render the category nav and current category products based on the new user's history
    renderCategoryNav();
    selectCategory(currentCategory);
    updateMetricsUI();
}

function evaluateConfidenceGate(categoryId) {
    const flag = densityFlags.categories[categoryId]?.density_flag || 'sparse';
    
    // Check 1: Data Density
    if (flag === 'sparse') {
        return { show_ai_signals: false, recommend: false, reason: "sparse_category" };
    }

    // Check 2: Has the user already purchased this in the last 90 days?
    const hasPurchased = currentUser.categories_purchased_90d.includes(categoryId);
    if (hasPurchased) {
        return { show_ai_signals: false, recommend: false, reason: "already_habituated_90d" };
    }

    // Check 3: Does the user have ANY cross-category history? (Cold Start)
    const hasCrossCategoryHistory = currentUser.categories_purchased_90d.length > 1;
    if (!hasCrossCategoryHistory) {
        return { show_ai_signals: true, recommend: true, is_novel: true, reason: "cold_start_recommendation" };
    }

    // Default: It's a new, dense category for a user who already buys across categories
    return { show_ai_signals: true, recommend: true, is_novel: true, reason: "personalised_trial" };
}

function renderRecommendationStrip() {
    const strip = document.getElementById('recStrip');
    strip.innerHTML = '';
    
    const categoriesToEvaluate = ['electronics', 'personal_care_beauty', 'pharmacy_health'];
    const emojis = { 'electronics': '🔌', 'personal_care_beauty': '💄', 'pharmacy_health': '💊' };
    
    categoriesToEvaluate.forEach(catId => {
        const gateStatus = evaluateConfidenceGate(catId);
        
        if (gateStatus.recommend) {
            const catData = trustData.category_signals[catId];
            const card = document.createElement('div');
            card.className = `rec-card ${gateStatus.is_novel ? 'novel' : ''}`;
            card.onclick = () => selectCategory(catId);
            
            card.innerHTML = `
                ${gateStatus.is_novel ? '<span class="rec-badge">NEW FOR YOU</span>' : ''}
                <div class="rec-icon">${emojis[catId]}</div>
                <div class="rec-title">Try ${catData.display_name}</div>
            `;
            strip.appendChild(card);
        }
    });

    if (strip.innerHTML === '') {
        strip.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-muted);">No new recommendations. You have explored all dense categories!</div>';
    }
}


// ---- UI Rendering ----
function renderCategoryNav() {
    const nav = document.getElementById('categoryNav');
    nav.innerHTML = '';
    
    const categories = ['electronics', 'personal_care_beauty', 'pharmacy_health'];
    const emojis = { 'electronics': '🔌', 'personal_care_beauty': '💄', 'pharmacy_health': '💊' };
    
    categories.forEach(catId => {
        const catData = trustData.category_signals[catId];
        const flag = densityFlags.categories[catId].density_flag;
        
        const pill = document.createElement('div');
        pill.className = `cat-pill ${currentCategory === catId ? 'active' : ''}`;
        pill.onclick = () => selectCategory(catId);
        
        pill.innerHTML = `
            <span>${emojis[catId]}</span>
            <span>${catData.display_name}</span>
            <div class="density-dot ${flag}" title="${flag === 'dense' ? 'Dense Data' : 'Sparse Data'}"></div>
        `;
        nav.appendChild(pill);
    });
}

function selectCategory(categoryId) {
    currentCategory = categoryId;
    
    // Update theme
    const theme = THEMES[categoryId] || THEMES['electronics'];
    document.documentElement.style.setProperty('--active-theme', theme.color);
    document.documentElement.style.setProperty('--active-theme-rgb', theme.rgb);
    
    // Update active state in nav
    document.querySelectorAll('.cat-pill').forEach(pill => {
        pill.classList.remove('active');
        if(pill.innerText.includes(trustData.category_signals[categoryId].display_name)) {
            pill.classList.add('active');
        }
    });
    
    // Update Header
    document.getElementById('pageTitle').textContent = trustData.category_signals[categoryId].display_name;
    
    // Handle Caveats & Fallbacks
    const caveatEl = document.getElementById('pharmacyCaveat');
    const fallbackEl = document.getElementById('sparseFallback');
    
    if (categoryId === 'pharmacy_health') {
        caveatEl.style.display = 'flex';
    } else {
        caveatEl.style.display = 'none';
    }
    
    if (densityFlags.categories[categoryId].density_flag === 'sparse') {
        fallbackEl.style.display = 'flex';
        document.getElementById('mentionCount').textContent = densityFlags.categories[categoryId].mentions;
        document.getElementById('productGrid').innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text-muted);">Showing generic fallback products. AI signals disabled.</div>';
    } else {
        fallbackEl.style.display = 'none';
        renderProducts();
    }
}

function renderProducts() {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";
    
    const products = trustData.products.filter(p => p.category === currentCategory);
    
    // ** CONFIDENCE GATE **
    // Check if we should show the badges for this specific user in this specific category
    const gateStatus = evaluateConfidenceGate(currentCategory);
    const allowBadgesForUser = gateStatus.show_ai_signals;
    
    products.forEach(product => {
        const discount = Math.round((1 - product.price / product.mrp) * 100);
        const card = document.createElement("div");
        card.className = "product-card";
        card.onclick = () => openModal(product, allowBadgesForUser);

        let trustBadgeHTML = "";
        
        // Show badge if A/B toggle is ON AND the Confidence Gate allows it for this user
        if (showBadges && allowBadgesForUser) {
            const trust = product.trust_signals;
            trustBadgeHTML = `
                <div class="trust-badge" onclick="event.stopPropagation(); openModal(${JSON.stringify(product).replace(/"/g, '&quot;')}, ${allowBadgesForUser})">
                    <div class="trust-badge-header">
                        <span class="trust-badge-title">Buyer Verified</span>
                        <span class="pipeline-ver">v${trust.pipeline_version}</span>
                    </div>
                    <div class="trust-badge-summary">
                        <span class="trust-rating-text">${trust.avgRating || trust.avg_rating} <span class="star-icon">★</span></span>
                        <span class="trust-reviews-count">(${trust.total_ratings})</span>
                        <span class="trust-repeat">${trust.repeat_purchase_pct}% reorder</span>
                    </div>
                </div>`;
        }

        card.innerHTML = `
            <div class="product-image">
                <span>${EMOJIS[product.subcategory] || '📦'}</span>
                ${discount > 10 ? `<span style="position:absolute; top:8px; left:8px; background:var(--active-theme); color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">${discount}% OFF</span>` : ""}
            </div>
            <div class="product-info">
                <div class="product-name">${product.product_name}</div>
                <div class="product-pricing">
                    <span class="price-current">₹${product.price}</span>
                    <span class="price-mrp">₹${product.mrp}</span>
                </div>
            </div>
            ${trustBadgeHTML}
            <div class="add-to-cart-row">
                <button class="add-btn" onclick="event.stopPropagation(); simulatePurchase()">ADD</button>
            </div>`;

        grid.appendChild(card);
    });
}

function renderSentimentIcon(sentiment) {
    const map = { positive: "👍", mixed: "⚖️", negative: "👎" };
    return map[sentiment] || "•";
}

// ---- Modal ----
function openModal(product, allowBadgesForUser) {
    if (typeof product === "string") product = JSON.parse(product);

    const overlay = document.getElementById("modalOverlay");
    const content = document.getElementById("modalContent");
    const discount = Math.round((1 - product.price / product.mrp) * 100);

    let trustDetailHTML = "";
    if (showBadges && allowBadgesForUser) {
        const trust = product.trust_signals;
        
        const highlightsHTML = trust.review_highlights.map(h => `
            <div class="review-item">
                <div class="review-sentiment">${renderSentimentIcon(h.sentiment)}</div>
                <div style="flex: 1;">
                    <div class="review-theme">
                        ${h.theme.replace(/_/g, ' ')} 
                        <span style="font-size:10px; color:var(--text-muted); font-weight:500;">· ${h.count} mentions</span>
                        ${!isQAVerified ? `<span class="confidence-pill" style="color:${h.confidence > 0.9 ? 'var(--theme-pharmacy)' : 'var(--blinkit-yellow)'}">Conf: ${(h.confidence*100).toFixed(0)}%</span>` : ''}
                    </div>
                    <div class="review-quote">"${h.sample_quote}"</div>
                </div>
            </div>`).join("");

        trustDetailHTML = `
            <div class="trust-detail">
                <div class="trust-detail-header">
                    <span class="trust-detail-title">Pipeline Insights</span>
                    <span style="font-size:10px; color:var(--text-muted); margin-left:auto;">
                        Based on ${trust.total_reviews} verified reviews
                    </span>
                </div>
                <div class="trust-stats-row">
                    <div class="trust-stat">
                        <div class="trust-stat-value" style="color:var(--blinkit-yellow)">${trust.avgRating || trust.avg_rating}</div>
                        <div class="trust-stat-label">Avg Rating</div>
                    </div>
                    <div class="trust-stat">
                        <div class="trust-stat-value">${trust.total_ratings}</div>
                        <div class="trust-stat-label">Total Ratings</div>
                    </div>
                    <div class="trust-stat">
                        <div class="trust-stat-value" style="color:var(--active-theme)">${trust.repeat_purchase_pct}%</div>
                        <div class="trust-stat-label">Reorder Rate</div>
                    </div>
                </div>
                <div>
                    <div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase;">Extracted Themes</div>
                    ${highlightsHTML}
                </div>
                <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.04); font-size:9px; color:var(--text-muted); display:flex; justify-content:space-between;">
                    <span>Source: ${trust.data_source}</span>
                    <span>v${trust.pipeline_version}</span>
                </div>
            </div>`;
    }

    content.innerHTML = `
        <div class="modal-image"><span style="font-size:72px">${EMOJIS[product.subcategory] || '📦'}</span></div>
        <div class="modal-body">
            <div style="font-size:18px; font-weight:700; line-height:1.3;">${product.product_name}</div>
            <div style="display:flex; align-items:baseline; gap:8px; margin-top:8px;">
                <span style="font-size:20px; font-weight:800;">₹${product.price}</span>
                <span style="font-size:14px; color:var(--text-muted); text-decoration:line-through;">₹${product.mrp}</span>
                <span style="font-size:13px; font-weight:700; color:var(--active-theme);">${discount}% off</span>
            </div>
            ${trustDetailHTML}
            <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border-subtle);">
                <button style="width:100%; padding:14px; background:var(--blinkit-green); color:#fff; border:none; border-radius:var(--radius-md); font-size:15px; font-weight:700; cursor:pointer;" onclick="simulatePurchase(); closeModal();">Add to Cart — ₹${product.price}</button>
            </div>
        </div>`;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("modalOverlay").classList.remove("active");
    document.body.style.overflow = "";
}

// ---- Interactions & Metrics Simulation ----
function toggleVariant() {
    showBadges = document.getElementById('abToggleCheckbox').checked;
    document.getElementById('abToggleLabel').textContent = showBadges ? 'Badge Active' : 'Control (No Badge)';
    renderProducts();
}

function toggleQAStatus() {
    isQAVerified = !isQAVerified;
    const badge = document.getElementById('qaBadge');
    
    if (isQAVerified) {
        badge.textContent = 'QA Verified';
        badge.className = 'qa-badge verified';
    } else {
        badge.textContent = 'QA Pending';
        badge.className = 'qa-badge pending';
    }
}

function simulatePurchase() {
    metrics.trials++;
    
    // Simulate Phase 3 metrics logic
    if (Math.random() > 0.75) metrics.repeatPurchases++;
    
    updateMetricsUI();
}

function updateMetricsUI() {
    // CCAR logic
    let ccarValue = "0%";
    if (currentUser) {
        if (currentUser.is_ccar_active) {
            ccarValue = "Active (≥1 cross-cat)";
        } else {
            ccarValue = "Inactive";
        }
    }
    
    // Diversity logic
    let diversityValue = "0%";
    if (currentUser && currentUser.diversity_ratio) {
        const shown = currentUser.diversity_ratio.novel_categories_shown;
        const clicked = currentUser.diversity_ratio.novel_categories_clicked;
        if (shown > 0) {
            diversityValue = `${clicked} accepted / ${shown} shown (${Math.round((clicked/shown)*100)}%)`;
        }
    }
    
    document.getElementById('metricCCAR').textContent = ccarValue;
    document.getElementById('metricDiversity').textContent = diversityValue;
    
    const repeatRate = (metrics.trials > 0) ? ((metrics.repeatPurchases / metrics.trials) * 100).toFixed(1) + "%" : "0%";
    document.getElementById('metricRepeat').textContent = repeatRate;
    
    // Highlight if diversity is 0
    const divCard = document.getElementById('metricDiversity').parentElement;
    if (currentUser && currentUser.diversity_ratio && currentUser.diversity_ratio.novel_categories_shown === 0) {
        divCard.style.borderLeftColor = 'var(--blinkit-yellow)';
        divCard.querySelector('.metric-note').textContent = 'WARNING: Narrowing loop detected';
        divCard.querySelector('.metric-note').style.color = 'var(--blinkit-yellow)';
    } else {
        divCard.style.borderLeftColor = 'var(--theme-electronics)';
        divCard.querySelector('.metric-note').textContent = 'Novel categories shown vs clicked';
        divCard.querySelector('.metric-note').style.color = 'var(--text-secondary)';
    }
}

function toggleMetrics() {
    document.getElementById("metricsBody").classList.toggle("active");
}

// Run init
document.addEventListener("DOMContentLoaded", init);
