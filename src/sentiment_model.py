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
    # Truncate text to first 512 tokens
    max_length = 512
    result = sentiment_analyzer(text, truncation=True, max_length=max_length)[0]
    return result["label"].upper()

def main():
    df = pd.read_csv(RAW_CSV_FILE)
    
    # Compute sentiment
    df["sentiment"] = df["selftext"].apply(analyze_sentiment)
    
    # Ensure all original columns are preserved, including 'url'
    df.to_csv(PROCESSED_CSV_FILE, index=False)
    print(f"[{pd.Timestamp.now()}] Saved sentiment results to {PROCESSED_CSV_FILE}")

if __name__ == "__main__":
    main()
