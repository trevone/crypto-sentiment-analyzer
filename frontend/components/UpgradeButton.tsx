"use client";

import { useEffect, useState } from "react";

export default function UpgradeButton({ walletAddress }: { walletAddress: string | null }) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    const check = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: walletAddress }),
        });
        const data = await res.json();
        setHasSubscription(data.active);
      } catch (err) {
        console.error("Check subscription failed:", err);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [walletAddress]);

  if (!walletAddress) return null;
  if (loading) return <button disabled>Checking...</button>;

  return hasSubscription ? (
    <span className="text-green-600 font-semibold">✅ Paid Tier Active</span>
  ) : (
    <button
      onClick={async () => {
        try {
          const res = await fetch("http://localhost:4000/mint-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: walletAddress }),
          });
          const data = await res.json();
          alert(`Subscription NFT minted: ${data.mintAddress}`);
          setHasSubscription(true);
        } catch (err) {
          console.error("Upgrade failed:", err);
        }
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Upgrade to Paid Tier
    </button>
  );
}
