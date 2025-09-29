import os
import praw
from dotenv import load_dotenv

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

def init_reddit_client():
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT,
    )

def fetch_posts(subreddit_name="CryptoCurrency", limit=50):
    """Fetch latest posts from subreddit -> list of dicts"""
    reddit = init_reddit_client()
    subreddit = reddit.subreddit(subreddit_name)

    posts = []
    for post in subreddit.new(limit=limit):
        posts.append({
            "id": post.id,
            "title": post.title,
            "selftext": post.selftext or "",
            "created_utc": post.created_utc,
            "url": post.url,
        })
    return posts
