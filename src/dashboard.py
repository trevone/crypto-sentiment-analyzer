import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment
from dotenv import load_dotenv
import os

# --- Load environment variables ---
load_dotenv(dotenv_path='/opt/crypto-sentiment-analyzer/.env')

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

# --- Streamlit page ---
st.title("Crypto Sentiment Analyzer Dashboard")
st.markdown("Visualizing Reddit sentiment for cryptocurrencies")

# --- Subreddit selection ---
subreddits = ["CryptoCurrency", "Bitcoin", "CryptoMarkets", "ethtrader"]
selected_subreddit = st.selectbox("Select Subreddit", subreddits)

# --- Refresh button ---
if st.button("Refresh Data"):
    st.info(f"Fetching posts from r/{selected_subreddit}...")
    
    # Fetch posts
    df = fetch_posts(subreddit_name=selected_subreddit, limit=100)

    # Ensure 'selftext' exists and is string
    if not df.empty and "selftext" in df.columns:
        df["selftext"] = df["selftext"].fillna("").astype(str)
        df["sentiment"] = df["selftext"].apply(analyze_sentiment)

    # Ensure 'url' column exists (for dashboard links)
    if "url" not in df.columns:
        df["url"] = "#"

    # Save processed CSV
    df.to_csv("/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv", index=False)
    st.success("Data refreshed!")

# --- Load processed data ---
DATA_PATH = "/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv"
if os.path.exists(DATA_PATH):
    df = pd.read_csv(DATA_PATH)
else:
    st.warning("No processed data found. Please refresh the data first.")
    df = pd.DataFrame(columns=["id", "title", "selftext", "created_utc", "sentiment", "url"])

# --- Show raw data ---
if st.checkbox("Show raw data"):
    st.write(df.head(20))

# --- Sentiment distribution ---
st.subheader(f"Sentiment Distribution for r/{selected_subreddit}")
if not df.empty and "sentiment" in df.columns:
    sentiment_counts = df['sentiment'].value_counts()
    st.bar_chart(sentiment_counts)
else:
    st.info("No sentiment data available.")

# --- Top positive/negative posts ---
st.subheader("Top Posts by Sentiment")
if not df.empty:
    top_positive = df[df['sentiment'] == 'POSITIVE'].head(5)
    st.markdown("**Top 5 Positive Posts**")
    for _, row in top_positive.iterrows():
        st.markdown(f"- {row.get('title', 'No Title')} ([link]({row.get('url', '#')}))")

    top_negative = df[df['sentiment'] == 'NEGATIVE'].head(5)
    st.markdown("**Top 5 Negative Posts**")
    for _, row in top_negative.iterrows():
        st.markdown(f"- {row.get('title', 'No Title')} ([link]({row.get('url', '#')}))")
else:
    st.info("No posts available.")

# --- Sentiment over time ---
st.subheader("Sentiment Over Time")
if not df.empty and "created_utc" in df.columns:
    df['created_utc'] = pd.to_datetime(df['created_utc'], unit='s', errors='coerce')
    time_series = df.groupby(pd.Grouper(key='created_utc', freq='H'))['sentiment'].value_counts().unstack().fillna(0)
    st.line_chart(time_series)
else:
    st.info("No time series data available.")
