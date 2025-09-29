# backend/app/routers/sentiment.py
from fastapi import APIRouter, Query
from typing import Dict, Any, List
import pandas as pd
from datetime import datetime, timezone

from app.reddit_scraper import fetch_posts
from app.sentiment_model import analyze_sentiment

router = APIRouter(prefix="/api", tags=["sentiment"])

@router.get("/posts/{subreddit}")
def get_posts(subreddit: str, limit: int = Query(50, ge=1, le=200)) -> Dict[str, Any]:
    posts = fetch_posts(subreddit_name=subreddit, limit=limit)
    return {"subreddit": subreddit, "count": len(posts), "posts": posts}

@router.get("/sentiment/{subreddit}")
def get_sentiment(subreddit: str, limit: int = Query(50, ge=1, le=200)) -> Dict[str, Any]:
    # 1) Fetch + analyze
    posts = fetch_posts(subreddit_name=subreddit, limit=limit)
    analyzed = analyze_sentiment(posts)

    # 2) Build distribution + time series
    df = pd.DataFrame(analyzed)
    dist = {}
    if "sentiment" in df.columns:
        dist = {k: int(v) for k, v in df["sentiment"].value_counts().to_dict().items()}

    time_series: List[Dict[str, Any]] = []
    if "created_utc" in df.columns and "sentiment" in df.columns:
        df["created_dt"] = pd.to_datetime(df["created_utc"], unit="s", errors="coerce")
        ts = (
            df.dropna(subset=["created_dt"])
              .groupby(pd.Grouper(key="created_dt", freq="H"))["sentiment"]
              .value_counts()
              .unstack()
              .fillna(0)
        )

        # Ensure consistent columns
        for s in ["NEGATIVE", "NEUTRAL", "POSITIVE"]:
            if s not in ts.columns:
                ts[s] = 0
        ts = ts[["NEGATIVE", "NEUTRAL", "POSITIVE"]].astype(int).reset_index()

        for _, r in ts.iterrows():
            # ISO8601 in UTC
            t_iso = pd.Timestamp(r["created_dt"], tz="UTC").isoformat()
            time_series.append({
                "time": t_iso,
                "NEGATIVE": int(r["NEGATIVE"]),
                "NEUTRAL": int(r["NEUTRAL"]),
                "POSITIVE": int(r["POSITIVE"]),
            })

    return {
        "subreddit": subreddit,
        "limit": limit,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "distribution": dist,
        "time_series": time_series,
        "posts": analyzed,  # full transparency: each post with sentiment
    }
