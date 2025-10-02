"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  publicKey,
  generateSigner,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"; // ✅ use defaults bundle
import {
  mplCandyMachine,
  fetchCandyMachine,
  mintV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";

const RPC = process.env.NEXT_PUBLIC_RPC || "https://api.devnet.solana.com";
const CANDY_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!;          // e.g. Cf51Xu...
const CANDY_GUARD_ID = process.env.NEXT_PUBLIC_CANDY_GUARD_ID!;      // e.g. HkgSc7...
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT!;     // collection mint pubkey
const COLLECTION_UPDATE_AUTH = process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY!; // your authority pubkey

export default function MintButton() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleMint = async () => {
    if (!connected || !wallet) {
      setErr("Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setErr(null);
      setTxSig(null);

      // ✅ Build Umi with default program repo
      const umi = createUmi(RPC)
        .use(walletAdapterIdentity(wallet.adapter)) // pass the adapter
        .use(mplCandyMachine())
        .use(mplTokenMetadata());

      // ✅ Load CM
      const cm = await fetchCandyMachine(umi, publicKey(CANDY_ID));

      // ✅ New mint keypair
      const nftMint = generateSigner(umi);

      // ✅ Build & send tx (with correct guard)
      const sig = await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine: cm.publicKey,
            candyGuard: publicKey(CANDY_GUARD_ID),
            nftMint,
            collectionMint: publicKey(COLLECTION_MINT),
            collectionUpdateAuthority: publicKey(COLLECTION_UPDATE_AUTH),
            tokenStandard: cm.tokenStandard, // NonFungible
          })
        )
        .sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

      setTxSig(sig);
    } catch (e: any) {
      console.error("❌ Mint failed:", e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={handleMint}
        disabled={loading || !connected}
        style={{
          padding: "10px 20px",
          backgroundColor: connected ? "#4CAF50" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: connected ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      {txSig && (
        <p>
          ✅ Success:{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            View Transaction
          </a>
        </p>
      )}

      {err && <p style={{ color: "red" }}>❌ {err}</p>}
    </div>
  );
}
