# backend/app/routers/refresh.py
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.reddit_scraper import fetch_posts
from app.sentiment_model import analyze_sentiment

router = APIRouter(prefix="/api", tags=["refresh"])

class RefreshRequest(BaseModel):
    subreddit: str = Field(default="CryptoCurrency")
    limit: int = Field(default=50, ge=1, le=200)

@router.post("/refresh")
def refresh_data(body: RefreshRequest) -> Dict[str, Any]:
    posts = fetch_posts(subreddit_name=body.subreddit, limit=body.limit)
    analyzed = analyze_sentiment(posts)
    return {
        "status": "ok",
        "message": f"Refreshed {len(analyzed)} posts from r/{body.subreddit}",
        "count": len(analyzed),
    }
