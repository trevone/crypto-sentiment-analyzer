"use client";

import { useState } from "react";
import PhantomButton from "./PhantomButton";
import UpgradeButton from "./UpgradeButton";

export default function WalletButtons() {
  const [wallet, setWallet] = useState<string | null>(null);

  return (
    <div className="flex gap-4">
      <PhantomButton onConnect={setWallet} />
      <UpgradeButton walletAddress={wallet} />
    </div>
  );
}
