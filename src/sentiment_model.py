from transformers import pipeline
import pandas as pd

# Initialize sentiment analysis pipeline
def init_sentiment_pipeline():
    return pipeline('sentiment-analysis')

# Analyze sentiment of posts
def analyze_sentiment(df):
    sentiment_pipeline = init_sentiment_pipeline()
    sentiments = df['title'].apply(lambda x: sentiment_pipeline(x)[0]['label'])
    df['sentiment'] = sentiments
    return df

if __name__ == "__main__":
    df = pd.read_csv('data/raw/crypto_posts.csv')
    df = analyze_sentiment(df)
    df.to_csv('data/processed/crypto_posts_with_sentiment.csv', index=False)
