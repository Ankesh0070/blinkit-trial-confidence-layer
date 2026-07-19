// ============================================================
// Guardrail Metrics Dashboard — data-driven, minimal light theme.
// Renders KPIs, per-category abandonment, guardrails, and a LIVE
// panel computed from real orders placed in the Store UI.
// ============================================================

async function initDashboard() {
    let data;
    try {
        const res = await fetch('../data/dashboard_metrics.json');
        data = await res.json();
    } catch (e) {
        console.error("Failed to load dashboard metrics:", e);
        return;
    }
    renderKpis(data.kpis);
    renderCategoryChart(data.category_abandonment, data.abandonment_alert_threshold);
    renderGuardrails(data.guardrails);
    renderLiveActivity();
}

// ---- KPI cards ----
function renderKpis(kpis) {
    const row = document.getElementById('kpiRow');
    if (!row) return;
    row.innerHTML = kpis.map(k => {
        const trend = (k.trend === null || k.trend === undefined) ? '' : `
            <span class="inline-flex items-center gap-0.5 text-xs font-semibold ${k.trend >= 0 ? 'text-success' : 'text-error'}">
                <span class="material-symbols-outlined text-[15px]">${k.trend >= 0 ? 'trending_up' : 'trending_down'}</span>${k.trend >= 0 ? '+' : ''}${k.trend}%
            </span>`;
        return `
        <div class="card card-hover p-5 relative overflow-hidden ${k.star ? 'ring-1 ring-primary/40' : ''}">
            ${k.star ? '<div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>' : ''}
            <div class="flex items-center justify-between mb-3 relative">
                <div class="w-9 h-9 rounded-xl ${k.star ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">${k.icon}</span>
                </div>
                ${k.star ? '<span class="text-[10px] font-bold uppercase tracking-wider text-on-surface bg-primary-fixed/60 px-2 py-1 rounded-md">North Star</span>' : trend}
            </div>
            <div class="flex items-end gap-2 relative">
                <div class="font-display text-3xl font-bold text-on-surface leading-none">${k.value}</div>
                ${k.star ? trend : ''}
            </div>
            <div class="text-sm font-medium text-on-surface mt-2">${k.label}</div>
            <div class="text-[11px] text-on-surface-variant mt-0.5 leading-tight">${k.sublabel}</div>
            <div id="kpi-${k.id}-live" class="text-[11px] font-semibold text-on-surface mt-1.5 hidden"></div>
        </div>`;
    }).join('');
}

// ---- Category abandonment (horizontal bars, real categories) ----
function renderCategoryChart(cats, threshold) {
    const el = document.getElementById('categoryChart');
    if (!el) return;
    const max = Math.max(...cats.map(c => c.value), threshold + 5);
    let anyAlert = false;

    el.innerHTML = cats.map(c => {
        const alert = c.value > threshold;
        if (alert) anyAlert = true;
        const pct = Math.round((c.value / max) * 100);
        return `
        <div class="flex items-center gap-3">
            <div class="w-32 shrink-0 flex items-center gap-2 text-sm text-on-surface">
                <span>${c.emoji}</span><span class="truncate">${c.name}</span>
            </div>
            <div class="flex-1 bar-track h-2.5">
                <div class="bar-fill h-full ${alert ? 'bg-error' : 'bg-primary'}" style="width:${pct}%"></div>
            </div>
            <div class="w-14 shrink-0 text-right text-sm font-semibold ${alert ? 'text-error' : 'text-on-surface'}">
                ${c.value}%${alert ? ' <span class="material-symbols-outlined text-[14px] align-middle">warning</span>' : ''}
            </div>
        </div>`;
    }).join('');

    const note = document.getElementById('chartAlertNote');
    if (note) {
        const hot = cats.filter(c => c.value > threshold);
        if (anyAlert) {
            note.innerHTML = `<span class="material-symbols-outlined text-[16px]">warning</span><span><b>Alert:</b> ${hot.map(c => c.name).join(', ')} above the ${threshold}% threshold. Note: Baby has long replacement cycles — investigate whether this is genuine abandonment or a slow re-purchase cadence before acting.</span>`;
            note.classList.remove('hidden');
        } else {
            note.classList.add('hidden');
        }
    }
}

// ---- Guardrails ----
function renderGuardrails(items) {
    const el = document.getElementById('guardrails');
    if (!el || !items) return;
    el.innerHTML = items.map(g => `
        <div class="flex items-center justify-between">
            <div>
                <div class="text-sm font-medium text-on-surface">${g.label}</div>
                <div class="text-[11px] text-on-surface-variant">${g.note}</div>
            </div>
            <div class="flex items-center gap-1.5">
                <span class="font-display font-semibold text-on-surface">${g.value}</span>
                <span class="material-symbols-outlined text-[18px] ${g.status === 'ok' ? 'text-success' : 'text-error'}" style="font-variation-settings:'FILL' 1">${g.status === 'ok' ? 'check_circle' : 'error'}</span>
            </div>
        </div>`).join('');
}

// ============================================================
// LIVE PROTOTYPE ACTIVITY — real orders from the Store UI
// (localStorage shared across pages on the same origin).
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

    // Annotate the CCAR North Star card with the live delta.
    const ccarLive = document.getElementById('kpi-ccar-live');
    if (ccarLive && activated.size > 0) {
        ccarLive.textContent = `▲ ${activated.size} live activation${activated.size === 1 ? '' : 's'} this session`;
        ccarLive.classList.remove('hidden');
    }

    const stat = (icon, value, label) => `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white border border-outline-variant/60 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px] text-on-surface">${icon}</span>
            </div>
            <div>
                <div class="font-display text-xl font-bold text-on-surface leading-none">${value}</div>
                <div class="text-[11px] text-on-surface-variant mt-1">${label}</div>
            </div>
        </div>`;

    const chips = [...activated].map(c =>
        `<span class="inline-flex items-center gap-1 text-xs font-semibold bg-primary-fixed/50 text-on-surface px-3 py-1 rounded-full">${CAT_EMOJI[c] || ''} ${CAT_NAMES[c] || c}</span>`
    ).join(' ');

    container.innerHTML = `
        <div class="card p-6 border-primary/20">
            <div class="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <h3 class="font-display text-lg font-semibold text-on-surface">Live Prototype Activity</h3>
                </div>
                <button onclick="resetLiveActivity()" class="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
                    <span class="material-symbols-outlined text-[16px]">restart_alt</span> Reset session
                </button>
            </div>
            <p class="text-xs text-on-surface-variant mb-5">Updating in real time from orders placed in the Store UI — the North Star responding to the actual user journey.</p>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                ${stat('shopping_bag', orders.length, 'Orders placed')}
                ${stat('rocket_launch', trials.length, 'New-category trials')}
                ${stat('workspace_premium', activated.size, 'Categories activated (CCAR)')}
                ${stat('payments', '₹' + avgTrial, 'Avg trial basket')}
            </div>
            ${activated.size > 0 ? `<div class="mt-5 pt-4 border-t border-outline-variant/50 flex flex-wrap gap-2 items-center"><span class="text-xs text-on-surface-variant mr-1">Activated:</span>${chips}</div>` : ''}
        </div>`;
}

function resetLiveActivity() {
    localStorage.removeItem('blinkit_orders');
    const ccarLive = document.getElementById('kpi-ccar-live');
    if (ccarLive) ccarLive.classList.add('hidden');
    renderLiveActivity();
}

document.addEventListener('DOMContentLoaded', initDashboard);
