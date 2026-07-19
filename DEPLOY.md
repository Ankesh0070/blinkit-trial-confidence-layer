# Deploying the Blinkit Trial Confidence Layer (permanent public link)

The app is a Node/Express server (`server.js`) that serves the Phase 6 UI and two
optional AI endpoints (`/api/analyze-review`, `/api/chat`). It is already
deploy-ready: `package.json` has a `start` script, `render.yaml` describes the
service, `.gitignore` keeps `.env` out of the repo, and the bare URL redirects
into the store.

Recommended host: **Render** (free, permanent HTTPS URL, runs Node).

---

## Step 1 — Put the code on GitHub

A local git repo with an initial commit already exists (no `.env` committed).

1. Go to https://github.com/new and create an **empty** repo
   (no README, no .gitignore) — e.g. `blinkit-trial-confidence`.
2. Copy the repo URL, e.g. `https://github.com/<you>/blinkit-trial-confidence.git`.
3. In a **terminal** (open the project folder → right-click → "Open in Terminal"),
   run:

   ```
   git remote add origin https://github.com/<you>/blinkit-trial-confidence.git
   git push -u origin main
   ```

   A browser window opens to sign in to GitHub — approve it. Done.

## Step 2 — Deploy on Render

1. Go to https://render.com and sign up (GitHub login is easiest).
2. **New +** → **Web Service** → connect your GitHub → pick the repo.
3. Render auto-detects `render.yaml`. If asked manually:
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: **Free**
4. (Optional AI features) In **Environment**, add:
   - `GROQ_API_KEY` = your Groq key
   - `GEMINI_API_KEY` = your Gemini key
   Skip this to deploy without the chatbot / live analysis — the full
   cart → checkout → CCAR → dashboard journey still works.
5. **Create Web Service** and wait ~2–3 minutes.

You get a permanent URL like `https://blinkit-trial-confidence.onrender.com`
that opens straight into the store.

---

## Things to know

- **Free tier sleeps** after ~15 min of no traffic; the next visit takes
  ~50 seconds to wake up, then it's fast. Fine for a demo / evaluation.
- **API keys on a public site**: anyone who opens the link can trigger the AI
  endpoints, which spend your Groq/Gemini quota. For a graduation demo this is
  usually fine (free tiers, low traffic). After the evaluation, rotate/disable
  the keys, or deploy without them.
- To update the live site later: commit your changes and `git push` — Render
  redeploys automatically.
