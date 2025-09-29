
# Developer Guide

## Overview

Crypto Sentiment Analyzer is a **Next.js + FastAPI** application that scrapes subreddit posts, runs sentiment analysis (Transformers), and provides tiered access based on wallet connections (Phantom for Solana, MetaMask for EVM).

* **Free tier:** r/CryptoCurrency only, 24h lookback, ~100 posts.
* **Paid tier:** User-selected subreddit + extra filters (future roadmap).
* **Wallets:** Phantom (Solana) and MetaMask (EVM). Only one wallet active at a time.

---

## Stack & Dependencies

### Backend

* **FastAPI** (Python)
* **uvicorn** (server)
* **transformers** (Hugging Face sentiment model)
* **praw** (Reddit scraping)
* **pydantic** (data validation)

### Frontend

* **Next.js 15 (App Router)**
* **TypeScript**
* **react-plotly.js** (charts)
* **TailwindCSS** (styling)
* **Solana Wallet Adapter** (`@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`)
* **ethers.js** (MetaMask / EVM integration)

---

## File Structure

```
crypto-sentiment-analyzer/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── reddit_scraper.py    # Fetch posts from Reddit
│   │   ├── sentiment_model.py   # HuggingFace pipeline wrapper
│   │   └── schemas.py           # Pydantic schemas
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (wraps UserProvider)
│   │   ├── page.tsx             # Homepage with wallet buttons & links
│   │   ├── [subreddit]/         # Dynamic subreddit route
│   │   │   ├── page.tsx         # SSR wrapper → mounts SubredditClient
│   │   │   └── SubredditClient.tsx
│   │   └── providers.tsx        # React context for wallet state
│   │
│   ├── components/
│   │   ├── WalletButtons.tsx    # Phantom + MetaMask connect/disconnect
│   │   └── (future UI comps)
│   │
│   ├── styles/globals.css
│   └── tsconfig.json
│
└── docs/
    └── DEVELOPER_GUIDE.md       # (this file)
```

---

## Setup & Run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docs available at:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at:
👉 [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

* `GET /api/posts/{subreddit}`
  Returns raw posts.

* `GET /api/sentiment/{subreddit}`
  Returns posts with sentiment labels + distribution.

---

## Wallet Integration

* **Phantom (Solana):**

  * Uses `window.solana`.
  * Connect prompts appear only if disconnected at the extension level.
  * Disconnect clears local state + requests extension disconnect.

* **MetaMask (EVM):**

  * Uses `window.ethereum`.
  * Connect prompts MetaMask or Phantom-EVM (if installed).
  * Disconnect = state reset only (MetaMask lacks real disconnect API).

⚠ **Known Issue:**
If Phantom is installed with EVM mode enabled, MetaMask button may auto-select Phantom-EVM instead of MetaMask. Current workaround: User selects wallet in the MetaMask connection popup.

---

## Current Progress

✅ Backend endpoints functional
✅ Sentiment pipeline integrated
✅ Frontend renders posts + donut chart
✅ Wallet buttons connect/disconnect (basic UX)
⚠ Disconnect not fully reliable (esp. MetaMask)
⚠ Sentiment model occasionally mislabels
⚠ Styling inconsistent between components

---

## Next Steps

1. **Stabilize Wallet UX**

   * Ensure only one wallet active at a time.
   * Improve disconnect flow.
   * Add persistent state across refresh.

2. **Enforce Free vs Paid**

   * Free = hard-coded r/CryptoCurrency, 24h, 100 posts.
   * Paid = unlock subreddit selection.

3. **Data Improvements**

   * Switch model to finetuned sentiment (crypto context).
   * Add filters (e.g., exclude bots).

4. **UI Polish**

   * Global styling theme.
   * Replace form with dropdown for subreddit selection.
   * Show loading + error states consistently.

---

## Development Tips

* Always test API in Swagger UI first (`/docs`).
* Run frontend/backend in separate terminals.
* For wallet debugging:

  ```js
  console.log(window.solana, window.ethereum);
  ```
* If `npm` dependency resolution breaks, try:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
