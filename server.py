import os
import json
import requests
from typing import List, Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class ReviewRequest(BaseModel):
    reviewText: str
    provider: str = 'gemini'

@app.post("/api/analyze-review")
async def analyze_review(req: ReviewRequest):
    if not req.reviewText:
        raise HTTPException(status_code=400, detail="No review text provided")

    result_text = ""
    prompt = f'Analyze this e-commerce review: "{req.reviewText}". Respond ONLY with a JSON object in this format: {{"theme": "short summary theme", "sentiment": "positive" or "negative" or "neutral", "confidence": 0.0-1.0}}'

    try:
        if req.provider == 'gemini' and os.getenv('GEMINI_API_KEY'):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={os.getenv('GEMINI_API_KEY')}"
            headers = {'Content-Type': 'application/json'}
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            
            res = requests.post(url, headers=headers, json=payload)
            data = res.json()
            
            if 'error' in data:
                raise Exception(data['error'].get('message', 'Gemini API Error'))
            
            result_text = data['candidates'][0]['content']['parts'][0]['text']

        elif req.provider == 'groq' and os.getenv('GROQ_API_KEY'):
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                'Authorization': f"Bearer {os.getenv('GROQ_API_KEY')}",
                'Content-Type': 'application/json'
            }
            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}]
            }
            
            res = requests.post(url, headers=headers, json=payload)
            data = res.json()
            
            if 'error' in data:
                raise Exception(data['error'].get('message', 'Groq API Error'))
                
            result_text = data['choices'][0]['message']['content']

        else:
            raise HTTPException(status_code=500, detail="Selected provider API key not configured or invalid provider.")

        # Clean JSON formatting
        clean_json = result_text.replace('```json', '').replace('```', '').strip()
        analysis = json.loads(clean_json)
        
        return {"success": True, "analysis": analysis}

    except Exception as e:
        print(f"AI Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze review: {str(e)}")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    try:
        if not os.getenv('GROQ_API_KEY'):
            raise Exception("Groq API key not configured")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            'Authorization': f"Bearer {os.getenv('GROQ_API_KEY')}",
            'Content-Type': 'application/json'
        }
        
        system_prompt = {
            "role": "system",
            "content": (
                "You are a helpful Blinkit product discovery assistant. "
                "CRITICAL RULES: "
                "1. You CANNOT process refunds, cancel orders, or access user accounts under ANY circumstances. "
                "2. If a user asks for a refund or complains about an order, politely explain that you are only a product discovery assistant and they should contact customer support. "
                "3. Do not recommend specific third-party brands to avoid bias. Recommend categories or types of products instead. "
                "4. Keep answers concise, helpful, and focused on discovering products on Blinkit."
            )
        }
        
        messages = [system_prompt]
        for msg in req.messages:
            messages.append({"role": msg.role, "content": msg.content})

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": 0.5
        }
        
        res = requests.post(url, headers=headers, json=payload)
        data = res.json()
        
        if 'error' in data:
            raise Exception(data['error'].get('message', 'Groq API Error'))
            
        result_text = data['choices'][0]['message']['content']
        return {"success": True, "reply": result_text}

    except Exception as e:
        print(f"Chat API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

# Mount the static frontend files from Phase 6
app.mount("/", StaticFiles(directory="phase6", html=True), name="phase6")
