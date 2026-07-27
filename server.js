const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env. Resolve relative to this file (not
// process.cwd()) so it still finds the key when launched from a different
// working directory.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Diagnostic: reports WHICH keys are configured (booleans only — never the values).
app.get('/api/health', (req, res) => res.json({
    groq_configured: !!process.env.GROQ_API_KEY,
    gemini_configured: !!process.env.GEMINI_API_KEY,
    env_var_names_seen: Object.keys(process.env).filter(k => /GROQ|GEMINI|API/i.test(k))
}));

// Open the bare URL straight into the store UI.
app.get('/', (req, res) => res.redirect('/prototype/index.html'));

// Serve the static frontend files from Phase 6.
// HTML / JS / JSON are revalidated every load so catalog + UI updates show
// immediately (no stale "Explore broken / only grocery" from a cached page);
// images may be cached since their URLs are version-stamped.
app.use(express.static(path.join(__dirname, 'phase6'), {
    setHeaders: (res, filePath) => {
        if (/\.(html|js|json)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// Example Backend API Endpoint leveraging the API keys
app.post('/api/analyze-review', async (req, res) => {
    const { reviewText, provider = 'gemini' } = req.body;
    
    if (!reviewText) return res.status(400).json({ error: "No review text provided" });

    try {
        let resultText = "";
        
        if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
            const prompt = `Analyze this e-commerce review: "${reviewText}". Respond ONLY with a JSON object in this format: {"theme": "short summary theme", "sentiment": "positive" or "negative" or "neutral", "confidence": 0.0-1.0}`;
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            resultText = data.candidates[0].content.parts[0].text;

        } else if (provider === 'groq' && process.env.GROQ_API_KEY) {
            const prompt = `Analyze this e-commerce review: "${reviewText}". Respond ONLY with a JSON object in this format: {"theme": "short summary theme", "sentiment": "positive" or "negative" or "neutral", "confidence": 0.0-1.0}`;
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            resultText = data.choices[0].message.content;

        } else {
            return res.status(500).json({ error: "Selected provider API key not configured or invalid provider." });
        }
        
        // Clean JSON formatting if LLM added markdown block
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJson);
        
        res.json({ success: true, analysis });
    } catch (e) {
        console.error("AI Analysis Error:", e);
        res.status(500).json({ error: "Failed to analyze review: " + e.message });
    }
});

// Product Discovery Assistant chat endpoint (Groq).
// Multilingual: detects whatever language/script the user's latest message is
// written in (any Indian language, or Hinglish) and replies in kind. Mirrors
// server.py so the whole app runs on Node alone (no Python needed).

// All 22 languages listed in the Eighth Schedule of the Indian Constitution,
// with their native/customary script noted so the model doesn't default to
// the wrong one (e.g. Santali -> Ol Chiki, not Devanagari).
const INDIAN_LANGUAGES = [
    'Hindi (Devanagari)', 'Bengali (Bengali script)', 'Marathi (Devanagari)', 'Telugu (Telugu script)',
    'Tamil (Tamil script)', 'Gujarati (Gujarati script)', 'Urdu (Perso-Arabic/Nastaliq script)',
    'Kannada (Kannada script)', 'Odia (Odia script)', 'Malayalam (Malayalam script)', 'Punjabi (Gurmukhi script)',
    'Assamese (Bengali-Assamese script)', 'Maithili (Devanagari)', 'Sanskrit (Devanagari)',
    'Nepali (Devanagari)', 'Konkani (Devanagari)', 'Sindhi (Devanagari or Perso-Arabic)',
    'Dogri (Devanagari)', 'Kashmiri (Perso-Arabic or Devanagari)', 'Manipuri/Meitei (Meitei Mayek or Bengali script)',
    'Santali (Ol Chiki script, or Devanagari/Bengali when the user types it that way)', 'Bodo (Devanagari)'
];

const CHAT_CATEGORY_IDS = [
    'electronics', 'personal_care_beauty', 'pharmacy_health', 'baby', 'home_cleaning', 'pet', 'intimate_personal',
    'books', 'jewellery', 'spiritual', 'stationery_games', 'supplements', 'sports_outdoor',
    'vegetables_fruits', 'dairy_bread_eggs', 'atta_rice_dal', 'masala_oil', 'munchies',
    'cold_drinks_juices', 'tea_coffee', 'biscuits_bakery', 'sweet_tooth', 'instant_frozen'
];

// Deterministic script detection. The model was silently defaulting to Hindi
// for Tamil/Bengali/etc. inputs, so we hard-detect the script in Node from
// Unicode ranges and inject the answer directly into the prompt as an
// authoritative fact — the model no longer gets to guess.
const SCRIPT_RANGES = [
    // [regex, script name, default language, sibling languages sharing the script]
    { re: /[஀-௿]/, script: 'Tamil',       lang: 'Tamil',       siblings: [] },
    { re: /[ঀ-৿]/, script: 'Bengali',     lang: 'Bengali',     siblings: ['Assamese', 'Manipuri (Meitei)'] },
    { re: /[਀-੿]/, script: 'Gurmukhi',    lang: 'Punjabi',     siblings: [] },
    { re: /[઀-૿]/, script: 'Gujarati',    lang: 'Gujarati',    siblings: [] },
    { re: /[଀-୿]/, script: 'Odia',        lang: 'Odia',        siblings: [] },
    { re: /[ఀ-౿]/, script: 'Telugu',      lang: 'Telugu',      siblings: [] },
    { re: /[ಀ-೿]/, script: 'Kannada',     lang: 'Kannada',     siblings: [] },
    { re: /[ഀ-ൿ]/, script: 'Malayalam',   lang: 'Malayalam',   siblings: [] },
    { re: /[᱐-᱿]/, script: 'Ol Chiki',    lang: 'Santali',     siblings: [] },
    { re: /[ꯀ-꯿]/, script: 'Meitei Mayek', lang: 'Manipuri (Meitei)', siblings: [] },
    { re: /[؀-ۿ]/, script: 'Perso-Arabic', lang: 'Urdu',       siblings: ['Kashmiri', 'Sindhi'] },
    { re: /[ऀ-ॿ]/, script: 'Devanagari',  lang: 'Hindi',       siblings: ['Marathi', 'Nepali', 'Sanskrit', 'Bodo', 'Dogri', 'Maithili', 'Konkani', 'Sindhi'] }
];

function detectLanguage(text) {
    if (!text) return { script: 'Latin', lang: 'English', siblings: ['Hinglish'], isRoman: true };
    // Count chars per script range; the range with the most chars wins.
    // Ties break by SCRIPT_RANGES order (non-Devanagari scripts before Devanagari,
    // so a stray "namaste" written in Hindi doesn't override a Tamil message).
    let winner = null, winnerCount = 0;
    for (const r of SCRIPT_RANGES) {
        const m = text.match(new RegExp(r.re.source, 'g'));
        const c = m ? m.length : 0;
        if (c > winnerCount) { winner = r; winnerCount = c; }
    }
    if (winner) return { script: winner.script, lang: winner.lang, siblings: winner.siblings, isRoman: false };
    // Pure Latin/ASCII — could be English or Hinglish; let the model decide from vocab.
    return { script: 'Latin', lang: 'English or Hinglish', siblings: [], isRoman: true };
}

function buildChatSystemPrompt(catalogFacts, userLastMessage) {
    const detected = detectLanguage(userLastMessage || '');
    const siblingHint = detected.siblings.length
        ? ` (or, if the user's vocabulary makes it clear, one of the other languages that share this script: ${detected.siblings.join(', ')})`
        : '';
    const languageBlock = detected.isRoman
        ? "🌐 SCRIPT DETECTED (deterministic, not your guess): the user is writing in the LATIN/ROMAN alphabet.\n" +
          "→ If the vocabulary is English (e.g. \"I want shampoo\"), reply in ENGLISH.\n" +
          "→ If the vocabulary is Hinglish (Hindi/regional words in Roman letters, e.g. \"mujhe chips chahiye\"), reply in HINGLISH using Roman letters.\n" +
          "→ NEVER switch to Devanagari, Tamil, Bengali or any non-Latin script when the user typed in Roman letters.\n\n"
        : `🌐 SCRIPT DETECTED (deterministic, not your guess): the user is writing in the ${detected.script} script.\n` +
          `→ You MUST reply in ${detected.lang}${siblingHint}, using the ${detected.script} script — nothing else.\n` +
          `→ DO NOT reply in Hindi or any other language just because ${detected.lang} feels similar. The user typed ${detected.script}; you reply in ${detected.script}.\n` +
          `→ If you cannot write fluently in ${detected.lang}, still respond in the ${detected.script} script — do not silently switch to Hindi/Devanagari.\n\n`;

    const factsBlock = Array.isArray(catalogFacts) && catalogFacts.length
        ? "MATCHED PRODUCTS IN CATALOG (these are real — state them accurately if relevant; never invent others):\n" +
          catalogFacts.map(f => `- ${f.name} — ₹${f.price} (category: ${f.category})`).join('\n')
        : "No specific products matched this query in the catalog search.";

    return (
        languageBlock +
        "You are Blinkit's multilingual product discovery assistant for an Indian quick-commerce app.\n\n" +
        "You support all 22 languages listed in the Eighth Schedule of the Indian Constitution:\n" +
        INDIAN_LANGUAGES.map(l => `- ${l}`).join('\n') + '\n' +
        "Plus English. Give your genuine best effort in the exact language/dialect used, including lower-resource ones (Bodo, Dogri, Maithili, Konkani, Sanskrit, Santali, Manipuri, Sindhi, Kashmiri).\n\n" +
        "CRITICAL RULES:\n" +
        "1. You CANNOT process refunds, cancel orders, or access user accounts under ANY circumstances. If asked, politely redirect (in the user's language) to Blinkit customer support.\n" +
        "2. Do not recommend specific third-party brands to avoid bias — talk about product types/categories instead, UNLESS the MATCHED PRODUCTS facts below name specific catalog items; you may name those exactly.\n" +
        "3. Only state specific product names, prices, or stock availability if they appear in the MATCHED PRODUCTS block below. If it says nothing matched, do not invent products or prices — suggest relevant categories instead.\n" +
        "4. Keep answers concise (2-4 sentences), warm, and focused on discovering products on Blinkit.\n\n" +
        factsBlock + "\n\n" +
        "Respond with ONLY a JSON object, no markdown fences, no extra commentary, in this exact shape:\n" +
        `{"reply": "<your reply text written in the user's language/script>", "category_ids": ["<0 to 3 ids from: ${CHAT_CATEGORY_IDS.join(', ')}>"]}`
    );
}

function parseChatJson(raw) {
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        const parsed = JSON.parse(clean);
        return {
            reply: parsed.reply || raw,
            category_ids: Array.isArray(parsed.category_ids) ? [...new Set(parsed.category_ids.filter(id => CHAT_CATEGORY_IDS.includes(id)))] : []
        };
    } catch (e) {
        return { reply: raw, category_ids: [] };
    }
}

// Gemini has noticeably better coverage of India's lower-resource scheduled
// languages (Bodo, Dogri, Maithili, Konkani, Sanskrit, Santali, Manipuri)
// than the small/fast Groq Llama model, which tends to silently default to
// Hindi/Marathi for those. Tried as primary; Groq is the fallback.
async function callGemini(systemPrompt, messages) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key not configured");
    const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Empty Gemini response");
    return parseChatJson(raw);
}

async function callGroq(systemPrompt, messages) {
    if (!process.env.GROQ_API_KEY) throw new Error("Groq API key not configured");
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: 0.3
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return parseChatJson(data.choices[0].message.content);
}

app.post('/api/chat', async (req, res) => {
    const { messages, catalogFacts } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages provided" });

    // Detect language from the user's LATEST message (last user turn), so the
    // system prompt can be authoritatively pinned to the right script — not
    // the model's guess.
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const systemPrompt = buildChatSystemPrompt(catalogFacts, lastUser ? lastUser.content : '');

    try {
        let result;
        try {
            result = await callGemini(systemPrompt, messages);
        } catch (geminiErr) {
            console.warn("Gemini chat failed, falling back to Groq:", geminiErr.message);
            result = await callGroq(systemPrompt, messages);
        }
        res.json({ success: true, reply: result.reply, category_ids: result.category_ids });
    } catch (e) {
        console.error("Chat API Error (both providers failed):", e);
        res.status(500).json({ error: "Failed to process chat: " + e.message });
    }
});

// Vercel runs this file as a serverless function (imports `app` and never calls
// listen itself), so only bind a port when running directly with `node server.js`.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`🚀 Backend Server is running on port ${PORT}`);
        console.log(`🌐 Frontend UI available at: http://localhost:${PORT}/prototype/index.html`);
        console.log(`=========================================`);
        if (process.env.GEMINI_API_KEY) console.log(`✅ Gemini API Key detected`);
        if (process.env.GROQ_API_KEY) console.log(`✅ Groq API Key detected`);
    });
}

module.exports = app;
