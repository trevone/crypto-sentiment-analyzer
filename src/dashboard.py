import streamlit as st
import pandas as pd

# Load the processed data
df = pd.read_csv('data/processed/crypto_posts_with_sentiment.csv')

# Streamlit dashboard
st.title('Crypto Sentiment Analysis Dashboard')
st.write(df[['title', 'sentiment']].head())
