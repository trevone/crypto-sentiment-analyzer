// frontend/src/components/WalletControls.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import MintButton from "./MintButton";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function WalletControls() {
  const { publicKey } = useWallet();
  const [hydrated, setHydrated] = useState(false);
  const [hasSub, setHasSub] = useState<boolean | null>(null);

  // ✅ mark when client hydration is complete
  useEffect(() => {
    setHydrated(true);
  }, []);

  // ✅ check subscription after hydration & wallet connect
  useEffect(() => {
    if (!hydrated || !publicKey) {
      setHasSub(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${BACKEND}/api/check-subscription/${publicKey.toBase58()}`
        );
        const json = await res.json();
        setHasSub(!!json?.hasSubscription);
      } catch (e) {
        console.error("❌ Subscription check failed:", e);
        setHasSub(null);
      }
    })();
  }, [publicKey, hydrated]);

  // ✅ Prevent SSR/CSR mismatch
  if (!hydrated) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <WalletMultiButton />
      {publicKey && (
        <>
          {hasSub !== null && (
            <span>{hasSub ? "✅ Subscription active" : "❌ No subscription"}</span>
          )}
          <MintButton />
        </>
      )}
    </div>
  );
}
