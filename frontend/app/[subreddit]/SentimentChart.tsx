// app/[subreddit]/SentimentChart.tsx
"use client";
import Plot from "react-plotly.js";

export default function SentimentChart({ data }: { data: any }) {
  if (!data || !data.distribution) return <p>No data available</p>;

  const labels = Object.keys(data.distribution);
  const values = Object.values(data.distribution);

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <Plot
        data={[
          {
            values: values,
            labels: labels,
            type: "pie",
            hole: 0.4, // makes it a donut chart, can remove if you want normal pie
            textinfo: "label+percent",
            insidetextorientation: "radial",
          },
        ]}
        layout={{
          title: "Sentiment Distribution",
          autosize: true,
          margin: { t: 40, l: 20, r: 20, b: 20 },
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "400px" }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
