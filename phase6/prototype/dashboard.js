async function initDashboard() {
    try {
        const response = await fetch('../data/dashboard_metrics.json');
        const data = await response.json();
        
        // 1. Update KPIs
        document.getElementById('kpi-ccar').innerText = data.kpis.ccar.value;
        document.getElementById('kpi-diversity').innerText = data.kpis.recommendation_diversity.value;
        document.getElementById('kpi-latency').innerText = data.kpis.ai_inference_latency.value;
        
        // 2. Update Bars and Labels
        const categories = ['tech', 'home', 'baby', 'apparel', 'beauty'];
        categories.forEach(cat => {
            const val = data.abandonment_rates[cat];
            const bar = document.getElementById(`bar-${cat}`);
            const label = document.getElementById(`label-${cat}`);
            
            if (bar && label) {
                // Remove existing styling classes that might conflict
                bar.className = bar.className.replace(/h-\[\d+%\]/g, '');
                
                // Set inline height
                const visualHeight = Math.min(val * 2.5, 100);
                bar.style.height = `${visualHeight}%`;
                
                // Set text
                label.innerText = `${val}%`;

                // Handle Dynamic Alerts for high abandonment (> 25%)
                if (val > 25) {
                    // Update label styles
                    label.classList.add('text-error', 'font-bold');
                    label.classList.remove('text-outline-variant');
                    
                    // Update bar styles
                    bar.className = bar.className.replace(/bg-[\w-\/]+/g, ''); // Remove existing background
                    bar.classList.add('bg-error-container', 'shadow-[0_0_20px_rgba(255,218,214,0.3)]', 'border', 'border-error/50');
                    
                    // Inject Alert Pulse and Tooltip
                    const alertHtml = `
                        <div class="absolute -top-4 w-4 h-4 rounded-full bg-error/20 flex items-center justify-center animate-bounce">
                            <div class="w-2 h-2 rounded-full bg-error"></div>
                        </div>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 bg-inverse-surface border border-error/30 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 transform translate-y-2 group-hover:translate-y-0">
                            <div class="flex items-start gap-2">
                                <span class="material-symbols-outlined text-error text-[18px]">warning</span>
                                <div>
                                    <p class="font-label-sm text-label-sm text-surface-container-lowest font-bold">Alert Triggered</p>
                                    <p class="font-label-sm text-label-sm text-outline-variant mt-1 text-[11px] leading-tight">High Abandonment Rate (${val}%) detected.</p>
                                </div>
                            </div>
                            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-inverse-surface border-b border-r border-error/30 transform rotate-45"></div>
                        </div>
                    `;
                    bar.parentElement.insertAdjacentHTML('afterbegin', alertHtml);
                    
                } else {
                    // Normal state resets (in case of live updates)
                    label.classList.remove('text-error', 'font-bold');
                    label.classList.add('text-outline-variant');
                }
            }
        });
        
        console.log("Dashboard loaded and populated successfully!");
        
    } catch (e) {
        console.error("Failed to load dashboard metrics:", e);
    }
}

// ============================================================
// LIVE PROTOTYPE ACTIVITY — reads real orders placed in the Store UI
// (localStorage is shared across pages on the same origin), so the
// North Star CCAR visibly responds to the end-user journey.
// ============================================================
const CAT_NAMES = {
    electronics: 'Electronics', personal_care_beauty: 'Beauty & Personal Care',
    pharmacy_health: 'Pharmacy & Health', baby: 'Baby Care', home_cleaning: 'Home & Cleaning',
    pet: 'Pet Care', intimate_personal: 'Intimate Care'
};
const CAT_EMOJI = {
    electronics: '🔌', personal_care_beauty: '💄', pharmacy_health: '💊', baby: '🧸',
    home_cleaning: '🧹', pet: '🐕', intimate_personal: '🛡️'
};

function renderLiveActivity() {
    const orders = JSON.parse(localStorage.getItem('blinkit_orders') || '[]');
    const container = document.getElementById('liveActivity');
    if (!container) return;

    if (orders.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');

    const trials = orders.filter(o => o.novelCategories && o.novelCategories.length);
    const activated = new Set();
    trials.forEach(o => o.novelCategories.forEach(c => activated.add(c)));
    const trialTotals = trials.map(o => o.total);
    const avgTrial = trialTotals.length ? Math.round(trialTotals.reduce((a, b) => a + b, 0) / trialTotals.length) : 0;
    const totalSpend = orders.reduce((s, o) => s + o.total, 0);

    // Annotate the CCAR North Star card with the live delta.
    const ccarLive = document.getElementById('kpi-ccar-live');
    if (ccarLive && activated.size > 0) {
        ccarLive.textContent = `▲ ${activated.size} live activation${activated.size === 1 ? '' : 's'} this session`;
        ccarLive.classList.remove('hidden');
    }

    const stat = (icon, value, label) => `
        <div class="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-inverse-surface flex items-center justify-center border border-outline/10 shrink-0">
                <span class="material-symbols-outlined text-brand-yellow">${icon}</span>
            </div>
            <div>
                <div class="font-headline-md text-headline-md text-surface-container-lowest leading-none">${value}</div>
                <div class="font-label-sm text-label-sm text-outline-variant mt-1">${label}</div>
            </div>
        </div>`;

    const chips = [...activated].map(c =>
        `<span class="inline-flex items-center gap-1 text-label-sm bg-brand-yellow/10 text-brand-yellow px-3 py-1 rounded-full border border-brand-yellow/20">${CAT_EMOJI[c] || ''} ${CAT_NAMES[c] || c}</span>`
    ).join(' ');

    container.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 border border-brand-yellow/20 mb-2">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_8px_#F7D032] animate-pulse"></span>
                    <h2 class="font-headline-md text-headline-md text-surface-container-lowest">Live Prototype Activity</h2>
                </div>
                <button onclick="resetLiveActivity()" class="font-label-sm text-label-sm text-outline-variant hover:text-brand-yellow flex items-center gap-1 transition-colors">
                    <span class="material-symbols-outlined text-[16px]">restart_alt</span> Reset session
                </button>
            </div>
            <p class="font-label-sm text-label-sm text-outline-variant mb-4">These update in real time from orders placed in the Store UI — the North Star responding to the actual user journey.</p>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
                ${stat('shopping_bag', orders.length, 'Orders placed')}
                ${stat('rocket_launch', trials.length, 'New-category trials')}
                ${stat('workspace_premium', activated.size, 'Categories activated (CCAR)')}
                ${stat('payments', '₹' + avgTrial, 'Avg trial basket')}
            </div>
            ${activated.size > 0 ? `<div class="mt-4 flex flex-wrap gap-2">${chips}</div>` : ''}
        </div>`;
}

function resetLiveActivity() {
    localStorage.removeItem('blinkit_orders');
    const ccarLive = document.getElementById('kpi-ccar-live');
    if (ccarLive) ccarLive.classList.add('hidden');
    renderLiveActivity();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    renderLiveActivity();
});
