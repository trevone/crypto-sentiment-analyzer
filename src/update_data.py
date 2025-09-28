# src/update_data.py
#!/usr/bin/env python3
import os
import sys
import pandas as pd
from dotenv import load_dotenv

# local imports
from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment

BASE = "/opt/crypto-sentiment-analyzer"
ENV_PATH = os.path.join(BASE, ".env")
OUT_CSV = os.path.join(BASE, "data", "processed", "crypto_posts_with_sentiment.csv")

def main(subreddit: str = "CryptoCurrency", limit: int = 100):
    # ensure env is loaded (works under cron/systemd)
    load_dotenv(dotenv_path=ENV_PATH)

    # 1) fetch latest posts
    df = fetch_posts(subreddit_name=subreddit, limit=limit)

    # 2) ensure expected columns exist
    if "selftext" not in df.columns:
        df["selftext"] = ""
    if "url" not in df.columns:
        df["url"] = "#"

    # 3) run sentiment (pass text!)
    df["selftext"] = df["selftext"].fillna("").astype(str)
    df["sentiment"] = df["selftext"].apply(analyze_sentiment)

    # 4) save processed output
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    df.to_csv(OUT_CSV, index=False)
    print(f"[{pd.Timestamp.now()}] Updated {OUT_CSV} from r/{subreddit} ({len(df)} posts)")

if __name__ == "__main__":
    sub = sys.argv[1] if len(sys.argv) > 1 else "CryptoCurrency"
    lim = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    main(sub, lim)
