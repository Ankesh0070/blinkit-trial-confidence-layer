const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Open the bare URL straight into the store UI.
app.get('/', (req, res) => res.redirect('/prototype/index.html'));

// Serve the static frontend files from Phase 6
app.use(express.static(path.join(__dirname, 'phase6')));

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
// Mirrors server.py so the whole app runs on Node alone (no Python needed).
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages provided" });

    try {
        if (!process.env.GROQ_API_KEY) throw new Error("Groq API key not configured");

        const systemPrompt = {
            role: "system",
            content: (
                "You are a helpful Blinkit product discovery assistant. " +
                "CRITICAL RULES: " +
                "1. You CANNOT process refunds, cancel orders, or access user accounts under ANY circumstances. " +
                "2. If a user asks for a refund or complains about an order, politely explain that you are only a product discovery assistant and they should contact customer support. " +
                "3. Do not recommend specific third-party brands to avoid bias. Recommend categories or types of products instead. " +
                "4. Keep answers concise, helpful, and focused on discovering products on Blinkit."
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
                temperature: 0.5
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        res.json({ success: true, reply: data.choices[0].message.content });
    } catch (e) {
        console.error("Chat API Error:", e);
        res.status(500).json({ error: "Failed to process chat: " + e.message });
    }
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Backend Server is running on port ${PORT}`);
    console.log(`🌐 Frontend UI available at: http://localhost:${PORT}/prototype/index.html`);
    console.log(`📊 Dashboard available at: http://localhost:${PORT}/prototype/dashboard.html`);
    console.log(`=========================================`);
    if (process.env.GEMINI_API_KEY) console.log(`✅ Gemini API Key detected`);
    if (process.env.GROQ_API_KEY) console.log(`✅ Groq API Key detected`);
});
