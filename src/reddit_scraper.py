import praw
import pandas as pd

# Initialize Reddit API client
def init_reddit_client():
    return praw.Reddit(
        client_id='YOUR_CLIENT_ID',
        client_secret='YOUR_CLIENT_SECRET',
        user_agent='YOUR_USER_AGENT'
    )

# Fetch posts from a subreddit
def fetch_posts(subreddit_name, limit=100):
    reddit = init_reddit_client()
    subreddit = reddit.subreddit(subreddit_name)
    posts = []
    for submission in subreddit.new(limit=limit):
        posts.append({
            'title': submission.title,
            'selftext': submission.selftext,
            'url': submission.url,
            'created_utc': submission.created_utc
        })
    return pd.DataFrame(posts)

if __name__ == "__main__":
    df = fetch_posts('CryptoCurrency', limit=100)
    df.to_csv('data/raw/crypto_posts.csv', index=False)
