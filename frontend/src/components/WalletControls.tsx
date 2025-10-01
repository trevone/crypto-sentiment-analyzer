"use client";
import { useWallet, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MintButton = dynamic(() => import("./MintButton"), { ssr: false });

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function WalletControls() {
  const { publicKey } = useWallet();
  const [hasSub, setHasSub] = useState<boolean | null>(null);

  useEffect(() => {
    setHasSub(null);
  }, [publicKey?.toBase58()]);

  const checkSub = async () => {
    if (!publicKey) return;
    const res = await fetch(`${BACKEND}/api/check-subscription/${publicKey.toBase58()}`);
    const json = await res.json();
    setHasSub(!!json?.hasSubscription);
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <WalletMultiButton />
      {publicKey && (
        <>
          <button onClick={checkSub}>Check subscription</button>
          {hasSub !== null && (
            <span>{hasSub ? "✅ Subscription active" : "❌ No subscription"}</span>
          )}
          <MintButton />
        </>
      )}
    </div>
  );
}
