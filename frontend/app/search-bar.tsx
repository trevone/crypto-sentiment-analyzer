// app/search-bar.tsx
"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentSubreddit = pathname.split("/")[1] || "CryptoCurrency";

  const [input, setInput] = useState(currentSubreddit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/${input.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter Subreddit: </label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button type="submit">Go</button>
    </form>
  );
}
