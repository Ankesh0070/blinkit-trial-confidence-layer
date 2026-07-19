/* ============================================================
   Phase 1 — Trial Confidence Badge Prototype
   Application Logic
   ============================================================ */

// ---- Curated Trust Signals (Product Analyst Output) ----
// Per ImplementationPlan.md Phase 1: "all pulled manually from
// Blinkit's first-party review and transaction data by a product
// analyst, not computed by the Gemini pipeline"
const PRODUCTS = [
    {
        id: "ELEC-001",
        name: "boAt Airdopes 141 TWS Earbuds",
        price: 1299, mrp: 2990,
        emoji: "🎧",
        trust: {
            avgRating: 3.8, totalRatings: 142, totalReviews: 89,
            repeatPurchasePct: 12,
            highlights: [
                { theme: "Delivery Speed", sentiment: "positive", count: 34, quote: "Delivered in 12 minutes, packaging was intact" },
                { theme: "Product Quality", sentiment: "mixed", count: 28, quote: "Sound quality is decent for the price, bass could be better" },
                { theme: "Return Experience", sentiment: "negative", count: 18, quote: "Return process took 4 days and multiple follow-ups with support" }
            ],
            confidence: "high"
        }
    },
    {
        id: "ELEC-002",
        name: "Ambrane 10000mAh Power Bank",
        price: 699, mrp: 1499,
        emoji: "🔋",
        trust: {
            avgRating: 4.1, totalRatings: 203, totalReviews: 117,
            repeatPurchasePct: 8,
            highlights: [
                { theme: "Product Quality", sentiment: "positive", count: 52, quote: "Charges my phone twice, compact size for travel" },
                { theme: "Delivery Speed", sentiment: "positive", count: 41, quote: "Got it in 10 mins when I needed it urgently at office" },
                { theme: "Packaging", sentiment: "positive", count: 19, quote: "Came in original sealed box, no tampering" }
            ],
            confidence: "high"
        }
    },
    {
        id: "ELEC-003",
        name: "USB-C Fast Charging Cable (1m)",
        price: 199, mrp: 499,
        emoji: "🔌",
        trust: {
            avgRating: 3.4, totalRatings: 87, totalReviews: 52,
            repeatPurchasePct: 22,
            highlights: [
                { theme: "Convenience", sentiment: "positive", count: 21, quote: "Needed a cable urgently, got it in 8 minutes — lifesaver" },
                { theme: "Durability", sentiment: "mixed", count: 15, quote: "Works fine but feels cheaper than Amazon cables at same price" },
                { theme: "Compatibility", sentiment: "negative", count: 9, quote: "Did not support fast charging on my Samsung despite listing saying so" }
            ],
            confidence: "high"
        }
    },
    {
        id: "ELEC-004",
        name: "boAt Rockerz 450 Headphones",
        price: 1499, mrp: 3990,
        emoji: "🎧",
        trust: {
            avgRating: 3.9, totalRatings: 98, totalReviews: 61,
            repeatPurchasePct: 6,
            highlights: [
                { theme: "Sound Quality", sentiment: "positive", count: 31, quote: "Great sound quality, comfortable for long use" },
                { theme: "Delivery Speed", sentiment: "positive", count: 22, quote: "Ordered at 11pm, delivered by 11:15pm — impressive" },
                { theme: "Packaging", sentiment: "mixed", count: 8, quote: "Box was slightly dented but product was fine inside" }
            ],
            confidence: "high"
        }
    },
    {
        id: "ELEC-005",
        name: "LED Desk Lamp (Rechargeable)",
        price: 449, mrp: 999,
        emoji: "💡",
        trust: {
            avgRating: 4.2, totalRatings: 76, totalReviews: 43,
            repeatPurchasePct: 15,
            highlights: [
                { theme: "Product Quality", sentiment: "positive", count: 28, quote: "Three brightness levels, battery lasts 6+ hours" },
                { theme: "Value for Money", sentiment: "positive", count: 18, quote: "Same lamp is ₹100 more on Amazon, instant delivery bonus" },
                { theme: "Delivery Speed", sentiment: "positive", count: 12, quote: "Emergency purchase during power cut, arrived in 9 mins" }
            ],
            confidence: "high"
        }
    },
    {
        id: "ELEC-006",
        name: "20W USB-C Adapter (Fast Charger)",
        price: 599, mrp: 1290,
        emoji: "🔌",
        trust: {
            avgRating: 3.6, totalRatings: 64, totalReviews: 38,
            repeatPurchasePct: 11,
            highlights: [
                { theme: "Convenience", sentiment: "positive", count: 19, quote: "Lost my charger, ordered this at midnight and got it immediately" },
                { theme: "Product Quality", sentiment: "mixed", count: 12, quote: "Charges slower than original Apple adapter but works" },
                { theme: "Return Experience", sentiment: "negative", count: 5, quote: "Stopped working in 2 weeks, return process was frustrating" }
            ],
            confidence: "medium"
        }
    }
];

