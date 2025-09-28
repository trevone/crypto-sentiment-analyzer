#!/usr/bin/env python3
import os
import pandas as pd
from transformers import pipeline
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

DATA_RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
DATA_PROCESSED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
RAW_CSV_FILE = os.path.join(DATA_RAW_PATH, "cryptocurrency_posts.csv")
PROCESSED_CSV_FILE = os.path.join(DATA_PROCESSED_PATH, "crypto_posts_with_sentiment.csv")

os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)

# Initialize sentiment pipeline
sentiment_analyzer = pipeline("sentiment-analysis")

def analyze_sentiment(text):
    text = str(text)
    if not text.strip():
        return "NEUTRAL"
    
    max_len = 512
    chunks = [text[i:i+max_len] for i in range(0, len(text), max_len)]
    sentiments = [sentiment_analyzer(chunk, truncation=True, max_length=max_len)[0]["label"].upper() for chunk in chunks]
    
    # Simplest aggregation: if any NEGATIVE → NEGATIVE, else POSITIVE, else NEUTRAL
    if "NEGATIVE" in sentiments:
        return "NEGATIVE"
    elif "POSITIVE" in sentiments:
        return "POSITIVE"
    else:
        return "NEUTRAL"

def main():
    df = pd.read_csv(RAW_CSV_FILE)
    
    # Compute sentiment
    df["sentiment"] = df["selftext"].apply(analyze_sentiment)
    
    # Ensure all original columns are preserved, including 'url'
    df.to_csv(PROCESSED_CSV_FILE, index=False)
    print(f"[{pd.Timestamp.now()}] Saved sentiment results to {PROCESSED_CSV_FILE}")

if __name__ == "__main__":
    main()
