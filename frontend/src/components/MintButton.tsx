"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { publicKey, generateSigner, transactionBuilder } from "@metaplex-foundation/umi";
import { mplCandyMachine, mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";

const RPC = process.env.NEXT_PUBLIC_RPC || "https://api.devnet.solana.com";
const CANDY_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!;
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT!;
const COLLECTION_UPDATE_AUTH = process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTHORITY!;

export default function MintButton() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onMint = useCallback(async () => {
    if (!connected || !wallet?.adapter) return;
    setLoading(true);
    setErr(null);
    setTxSig(null);

    try {
      const umi = createUmi(RPC)
        .use(walletAdapterIdentity(wallet.adapter))
        .use(mplCandyMachine());

      const candyMachine = publicKey(CANDY_ID);
      const collectionMint = publicKey(COLLECTION_MINT);
      const collectionUpdateAuthority = publicKey(COLLECTION_UPDATE_AUTH);

      // New mint address the program will create.
      const nftMint = generateSigner(umi);

      const tx = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine,
            nftMint,
            collectionMint,
            collectionUpdateAuthority,
            // If you add guards that require args (e.g. solPayment), pass mintArgs here.
          })
        );

      const sig = await tx.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
      setTxSig(sig);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [connected, wallet]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <button disabled={!connected || loading} onClick={onMint}>
        {loading ? "Minting…" : "Mint Subscription NFT"}
      </button>
      {txSig && (
        <a
          href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
        >
          View tx
        </a>
      )}
      {err && <span style={{ color: "red" }}>Mint failed: {err}</span>}
    </div>
  );
}
