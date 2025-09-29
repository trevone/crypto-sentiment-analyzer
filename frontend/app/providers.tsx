"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

type WalletType = "phantom-sol" | "metamask" | "phantom-evm" | null;

interface UserContextType {
  wallet: string | null;
  walletType: WalletType;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  paid: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function short(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function getEvmProvider(kind: "metamask" | "phantom-evm") {
  const w = window as any;
  const candidates: any[] = [];
  if (w.ethereum?.providers?.length) candidates.push(...w.ethereum.providers);
  if (w.ethereum) candidates.push(w.ethereum);
  // Phantom EVM may also expose a dedicated handle here:
  if (w.phantom?.ethereum) candidates.push(w.phantom.ethereum);

  if (kind === "metamask") return candidates.find((p) => p?.isMetaMask) || null;
  if (kind === "phantom-evm") return candidates.find((p) => p?.isPhantom) || null;
  return null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);

  // keep references to bound providers for events
  const evmProviderRef = useRef<any>(null);

  // ---------- restore on load (only the last explicitly selected type) ----------
  useEffect(() => {
    const savedType = (localStorage.getItem("walletType") as WalletType) || null;

    (async () => {
      try {
        if (savedType === "phantom-sol" && (window as any).solana?.isPhantom) {
          const resp = await (window as any).solana.connect({ onlyIfTrusted: true });
          if (resp?.publicKey) {
            setWallet(resp.publicKey.toString());
            setWalletType("phantom-sol");
            return;
          }
        }

        if (savedType === "metamask") {
          const mm = getEvmProvider("metamask");
          if (mm) {
            const accts = await mm.request({ method: "eth_accounts" });
            if (Array.isArray(accts) && accts[0]) {
              evmProviderRef.current = mm;
              setWallet(accts[0]);
              setWalletType("metamask");
              return;
            }
          }
        }

        if (savedType === "phantom-evm") {
          const phEvm = getEvmProvider("phantom-evm");
          if (phEvm) {
            const accts = await phEvm.request({ method: "eth_accounts" });
            if (Array.isArray(accts) && accts[0]) {
              evmProviderRef.current = phEvm;
              setWallet(accts[0]);
              setWalletType("phantom-evm");
              return;
            }
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // ---------- connect ----------
  const connect = async (type: WalletType) => {
    try {
      // Clear current app state first (single active wallet UX)
      setWallet(null);
      setWalletType(null);
      evmProviderRef.current = null;

      if (type === "phantom-sol") {
        const sol = (window as any).solana;
        if (!sol?.isPhantom) return alert("Phantom (Solana) not found");
        const resp = await sol.connect({ onlyIfTrusted: false });
        setWallet(resp.publicKey.toString());
        setWalletType("phantom-sol");
        localStorage.setItem("walletType", "phantom-sol");
        return;
      }

      if (type === "metamask") {
        const mm = getEvmProvider("metamask");
        if (!mm) return alert("MetaMask not found");
        // encourage permission UI (may show chooser / manage connections)
        await mm.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accts = await mm.request({ method: "eth_requestAccounts" });
        if (!Array.isArray(accts) || !accts[0]) throw new Error("No account chosen");
        evmProviderRef.current = mm;
        setWallet(accts[0]);
        setWalletType("metamask");
        localStorage.setItem("walletType", "metamask");
        return;
      }

      if (type === "phantom-evm") {
        const phEvm = getEvmProvider("phantom-evm");
        if (!phEvm) return alert("Phantom EVM provider not found");
        // similar prompt for Phantom EVM
        try {
          await phEvm.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch {
          // some versions don’t implement this; fine to ignore
        }
        const accts = await phEvm.request({ method: "eth_requestAccounts" });
        if (!Array.isArray(accts) || !accts[0]) throw new Error("No account chosen");
        evmProviderRef.current = phEvm;
        setWallet(accts[0]);
        setWalletType("phantom-evm");
        localStorage.setItem("walletType", "phantom-evm");
        return;
      }

      alert("Unsupported wallet type");
    } catch (err) {
      console.error("Wallet connect error:", err);
      alert("Failed to connect wallet");
    }
  };

  // ---------- provider event syncing (EVM) ----------
  useEffect(() => {
    const p = evmProviderRef.current;
    if (!p) return;

    const onAccountsChanged = (accts: string[]) => {
      if (!accts || accts.length === 0) {
        // user disconnected in the wallet UI
        setWallet(null);
        setWalletType(null);
        localStorage.removeItem("walletType");
      } else {
        setWallet(accts[0]);
      }
    };
    const onDisconnect = () => {
      setWallet(null);
      setWalletType(null);
      localStorage.removeItem("walletType");
    };

    p.on?.("accountsChanged", onAccountsChanged);
    p.on?.("disconnect", onDisconnect);

    return () => {
      p.removeListener?.("accountsChanged", onAccountsChanged);
      p.removeListener?.("disconnect", onDisconnect);
    };
  }, [walletType]);

  // ---------- disconnect ----------
  const disconnect = async () => {
    try {
      if (walletType === "phantom-sol" && (window as any).solana?.disconnect) {
        await (window as any).solana.disconnect();
      }
      // For MetaMask / Phantom EVM: no programmatic revoke. We just clear state.
      // (Users can revoke site access in the extension if they want.)
    } catch (err) {
      console.warn("Error during disconnect:", err);
    }
    evmProviderRef.current = null;
    setWallet(null);
    setWalletType(null);
    localStorage.removeItem("walletType");
  };

  const value = useMemo<UserContextType>(
    () => ({
      wallet,
      walletType,
      connect,
      disconnect,
      paid: !!wallet,
    }),
    [wallet, walletType]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
