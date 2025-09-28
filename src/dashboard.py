import streamlit as st
import pandas as pd
from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment
from dotenv import load_dotenv
import os
import plotly.express as px

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
DATA_PATH = "/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv"
df = pd.read_csv(DATA_PATH)

# Show raw data
if st.checkbox("Show raw data"):
    st.write(df.head(20))

# --- Sentiment Distribution Bar Chart ---
st.subheader(f"Sentiment Distribution for r/{selected_subreddit}")
sentiment_counts = df['sentiment'].value_counts()
sentiment_counts = sentiment_counts.reindex(['NEGATIVE','NEUTRAL','POSITIVE'], fill_value=0)

colors = {'NEGATIVE':'red', 'NEUTRAL':'orange', 'POSITIVE':'green'}

fig = px.bar(
    x=sentiment_counts.index,
    y=sentiment_counts.values,
    color=sentiment_counts.index,
    color_discrete_map=colors,
    labels={'x':'Sentiment', 'y':'Count'},
    title=f"Sentiment Distribution for r/{selected_subreddit}"
)

st.plotly_chart(fig, use_container_width=True)

# --- Top Posts by Sentiment ---
st.subheader("Top Posts by Sentiment")

top_positive = df[df['sentiment'] == 'POSITIVE'].head(5)
st.markdown("**Top 5 Positive Posts**")
for idx, row in top_positive.iterrows():
    st.markdown(f"- {row['title']} ([link]({row['url']}))")

top_negative = df[df['sentiment'] == 'NEGATIVE'].head(5)
st.markdown("**Top 5 Negative Posts**")
for idx, row in top_negative.iterrows():
    st.markdown(f"- {row['title']} ([link]({row['url']}))")

# --- Sentiment Over Time ---
st.subheader("Sentiment Over Time")
df['created_utc'] = pd.to_datetime(df['created_utc'], unit='s')
time_series = df.groupby(pd.Grouper(key='created_utc', freq='H'))['sentiment'].value_counts().unstack().fillna(0)
time_series = time_series.reindex(columns=['NEGATIVE','NEUTRAL','POSITIVE'], fill_value=0)

# Plot time series with Plotly
fig_time = px.line(
    time_series,
    x=time_series.index,
    y=['NEGATIVE','NEUTRAL','POSITIVE'],
    labels={'value':'Count','created_utc':'Time','variable':'Sentiment'},
    color_discrete_map=colors,
    title=f"Sentiment Over Time for r/{selected_subreddit}"
)
st.plotly_chart(fig_time, use_container_width=True)
