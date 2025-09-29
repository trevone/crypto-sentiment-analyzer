"use client";
import { useUser } from "../app/providers";

export default function WalletButtons() {
  const { wallet, walletType, connect, disconnect } = useUser();

  return (
    <div className="flex gap-4">
      {/* Phantom */}
      <button
        onClick={() =>
          walletType === "phantom-sol" ? disconnect() : connect("phantom-sol")
        }
        className="px-4 py-2 rounded bg-purple-600 text-white"
      >
        {walletType === "phantom-sol"
          ? `Disconnect ${wallet?.slice(0, 6)}...`
          : "Connect Phantom"}
      </button>

      {/* MetaMask */}
      <button
        onClick={() =>
          walletType === "metamask" ? disconnect() : connect("metamask")
        }
        className="px-4 py-2 rounded bg-orange-500 text-white"
      >
        {walletType === "metamask"
          ? `Disconnect ${wallet?.slice(0, 6)}...`
          : "Connect MetaMask"}
      </button>
    </div>
  );
}
