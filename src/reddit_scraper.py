import praw
import pandas as pd
import os

from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Load Reddit credentials from environment variables
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

def init_reddit_client():
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

def fetch_posts(subreddit_name="CryptoCurrency", limit=100):
    reddit = init_reddit_client()
    subreddit = reddit.subreddit(subreddit_name)
    posts = []
    for submission in subreddit.new(limit=limit):
        posts.append({
            "title": submission.title,
            "selftext": submission.selftext,
            "url": submission.url,
            "created_utc": submission.created_utc
        })
    df = pd.DataFrame(posts)
    os.makedirs("data/raw", exist_ok=True)
    df.to_csv("data/raw/crypto_posts.csv", index=False)
    print(f"Saved {len(df)} posts to data/raw/crypto_posts.csv")
    return df

if __name__ == "__main__":
    fetch_posts()
