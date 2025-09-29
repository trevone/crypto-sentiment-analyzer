from transformers import pipeline
import torch

# Load model once at startup
device = 0 if torch.cuda.is_available() else -1
sentiment_analyzer = pipeline("sentiment-analysis", device=device)

def analyze_sentiment(posts):
    """
    Accepts: list of dicts with keys [id, title, selftext, ...]
    Returns: list of dicts with added 'sentiment'
    """
    results = []
    for post in posts:
        text = post["selftext"] or post["title"]  # fallback if no selftext
        # Truncate long texts to avoid DistilBERT 512 token error
        text = text[:500]
        result = sentiment_analyzer(text)[0]
        results.append({
            **post,
            "sentiment": result["label"],
        })
    return results
