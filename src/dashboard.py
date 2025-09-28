import os
import pandas as pd
import streamlit as st
from dotenv import load_dotenv

from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment

import plotly.graph_objects as go
from datetime import datetime

# -------- ENV --------
load_dotenv(dotenv_path='/opt/crypto-sentiment-analyzer/.env')

DATA_PROCESSED = "/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv"

# -------- UI --------
st.set_page_config(page_title="Crypto Sentiment Dashboard", layout="wide")
st.title("Crypto Sentiment Analyzer Dashboard")
st.markdown("Visualizing Reddit sentiment for cryptocurrencies")

subreddits = ["CryptoCurrency", "Bitcoin", "CryptoMarkets", "ethtrader"]
selected_subreddit = st.selectbox("Select Subreddit", subreddits)

# -------- REFRESH --------
if st.button("Refresh Data"):
    st.info(f"Updating from r/{selected_subreddit}...")
    import subprocess
    subprocess.run(
        ["/root/miniconda3/envs/crypto_sentiment/bin/python",
         "/opt/crypto-sentiment-analyzer/src/update_data.py",
         selected_subreddit, "100"],
        check=True
    )
    st.success("Data refreshed!")

# -------- LOAD DATA --------
if not os.path.exists(DATA_PROCESSED):
    st.warning("No processed data found yet. Click **Refresh Data** to fetch posts.")
    st.stop()

df = pd.read_csv(DATA_PROCESSED)

# Guard rails
for col in ["id", "title", "selftext", "created_utc", "sentiment"]:
    if col not in df.columns:
        df[col] = "" if col in ["title", "selftext"] else None

if "url" not in df.columns:
    df["url"] = "#"

# Time conversion
df["created_utc"] = pd.to_datetime(df["created_utc"], unit="s", errors="coerce")

# ---- Optional raw preview
with st.expander("Show raw data (first 20 rows)"):
    st.dataframe(df.head(20))

# -------- COLORS --------
COLORS = {"NEGATIVE": "red", "NEUTRAL": "orange", "POSITIVE": "green"}
ordered = ["NEGATIVE", "NEUTRAL", "POSITIVE"]

# -------- SENTIMENT DISTRIBUTION (BAR) --------
st.subheader(f"Sentiment Distribution for r/{selected_subreddit}")

counts = df["sentiment"].value_counts()
# Ensure all categories exist
counts = counts.reindex(ordered, fill_value=0)

bar_fig = go.Figure()
bar_fig.add_trace(go.Bar(
    x=counts.index.tolist(),
    y=counts.values.tolist(),
    marker_color=[COLORS[s] for s in counts.index.tolist()],
    hovertemplate="Sentiment=%{x}<br>Count=%{y}<extra></extra>"
))
bar_fig.update_layout(
    xaxis_title="Sentiment",
    yaxis_title="Count",
    title=f"Sentiment Distribution for r/{selected_subreddit}",
    bargap=0.2,
)
st.plotly_chart(bar_fig, use_container_width=True)

# -------- TOP POSTS --------
st.subheader("Top Posts by Sentiment")

left, right = st.columns(2)

with left:
    st.markdown("**Top 5 Positive Posts**")
    top_pos = df[df["sentiment"] == "POSITIVE"].head(5)
    if top_pos.empty:
        st.write("No positive posts found.")
    else:
        for _, row in top_pos.iterrows():
            title = row.get("title", "No Title")
            url = row.get("url", "#")
            st.markdown(f"- {title} ([link]({url}))")

with right:
    st.markdown("**Top 5 Negative Posts**")
    top_neg = df[df["sentiment"] == "NEGATIVE"].head(5)
    if top_neg.empty:
        st.write("No negative posts found.")
    else:
        for _, row in top_neg.iterrows():
            title = row.get("title", "No Title")
            url = row.get("url", "#")
            st.markdown(f"- {title} ([link]({url}))")

# -------- SENTIMENT OVER TIME (LINE) --------
st.subheader(f"Sentiment Over Time for r/{selected_subreddit}")

# Group by hour and sentiment
ts = (
    df.dropna(subset=["created_utc"])
      .groupby(pd.Grouper(key="created_utc", freq="H"))["sentiment"]
      .value_counts()
      .unstack()
      .fillna(0)
)

# Ensure all columns present and ordered
for s in ordered:
    if s not in ts.columns:
        ts[s] = 0
ts = ts[ordered]
ts = ts.reset_index()  # created_utc becomes column for plotting

time_fig = go.Figure()
for s in ordered:
    time_fig.add_trace(go.Scatter(
        x=ts["created_utc"],
        y=ts[s],
        name=s,
        mode="lines+markers",
        line=dict(color=COLORS[s]),
        hovertemplate="Time=%{x}<br>Count=%{y}<extra></extra>"
    ))
time_fig.update_layout(
    xaxis_title="Time (hourly)",
    yaxis_title="Post Count",
    legend_title="Sentiment"
)
st.plotly_chart(time_fig, use_container_width=True)
