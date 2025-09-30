"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    solana?: any;
  }
}

export default function WalletControls({
  onSubscriptionChange,
}: {
  onSubscriptionChange?: (hasSubscription: boolean) => void;
}) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Restore wallet from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");
    if (saved) {
      setWallet(saved);
      checkSubscription(saved);
    }
  }, []);

  // Phantom connect
  const connectWallet = async () => {
    try {
      const resp = await window.solana.connect();
      const address = resp.publicKey.toString();
      setWallet(address);
      localStorage.setItem("walletAddress", address);
      await checkSubscription(address);
    } catch (err) {
      console.error("Wallet connect failed:", err);
    }
  };

  // Phantom disconnect
  const disconnectWallet = () => {
    setWallet(null);
    setHasSubscription(false);
    localStorage.removeItem("walletAddress");
  };

  // Check subscription from backend
  const checkSubscription = async (address: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/check-subscription/${address}`
      );
      const data = await res.json();
      setHasSubscription(data.hasSubscription);
      onSubscriptionChange?.(data.hasSubscription);
    } catch (err) {
      console.error("Check subscription failed:", err);
    }
  };

  // Mint subscription NFT
  const upgrade = async () => {
    if (!wallet) return;
    try {
      const res = await fetch("http://localhost:4000/mint-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log("Upgrade result:", data);
      await checkSubscription(wallet);
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {wallet ? (
        <>
          <span className="text-sm">Wallet: {wallet.slice(0, 6)}...</span>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Disconnect
          </button>
          {!hasSubscription && (
            <button
              onClick={upgrade}
              className="px-3 py-1 bg-purple-600 text-white rounded"
            >
              Upgrade
            </button>
          )}
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Connect Phantom
        </button>
      )}
    </div>
  );
}
