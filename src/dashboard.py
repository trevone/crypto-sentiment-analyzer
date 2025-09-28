import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment

from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv(dotenv_path='/opt/crypto-sentiment-analyzer/.env')

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

st.title("Crypto Sentiment Analyzer Dashboard")
st.markdown("Visualizing Reddit sentiment for cryptocurrencies")

# --- Subreddit selection ---
subreddits = ["CryptoCurrency", "Bitcoin", "CryptoMarkets", "ethtrader"]
selected_subreddit = st.selectbox("Select Subreddit", subreddits)

# --- Refresh button ---
if st.button("Refresh Data"):
    st.info(f"Fetching posts from r/{selected_subreddit}...")
    fetch_posts(subreddit_name=selected_subreddit, limit=100)
    analyze_sentiment()
    st.success("Data refreshed!")

# Load processed data
DATA_PATH = "data/processed/crypto_posts_with_sentiment.csv"
df = pd.read_csv(DATA_PATH)

# Show raw data
if st.checkbox("Show raw data"):
    st.write(df.head(20))

# Sentiment distribution
st.subheader(f"Sentiment Distribution for r/{selected_subreddit}")
sentiment_counts = df['sentiment'].value_counts()
st.bar_chart(sentiment_counts)

# Top positive/negative posts
st.subheader("Top Posts by Sentiment")
top_positive = df[df['sentiment'] == 'POSITIVE'].head(5)
st.markdown("**Top 5 Positive Posts**")
for idx, row in top_positive.iterrows():
    st.markdown(f"- {row['title']} ([link]({row['url']}))")

top_negative = df[df['sentiment'] == 'NEGATIVE'].head(5)
st.markdown("**Top 5 Negative Posts**")
for idx, row in top_negative.iterrows():
    st.markdown(f"- {row['title']} ([link]({row['url']}))")

# Time trend
st.subheader("Sentiment Over Time")
df['created_utc'] = pd.to_datetime(df['created_utc'], unit='s')
time_series = df.groupby(pd.Grouper(key='created_utc', freq='H'))['sentiment'].value_counts().unstack().fillna(0)
st.line_chart(time_series)
