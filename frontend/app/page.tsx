"use client";

import WalletButtons from "../components/WalletButtons";
import Link from "next/link";
import { useUser } from "./providers";

export default function HomePage() {
  const { paid } = useUser();

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Crypto Sentiment Analyzer</h1>

      {/* Phantom wallet connect/disconnect */}
      <WalletButtons />

      {/* Free and Paid tier navigation */}
      <div className="space-x-4">
        <Link
          href="/CryptoCurrency"
          className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Open Free Tier (r/CryptoCurrency)
        </Link>

        {paid && (
          <Link
            href="/Bitcoin"
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Try Paid Tier (r/Bitcoin)
          </Link>
        )}
      </div>
    </main>
  );
}
