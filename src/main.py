from reddit_scraper import fetch_posts
from sentiment_model import analyze_sentiment

def run_pipeline():
    print("Fetching Reddit posts...")
    fetch_posts()
    print("Analyzing sentiment...")
    analyze_sentiment()
    print("Pipeline complete!")

if __name__ == "__main__":
    run_pipeline()
