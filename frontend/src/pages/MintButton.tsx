"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { useState } from "react";

export default function MintButton() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    if (!publicKey) {
      alert("Connect Phantom first");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toBase58() }),
      });

      const { tx } = await res.json();
      if (!tx) throw new Error("No transaction returned from backend");

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const transaction = Transaction.from(Buffer.from(tx, "base64"));

      // Phantom signs the transaction
      const signed = await signTransaction(transaction);
      const sig = await connection.sendRawTransaction(signed.serialize());

      console.log("✅ Mint tx signature:", sig);
      alert(`Minted! Tx: ${sig}`);
    } catch (err: any) {
      console.error("❌ Mint failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: "#512da8",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      {loading ? "Minting..." : "Mint NFT"}
    </button>
  );
}
