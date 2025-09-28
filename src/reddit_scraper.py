import praw
import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

RAW_CSV_PATH = "/opt/crypto-sentiment-analyzer/data/raw/crypto_posts.csv"
SUBREDDIT = "CryptoCurrency"
POST_LIMIT = 200

def init_reddit_client():
    return praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent=os.getenv("REDDIT_USER_AGENT")
    )

def fetch_posts():
    try:
        reddit = init_reddit_client()
        posts = []
        for submission in reddit.subreddit(SUBREDDIT).new(limit=POST_LIMIT):
            posts.append({
                "id": submission.id,
                "title": submission.title,
                "selftext": submission.selftext,
                "created_utc": submission.created_utc
            })

        df = pd.DataFrame(posts)
        df.to_csv(RAW_CSV_PATH, index=False)
        print(f"[{pd.Timestamp.now()}] Saved {len(df)} posts to {RAW_CSV_PATH}")

    except Exception as e:
        print(f"[{pd.Timestamp.now()}] ERROR fetching posts: {e}")

if __name__ == "__main__":
    fetch_posts()
