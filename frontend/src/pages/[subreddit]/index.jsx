import SubredditClient from "./SubredditClient";
import WalletControls from "../WalletControls"; // shared component

// Next.js Pages Router doesn't use { params } like the App Router.
// Instead, you receive query via getInitialProps or router.
import { useRouter } from "next/router";

export default function SubredditPage() {
  const router = useRouter();
  const { subreddit } = router.query; // e.g. /bitcoin -> subreddit = "bitcoin"

  if (!subreddit || typeof subreddit !== "string") {
    return <p>Loading subreddit…</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      {/* Wallet connect + upgrade controls */}
      <WalletControls />

      {/* Subreddit-specific content */}
      <SubredditClient subreddit={subreddit} />
    </div>
  );
}
