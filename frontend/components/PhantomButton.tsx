"use client";
import { useUser } from "../app/providers";

export default function PhantomButton() {
  const { wallet, walletType, connect, disconnect } = useUser();

  if (wallet && walletType === "phantom") {
    return (
      <button
        className="px-4 py-2 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition"
        onClick={disconnect}
      >
        Disconnect Phantom ({wallet.slice(0, 6)}…)
      </button>
    );
  }

  return (
    <button
      className="px-4 py-2 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition"
      onClick={() => connect("phantom")}
    >
      Connect Phantom
    </button>
  );
}
