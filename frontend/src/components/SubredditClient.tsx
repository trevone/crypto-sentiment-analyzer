"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
interface ApiResponse {
  distribution: Partial<Record<SentimentLabel, number>>;
  posts: { id: string; title: string; url: string; sentiment: SentimentLabel }[];
}

const COLORS: Record<SentimentLabel, string> = {
  POSITIVE: "#28a745",
  NEGATIVE: "#dc3545",
  NEUTRAL: "#6c757d",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SubredditClient({ subreddit }: { subreddit: string }) {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // free vs paid selection can be layered later; keep basic
  const SUBREDDITS = ["CryptoCurrency", "Bitcoin", "Ethereum"];

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`${API}/api/sentiment/${encodeURIComponent(subreddit)}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = (await res.json()) as ApiResponse;
        if (!aborted) setData(json);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Failed to load");
      }
    })();
    return () => {
      aborted = true;
    };
  }, [subreddit]);

  if (error) return <p style={{ color: "red" }}>Failed to load: {error}</p>;
  if (!data) return <p>Loading…</p>;

  const LABELS: SentimentLabel[] = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const values = LABELS.map((l) => data.distribution[l] ?? 0);
  const colors = LABELS.map((l) => COLORS[l]);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Select subreddit: </label>
        <select
          value={subreddit}
          onChange={(e) => router.push(`/${encodeURIComponent(e.target.value)}`)}
        >
          {SUBREDDITS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <h2>Sentiment for r/{subreddit}</h2>

      <div style={{ maxWidth: 520 }}>
        <Plot
          data={[
            {
              type: "pie",
              labels: LABELS,
              values,
              hole: 0.4,
              marker: { colors },
              textinfo: "label+percent",
              hovertemplate: "%{label}: %{value} posts<extra></extra>",
            } as any,
          ]}
          layout={{
            title: "Sentiment Distribution",
            height: 380,
            width: 520,
            margin: { t: 40, r: 10, b: 10, l: 10 },
          }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      <h3 style={{ marginTop: "1rem" }}>Latest Posts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.posts.map((post) => (
          <li
            key={post.id}
            style={{
              marginBottom: 8,
              padding: 8,
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            <a href={post.url} target="_blank" rel="noopener noreferrer">
              {post.title}
            </a>
            <span
              style={{
                marginLeft: 8,
                padding: "2px 6px",
                borderRadius: 4,
                background: COLORS[post.sentiment] || "#6c757d",
                color: "#fff",
                fontSize: 12,
              }}
            >
              {post.sentiment}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
