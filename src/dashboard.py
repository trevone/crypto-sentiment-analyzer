import streamlit as st
import pandas as pd
import plotly.express as px
from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv(dotenv_path='/opt/crypto-sentiment-analyzer/.env')

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

st.set_page_config(page_title="Crypto Sentiment Dashboard", layout="wide")

st.title("Crypto Sentiment Analyzer Dashboard")
st.markdown("Visualizing Reddit sentiment for cryptocurrencies")

# --- Subreddit selection ---
subreddits = ["CryptoCurrency", "Bitcoin", "CryptoMarkets", "ethtrader"]
selected_subreddit = st.selectbox("Select Subreddit", subreddits)

DATA_PATH = "/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv"

# --- Refresh button ---
if st.button("Refresh Data"):
    st.info(f"Fetching posts from r/{selected_subreddit}...")
    df_raw = fetch_posts(subreddit_name=selected_subreddit, limit=100)
    analyze_sentiment(df_raw)  # Pass dataframe to avoid reloading CSV
    st.success("Data refreshed!")

# Load processed data
df = pd.read_csv(DATA_PATH)

# Convert created_utc to datetime
df['created_utc'] = pd.to_datetime(df['created_utc'], unit='s')

# Map sentiment to numeric scores
df['sentiment_score'] = df['sentiment'].map({'NEGATIVE': -1, 'NEUTRAL': 0, 'POSITIVE': 1})

# --- Average Sentiment Metric ---
avg_score = df['sentiment_score'].mean()
st.metric("Average Sentiment Score", round(avg_score, 2))

# --- Overall Sentiment Pie Chart ---
fig_pie = px.pie(
    df, 
    names='sentiment', 
    title='Overall Sentiment Distribution',
    color='sentiment',
    color_discrete_map={'NEGATIVE':'red', 'NEUTRAL':'orange', 'POSITIVE':'green'}
)
st.plotly_chart(fig_pie, use_container_width=True)

# --- Sentiment Over Time Stacked Bar Chart ---
time_series = df.groupby(pd.Grouper(key='created_utc', freq='H'))['sentiment'].value_counts().unstack().fillna(0)
time_series = time_series[['NEGATIVE','NEUTRAL','POSITIVE']]  # consistent order
fig_bar = px.bar(
    time_series,
    x=time_series.index,
    y=['NEGATIVE','NEUTRAL','POSITIVE'],
    title=f"Sentiment Over Time for r/{selected_subreddit}",
    labels={'value':'Post Count', 'created_utc':'Time'},
    color_discrete_map={'NEGATIVE':'red', 'NEUTRAL':'orange', 'POSITIVE':'green'}
)
st.plotly_chart(fig_bar, use_container_width=True)

# --- Show raw data ---
if st.checkbox("Show raw data"):
    st.write(df.head(20))

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
