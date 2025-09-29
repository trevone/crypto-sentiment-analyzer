"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    solana?: any;
    ethereum?: any & { providers?: any[] };
    phantom?: { ethereum?: any };
  }
}

type Chain = "solana" | "evm";

function getPhantomEvmProvider(): any | null {
  const eth = typeof window !== "undefined" ? window.ethereum : null;
  if (eth?.providers?.length) {
    return eth.providers.find((prov: any) => prov?.isPhantom) || null;
  }
  if (window.phantom?.ethereum) return window.phantom.ethereum;
  if (eth?.isPhantom) return eth;
  return null;
}

export default function WalletButtons() {
  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<Chain | null>(null);
  const [showChooser, setShowChooser] = useState(false);

  // restore session
  useEffect(() => {
    try {
      const saved = localStorage.getItem("phantom_conn");
      if (saved) {
        const { address, chain } = JSON.parse(saved);
        if (address && chain) {
          setAddress(address);
          setChain(chain);
        }
      }
    } catch {}
  }, []);

  const persist = (addr: string, which: Chain) => {
    setAddress(addr);
    setChain(which);
    localStorage.setItem("phantom_conn", JSON.stringify({ address: addr, chain: which }));
  };

  const connect = async () => {
    const hasSol = !!window.solana?.isPhantom;
    const hasEvm = !!getPhantomEvmProvider();
    if (hasSol && hasEvm) {
      setShowChooser(true);
      return;
    }
    if (hasSol) return connectSol();
    if (hasEvm) return connectEvm();
    alert("Phantom not detected. Install Phantom with Solana/EVM support enabled.");
  };

  const connectSol = async () => {
    setShowChooser(false);
    try {
      const resp = await window.solana.connect({ onlyIfTrusted: false });
      persist(resp.publicKey.toString(), "solana");
    } catch (err) {
      console.error("Phantom Solana connect error:", err);
    }
  };

  const connectEvm = async () => {
    setShowChooser(false);
    try {
      const provider = getPhantomEvmProvider();
      if (!provider) {
        alert("Phantom EVM provider not found.");
        return;
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) persist(accounts[0], "evm");
    } catch (err) {
      console.error("Phantom EVM connect error:", err);
    }
  };

  const disconnect = async () => {
    try {
      if (chain === "solana" && window.solana?.disconnect) {
        await window.solana.disconnect().catch(() => {});
      }
      // no true EVM disconnect, just clear
    } finally {
      setAddress(null);
      setChain(null);
      localStorage.removeItem("phantom_conn");
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {address ? (
        <>
          <span className="px-3 py-2 rounded bg-gray-100">
            Phantom {chain?.toUpperCase()} • {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <button
            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <button
            className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700"
            onClick={connect}
          >
            Connect Phantom
          </button>
          {showChooser && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={connectSol}
              >
                Solana
              </button>
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={connectEvm}
              >
                EVM
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
