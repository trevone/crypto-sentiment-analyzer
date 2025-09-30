// app/[subreddit]/page.tsx
import SubredditClient from "./SubredditClient";
import WalletControls from "../WalletControls"; // new shared component

export default function SubredditPage({ params }: { params: { subreddit: string } }) {
  return (
    <div>
      {/* Shared connect + upgrade controls */}
      <WalletControls />

      {/* Subreddit-specific content */}
      <SubredditClient subreddit={params.subreddit} />
    </div>
  );
}
