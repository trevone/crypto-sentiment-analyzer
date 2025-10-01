"use client";

import { createContext, useState, useEffect } from "react";

interface WalletContextType {
  publicKey: string | null;
  hasSubscription: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshSubscription: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  hasSubscription: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshSubscription: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    // @ts-ignore
    const provider = window.solana;
    if (!provider?.isPhantom) {
      alert("Phantom Wallet not found. Please install it.");
      return;
    }
    const resp = await provider.connect();
    setPublicKey(resp.publicKey.toString());
    localStorage.setItem("walletAddress", resp.publicKey.toString());
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    // @ts-ignore
    if (window.solana?.disconnect) {
      // @ts-ignore
      window.solana.disconnect();
    }
    setPublicKey(null);
    setHasSubscription(false);
    localStorage.removeItem("walletAddress");
  };

  // Check subscription
  const refreshSubscription = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`http://localhost:4000/api/check-subscription/${publicKey}`);
      if (!res.ok) throw new Error("Subscription check failed");
      const json = await res.json();
      setHasSubscription(json.hasSubscription === true);
    } catch (err) {
      console.error("Subscription check error:", err);
      setHasSubscription(false);
    }
  };

  // Restore wallet from localStorage or Phantom event
  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setPublicKey(savedWallet);
      refreshSubscription();
    }

    // @ts-ignore
    const provider = window.solana;
    if (provider?.isPhantom) {
      provider.on("connect", (pubkey: any) => {
        setPublicKey(pubkey.toString());
        localStorage.setItem("walletAddress", pubkey.toString());
        refreshSubscription();
      });
      provider.on("disconnect", () => {
        disconnectWallet();
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ publicKey, hasSubscription, connectWallet, disconnectWallet, refreshSubscription }}
    >
      {children}
    </WalletContext.Provider>
  );
}
