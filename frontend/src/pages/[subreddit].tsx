import { useRouter } from "next/router";
import WalletControls from "../components/WalletControls";
import SubredditClient from "../components/SubredditClient";

export default function SubredditPage() {
  const router = useRouter();
  const { subreddit } = router.query as { subreddit?: string };

  if (!subreddit) return null;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <WalletControls />
      <div style={{ marginTop: 16 }}>
        <SubredditClient subreddit={subreddit} />
      </div>
    </div>
  );
}
