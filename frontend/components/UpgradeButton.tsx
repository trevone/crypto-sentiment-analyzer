// frontend/components/UpgradeButton.tsx
"use client";
import { useUser } from "../app/providers";

export default function UpgradeButton() {
  const { paid, setPaid } = useUser();

  const connectWallet = async () => {
    // TODO: Replace with Phantom/MetaMask logic
    alert("Simulating wallet connection...");
    setPaid(true);
  };

  if (paid) return <p style={{ color: "green" }}>✅ Pro features unlocked!</p>;

  return <button onClick={connectWallet}>🔓 Upgrade to Pro</button>;
}