// ---- State ----
let showBadges = true; // A/B variant: true = treatment, false = control
let cart = [];
let metrics = {
    impressions: 0,
    clicks: 0,
    addToCart: 0
};

// ---- Render ----
function renderProducts() {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";
    metrics.impressions = 0;

    PRODUCTS.forEach(product => {
        const discount = Math.round((1 - product.price / product.mrp) * 100);
        const card = document.createElement("div");
        card.className = "product-card";
        card.onclick = () => openModal(product);

        let trustBadgeHTML = "";
        if (showBadges) {
            metrics.impressions++;
            const stars = renderStars(product.trust.avgRating);
            trustBadgeHTML = `
                <div class="trust-badge" onclick="event.stopPropagation(); metrics.clicks++; updateMetrics(); openModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <div class="trust-badge-header">
                        <span class="trust-badge-icon">✓</span>
                        <span class="trust-badge-title">Buyer Verified</span>
                    </div>
                    <div class="trust-badge-summary">
                        <div class="trust-stars">${stars}</div>
                        <span class="trust-rating-text">${product.trust.avgRating}</span>
                        <span class="trust-reviews-count">(${product.trust.totalRatings})</span>
                        <span class="trust-repeat">${product.trust.repeatPurchasePct}% reorder</span>
                    </div>
                </div>`;
        }

        card.innerHTML = `
            <div class="product-image">
                <span>${product.emoji}</span>
                ${discount > 30 ? `<span class="discount-tag">${discount}% OFF</span>` : ""}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-pricing">
                    <span class="price-current">₹${product.price}</span>
                    <span class="price-mrp">₹${product.mrp}</span>
                </div>
            </div>
            ${trustBadgeHTML}
            <div class="add-to-cart-row">
                <button class="add-btn" onclick="event.stopPropagation(); addToCart('${product.id}', ${product.price})">ADD</button>
            </div>`;

        grid.appendChild(card);
    });
    updateMetrics();
}

function renderStars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<span class="star filled">★</span>';
        } else if (i - rating < 1 && i - rating > 0) {
            html += '<span class="star filled">★</span>';
        } else {
            html += '<span class="star empty">★</span>';
        }
    }
    return html;
}

function renderSentimentIcon(sentiment) {
    const map = { positive: "👍", mixed: "⚖️", negative: "👎" };
    return map[sentiment] || "•";
}

