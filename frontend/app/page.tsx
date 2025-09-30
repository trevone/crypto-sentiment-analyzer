"use client";

import React, { useEffect, useState, useCallback } from "react";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

const API_BASE = "http://localhost:4000";

export default function HomePage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore wallet on refresh
  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) {
      setWallet(stored);
      checkSubscription(stored);
    }
  }, []);

  // Connect Phantom
  const connectWallet = useCallback(async () => {
    try {
      const provider = window.solana;
      if (!provider?.isPhantom) {
        setError("Phantom not installed.");
        return;
      }
      const res = await provider.connect();
      const address = res.publicKey.toString();
      setWallet(address);
      localStorage.setItem("walletAddress", address);
      await checkSubscription(address);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // Disconnect Phantom
  const disconnectWallet = useCallback(async () => {
    try {
      await window.solana?.disconnect?.();
    } catch (_) {
      /* ignore */
    }
    setWallet(null);
    setHasSubscription(null);
    localStorage.removeItem("walletAddress");
  }, []);

  // Check subscription from backend
  const checkSubscription = useCallback(async (address: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/check-subscription/${address}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHasSubscription(data.hasSubscription);
    } catch (e: any) {
      setError(e.message);
      setHasSubscription(null);
    }
  }, []);

  // Handle upgrade (mint subscription NFT)
  const handleUpgrade = async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API_BASE}/mint-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Mint failed");
      alert(`Subscription NFT minted! Explorer: ${json.explorerUrl}`);
      setHasSubscription(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col gap-6 items-center">
      <h1 className="text-2xl font-bold">Crypto Sentiment App</h1>

      {/* Wallet Controls */}
      {wallet ? (
        <div className="flex gap-2 items-center">
          <span className="px-3 py-1 rounded bg-green-100 text-green-700">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Connect Phantom
        </button>
      )}

      {/* Subscription Status */}
      {wallet && (
        <div className="p-4 border rounded w-full max-w-md text-center">
          {hasSubscription === null && "Checking subscription..."}
          {hasSubscription === true && "✅ Paid Tier Active"}
          {hasSubscription === false && (
            <>
              ❌ Free Tier <br />
              <button
                onClick={handleUpgrade}
                className="mt-2 inline-block px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600"
              >
                Upgrade (Mint NFT)
              </button>
            </>
          )}
        </div>
      )}

      {/* Link to chart/subreddit page */}
      <a
        href="/CryptoCurrency"
        className="mt-4 inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Go to Charts
      </a>

      {error && <div className="text-red-600 text-sm">Error: {error}</div>}
    </main>
  );
}
