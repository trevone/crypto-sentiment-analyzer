from transformers import pipeline
import pandas as pd
import os

def init_sentiment_pipeline():
    return pipeline("sentiment-analysis")

def analyze_sentiment(input_csv="data/raw/crypto_posts.csv"):
    df = pd.read_csv(input_csv)
    sentiment_pipeline = init_sentiment_pipeline()
    df["sentiment"] = df["title"].apply(lambda x: sentiment_pipeline(str(x))[0]["label"])
    
    os.makedirs("data/processed", exist_ok=True)
    df.to_csv("data/processed/crypto_posts_with_sentiment.csv", index=False)
    print(f"Saved sentiment results to data/processed/crypto_posts_with_sentiment.csv")
    return df

if __name__ == "__main__":
    analyze_sentiment()
