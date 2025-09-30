"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    solana?: any;
  }
}

export default function PhantomButton({ onConnect }: { onConnect?: (pubkey: string) => void }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (window.solana?.isPhantom) {
      window.solana.on("connect", (publicKey: any) => {
        setWalletAddress(publicKey.toString());
        onConnect?.(publicKey.toString());
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey.toString());
      onConnect?.(resp.publicKey.toString());
    } catch (err) {
      console.error("Phantom connect error:", err);
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      {walletAddress ? `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "Connect Phantom"}
    </button>
  );
}
