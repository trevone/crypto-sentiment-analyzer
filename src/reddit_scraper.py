#!/usr/bin/env python3
import os
import pandas as pd
import praw
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Reddit API credentials from .env
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

DATA_RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
DATA_PROCESSED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed")

os.makedirs(DATA_RAW_PATH, exist_ok=True)
os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)

def init_reddit_client():
    """Initialize the PRAW Reddit client."""
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

def fetch_posts(subreddit_name="CryptoCurrency", limit=100):
    """Fetch latest posts from a subreddit and save to CSV."""
    reddit = init_reddit_client()
    subreddit = reddit.subreddit(subreddit_name)

    data = []
    for post in subreddit.new(limit=limit):
        data.append({
            "id": post.id,
            "title": post.title,
            "selftext": post.selftext,
            "created_utc": post.created_utc,
            "url": post.url
        })

    # Save raw CSV
    raw_csv_file = os.path.join(DATA_RAW_PATH, f"{subreddit_name.lower()}_posts.csv")
    df_raw = pd.DataFrame(data)
    df_raw.to_csv(raw_csv_file, index=False)
    print(f"Saved {len(df_raw)} posts to {raw_csv_file}")

    return df_raw

if __name__ == "__main__":
    fetch_posts()
