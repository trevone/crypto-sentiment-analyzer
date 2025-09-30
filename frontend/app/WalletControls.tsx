"use client";

import { useContext } from "react";
import { WalletContext } from "./WalletContext";

export default function WalletControls() {
  const {
    wallet,
    hasSubscription,
    connectWallet,
    disconnectWallet,
  } = useContext(WalletContext);

  const handleUpgrade = async () => {
    if (!wallet) {
      alert("Connect your wallet first.");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/mint-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet }),
      });
      const json = await res.json();
      if (res.ok) {
        alert(`Subscription NFT minted! Explorer: ${json.explorerUrl}`);
      } else {
        alert("Mint failed: " + json.error);
      }
    } catch (err: any) {
      alert("Upgrade error: " + err.message);
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Phantom</button>
      ) : (
        <>
          <span style={{ marginRight: "1rem" }}>
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </span>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      )}

      {wallet && !hasSubscription && (
        <button onClick={handleUpgrade} style={{ marginLeft: "1rem" }}>
          Upgrade (Mint Subscription NFT)
        </button>
      )}
    </div>
  );
}
