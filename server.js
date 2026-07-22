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
const CHAT_CATEGORY_IDS = [
    'electronics', 'personal_care_beauty', 'pharmacy_health', 'baby', 'home_cleaning', 'pet', 'intimate_personal',
    'books', 'jewellery', 'spiritual', 'stationery_games', 'supplements', 'sports_outdoor',
    'vegetables_fruits', 'dairy_bread_eggs', 'atta_rice_dal', 'masala_oil', 'munchies',
    'cold_drinks_juices', 'tea_coffee', 'biscuits_bakery', 'sweet_tooth', 'instant_frozen'
];

app.post('/api/chat', async (req, res) => {
    const { messages, catalogFacts } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages provided" });

    try {
        if (!process.env.GROQ_API_KEY) throw new Error("Groq API key not configured");

        const factsBlock = Array.isArray(catalogFacts) && catalogFacts.length
            ? "MATCHED PRODUCTS IN CATALOG (these are real — state them accurately if relevant; never invent others):\n" +
              catalogFacts.map(f => `- ${f.name} — ₹${f.price} (category: ${f.category})`).join('\n')
            : "No specific products matched this query in the catalog search.";

        const systemPrompt = {
            role: "system",
            content: (
                "You are Blinkit's multilingual product discovery assistant for an Indian quick-commerce app.\n\n" +
                "LANGUAGE RULE (critical, always follow first): Detect the language and script of the user's LATEST message and reply ONLY in that same language and script. Support Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, Assamese, and English — and any other Indian language the user writes in. If the user writes Hinglish (Hindi/regional words typed in Roman/English letters, e.g. 'mujhe chips chahiye' or 'chips available hai kya'), reply in Hinglish too using Roman script — do NOT switch to Devanagari or any other script unless the user does. Never reply in a different language than the user used.\n\n" +
                "CRITICAL RULES:\n" +
                "1. You CANNOT process refunds, cancel orders, or access user accounts under ANY circumstances. If asked, politely redirect (in the user's language) to Blinkit customer support.\n" +
                "2. Do not recommend specific third-party brands to avoid bias — talk about product types/categories instead, UNLESS the MATCHED PRODUCTS facts below name specific catalog items; you may name those exactly.\n" +
                "3. Only state specific product names, prices, or stock availability if they appear in the MATCHED PRODUCTS block below. If it says nothing matched, do not invent products or prices — suggest relevant categories instead.\n" +
                "4. Keep answers concise (2-4 sentences), warm, and focused on discovering products on Blinkit.\n\n" +
                factsBlock + "\n\n" +
                "Respond with ONLY a JSON object, no markdown fences, no extra commentary, in this exact shape:\n" +
                `{"reply": "<your reply text written in the user's language/script>", "category_ids": ["<0 to 3 ids from: ${CHAT_CATEGORY_IDS.join(', ')}>"]}`
            )
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [systemPrompt, ...messages],
                temperature: 0.4
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const raw = data.choices[0].message.content;
        const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(clean); }
        catch (e) { parsed = { reply: raw, category_ids: [] }; }

        res.json({
            success: true,
            reply: parsed.reply || raw,
            category_ids: Array.isArray(parsed.category_ids) ? [...new Set(parsed.category_ids.filter(id => CHAT_CATEGORY_IDS.includes(id)))] : []
        });
    } catch (e) {
        console.error("Chat API Error:", e);
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
