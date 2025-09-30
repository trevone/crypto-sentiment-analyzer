"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  wallet: string | null;
  hasSubscription: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkSubscription: (address: string) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  wallet: null,
  hasSubscription: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  checkSubscription: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  // 🔄 restore on refresh
  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) {
      setWallet(stored);
      checkSubscription(stored);
    }
  }, []);

  // connect Phantom
  const connectWallet = async () => {
    try {
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        alert("Phantom Wallet not found!");
        return;
      }
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      setWallet(address);
      localStorage.setItem("walletAddress", address);
      await checkSubscription(address);
    } catch (err) {
      console.error("Wallet connect failed:", err);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setHasSubscription(false);
    localStorage.removeItem("walletAddress");
  };

  const checkSubscription = async (address: string) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/check-subscription/${address}`
      );
      if (!res.ok) throw new Error("Failed to check subscription");
      const json = await res.json();
      setHasSubscription(json.hasSubscription);
    } catch (err) {
      console.error("Check subscription failed:", err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        hasSubscription,
        connectWallet,
        disconnectWallet,
        checkSubscription,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
