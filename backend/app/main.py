# backend/app/main.py
from fastapi import FastAPI
from app.routers import sentiment, refresh
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Crypto Sentiment Analyzer API",
    description="Fetch Reddit posts and analyze sentiment for cryptocurrencies",
    version="0.1.0",
)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# Include routers
app.include_router(sentiment.router)
app.include_router(refresh.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)