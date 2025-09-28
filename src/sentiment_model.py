import pandas as pd
from transformers import pipeline
from dotenv import load_dotenv
import os

# Load environment variables (needed if any API keys for HF)
load_dotenv()

RAW_CSV_PATH = "/opt/crypto-sentiment-analyzer/data/raw/crypto_posts.csv"
PROCESSED_CSV_PATH = "/opt/crypto-sentiment-analyzer/data/processed/crypto_posts_with_sentiment.csv"

def analyze_sentiment(input_csv="data/raw/crypto_posts.csv", output_csv="data/processed/crypto_posts_with_sentiment.csv"):
    df = pd.read_csv(input_csv)
    sentiment_analyzer = pipeline("sentiment-analysis")
    df["sentiment"] = df["post_text"].apply(lambda x: sentiment_analyzer(x)[0]["label"])
    df.to_csv(output_csv, index=False)
    return df

def run_sentiment():
    try:
        df = pd.read_csv(RAW_CSV_PATH)
        sentiment_pipeline = pipeline("sentiment-analysis")
        df['sentiment'] = df['title'].apply(lambda x: sentiment_pipeline(x)[0]['label'])
        df.to_csv(PROCESSED_CSV_PATH, index=False)
        print(f"[{pd.Timestamp.now()}] Saved sentiment results to {PROCESSED_CSV_PATH}")
    except FileNotFoundError:
        print(f"[{pd.Timestamp.now()}] WARNING: Raw CSV not found, skipping sentiment run.")
    except Exception as e:
        print(f"[{pd.Timestamp.now()}] ERROR: Sentiment model failed - {e}")

if __name__ == "__main__":
    run_sentiment()