// ---- Modal ----
function openModal(product) {
    if (typeof product === "string") product = JSON.parse(product);

    const overlay = document.getElementById("modalOverlay");
    const content = document.getElementById("modalContent");
    const discount = Math.round((1 - product.price / product.mrp) * 100);

    let trustDetailHTML = "";
    if (showBadges) {
        const highlightsHTML = product.trust.highlights.map(h => `
            <div class="review-item">
                <div class="review-sentiment ${h.sentiment}">${renderSentimentIcon(h.sentiment)}</div>
                <div class="review-text-group">
                    <div class="review-theme">${h.theme} <span class="review-theme-count">· ${h.count} mentions</span></div>
                    <div class="review-quote">"${h.quote}"</div>
                </div>
            </div>`).join("");

        trustDetailHTML = `
            <div class="trust-detail">
                <div class="trust-detail-header">
                    <span>✓</span>
                    <span class="trust-detail-title">Buyer Verified Insights</span>
                    <span class="trust-detail-subtitle">from ${product.trust.totalReviews} reviews</span>
                </div>
                <div class="trust-stats-row">
                    <div class="trust-stat">
                        <div class="trust-stat-value yellow">${product.trust.avgRating}</div>
                        <div class="trust-stat-label">Avg Rating</div>
                    </div>
                    <div class="trust-stat">
                        <div class="trust-stat-value">${product.trust.totalRatings}</div>
                        <div class="trust-stat-label">Ratings</div>
                    </div>
                    <div class="trust-stat">
                        <div class="trust-stat-value green">${product.trust.repeatPurchasePct}%</div>
                        <div class="trust-stat-label">Reorder</div>
                    </div>
                </div>
                <div class="review-highlights">
                    <div class="review-highlight-title">What buyers say</div>
                    ${highlightsHTML}
                </div>
                <div class="trust-source-note">
                    🔒 Based on verified purchase data · Not AI-generated
                </div>
            </div>`;
    }

    content.innerHTML = `
        <div class="modal-image"><span style="font-size:72px">${product.emoji}</span></div>
        <div class="modal-body">
            <div class="modal-product-name">${product.name}</div>
            <div class="modal-pricing">
                <span class="modal-price">₹${product.price}</span>
                <span class="modal-mrp">₹${product.mrp}</span>
                <span class="modal-discount">${discount}% off</span>
            </div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:6px;">
                <span style="font-size:12px;color:var(--accent-green);font-weight:600;">⚡ Delivery in 10 min</span>
            </div>
            ${trustDetailHTML}
            <div class="modal-add-section">
                <button class="modal-add-btn" onclick="addToCart('${product.id}', ${product.price}); closeModal();">Add to Cart — ₹${product.price}</button>
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

// ---- Cart ----
function addToCart(productId, price) {
    cart.push({ id: productId, price });
    metrics.addToCart++;
    updateMetrics();
    updateCartUI();
}

function updateCartUI() {
    const footer = document.getElementById("cartFooter");
    if (cart.length === 0) {
        footer.style.display = "none";
        return;
    }
    footer.style.display = "block";
    document.getElementById("cartCount").textContent = `${cart.length} item${cart.length > 1 ? "s" : ""}`;
    document.getElementById("cartTotal").textContent = `₹${cart.reduce((s, c) => s + c.price, 0)}`;
}

// ---- A/B Toggle ----
function toggleVariant() {
    showBadges = !showBadges;
    const btn = document.querySelector(".toggle-variant");
    const label = document.querySelector(".ab-indicator-inner strong");
    if (showBadges) {
        btn.textContent = "Switch to Control";
        label.textContent = "Badge Variant";
    } else {
        btn.textContent = "Switch to Treatment";
        label.textContent = "Control (No Badge)";
    }
    renderProducts();
}

// ---- Metrics ----
function updateMetrics() {
    document.getElementById("metricImpressions").textContent = metrics.impressions;
    document.getElementById("metricClicks").textContent = metrics.clicks;
    document.getElementById("metricAddToCart").textContent = metrics.addToCart;
    const rate = metrics.impressions > 0
        ? ((metrics.addToCart / metrics.impressions) * 100).toFixed(1) + "%"
        : "0%";
    document.getElementById("metricConversion").textContent = rate;
}

function toggleMetrics() {
    document.getElementById("metricsBody").classList.toggle("active");
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
});
