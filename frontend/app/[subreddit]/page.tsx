// app/[subreddit]/page.tsx
import SubredditClient from "./SubredditClient";

export default function SubredditPage({ params }: { params: { subreddit: string } }) {
  return <SubredditClient subreddit={params.subreddit} />;
}
