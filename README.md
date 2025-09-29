
# Crypto Sentiment Analyzer

## 📌 Overview

Crypto Sentiment Analyzer is a **Next.js + FastAPI project** that analyzes sentiment from Reddit crypto subreddits.
It has a **free tier** (restricted to r/CryptoCurrency, last 24h, limited posts) and a **paid tier** (wallet-gated via Solana Phantom or EVM MetaMask).

The project is split into **frontend** (Next.js 15, TypeScript, React) and **backend** (FastAPI, Python, HuggingFace Transformers).

---

## 🚀 Scope

### Free Tier

* Only works with **r/CryptoCurrency**
* Pulls **latest ~100 posts / 24h**
* Basic sentiment analysis (positive / negative / neutral)
* Displays:

  * **Donut chart** of sentiment distribution
  * **Posts list** with sentiment tag
  * Transparent, shows all analyzed posts

### Paid Tier

* Wallet-gated (Phantom or MetaMask)
* Allows:

  * Any subreddit
  * Filtering out posts/authors
  * Configurable post limits
* Backend is **scalable** for additional features later

---

## 🗂 File Structure

```
crypto-sentiment-analyzer/
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint, API routes
│   │   ├── reddit_client.py     # Reddit API wrapper
│   │   ├── sentiment_model.py   # HuggingFace sentiment pipeline
│   │   └── schemas.py           # Pydantic models
│   ├── requirements.txt
│   └── run.sh                   # Start script (uvicorn)
│
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (wallet + entry point)
│   │   └── [subreddit]/         # Dynamic subreddit route
│   │       ├── page.tsx         # SSR wrapper
│   │       └── SubredditClient.tsx # Client component (fetches posts + chart)
│   ├── components/
│   │   ├── WalletButtons.tsx    # Phantom + MetaMask buttons
│   │   └── (shared UI as needed)
│   ├── providers.tsx            # Wallet state management
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🔌 Key Technologies

* **Frontend**:

  * Next.js 15 (App Router)
  * React + TypeScript
  * TailwindCSS (styling)
  * Plotly.js (charts)
  * Solana Wallet Adapter (Phantom)
  * Ethers.js (MetaMask)

* **Backend**:

  * FastAPI
  * HuggingFace Transformers (distilbert)
  * PRAW (Reddit API client)
  * Uvicorn

---

## 📈 Current Progress

✅ Backend endpoints:

* `GET /api/posts/{subreddit}` → Fetches Reddit posts
* `GET /api/sentiment/{subreddit}` → Fetches posts + sentiment tags

✅ Frontend pages:

* `/` → Home page with wallet buttons and free tier entry
* `/[subreddit]` → Dynamic subreddit sentiment page with donut chart + posts list

✅ Wallet integration (in progress):

* Phantom connect/disconnect mostly working
* MetaMask connect/disconnect inconsistent → needs refinement

---

## 🛠️ Next Steps

1. **Fix wallet UX**: ensure only one wallet is active at a time, persist connection on refresh, and disconnect works properly.
2. **Finish free vs paid tier logic**: lock features unless wallet is connected and flagged as "paid".
3. **Improve sentiment accuracy**: refine NLP model or add heuristics.
4. **Polish UI**: consistent styling, responsive layout, user-friendly error states.
5. **Prepare MVP launch**: stable enough for user testing.

---

## ⚡ Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌱 Roadmap

* **MVP**: Free tier + Paid tier (basic gating)
* **Phase 2**: Filters (exclude authors/keywords), history view
* **Phase 3**: Portfolio sentiment tracker, alerts, deeper analytics
* **Phase 4**: Monetization → subscription tiers with wallet verification

---
