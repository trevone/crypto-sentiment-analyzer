"use client";

export default function WalletDebug() {
  async function connectPhantom() {
    try {
      const solana = (window as any).solana;
      if (!solana?.isPhantom) {
        alert("Phantom not found");
        return;
      }
      const resp = await solana.connect({ onlyIfTrusted: false });
      alert("Phantom connected: " + resp.publicKey.toString());
    } catch (e) {
      console.error(e);
    }
  }

  async function connectMetaMask() {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum?.isMetaMask) {
        alert("MetaMask not found");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      alert("MetaMask connected: " + accounts[0]);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-8 flex flex-col gap-4">
      <button onClick={connectPhantom} className="px-4 py-2 bg-purple-600 text-white rounded">
        Test Phantom
      </button>
      <button onClick={connectMetaMask} className="px-4 py-2 bg-orange-500 text-white rounded">
        Test MetaMask
      </button>
    </div>
  );
}
