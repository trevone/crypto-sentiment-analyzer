// blockchain/routes/mint.js
import express from "express";
import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";

const router = express.Router();
const connection = new Connection(clusterApiUrl("devnet"));

// Load local Solana CLI identity (authority, not the payer)
const secret = JSON.parse(
  fs.readFileSync(`${process.env.HOME}/.config/solana/id.json`, "utf-8")
);
const secretKey = Uint8Array.from(secret);
const identity = Keypair.fromSecretKey(secretKey);

// Initialize Metaplex with backend identity
const metaplex = Metaplex.make(connection).use(keypairIdentity(identity));

// ✅ Your deployed Candy Machine ID (from sugar/collection/cache.json)
const CANDY_MACHINE_ID = new PublicKey(
  "92yg51De5DwXfniRAfBNRjGq89RPmfEyPL6nVw8MCSJs"
);

router.post("/", async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Missing wallet" });

    const buyer = new PublicKey(wallet);

    // Load candy machine
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: CANDY_MACHINE_ID });

    // Build mint transaction
    const builder = await metaplex.candyMachines().builders().mint({
      candyMachine,
      payer: buyer,
      newOwner: buyer,
    });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const transaction = builder.toTransaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: buyer,
    });

    console.log("📝 Transaction instructions:", transaction.instructions.length);
    console.log("📝 Fee payer:", transaction.feePayer?.toBase58());

    // Ensure no missing signer slots
    transaction.signatures = transaction.signatures.map((sig) => {
      if (!sig.publicKey) {
        return { ...sig, publicKey: buyer };
      }
      return sig;
    });

    // Serialize unsigned tx for Phantom
    const serialized = transaction.serialize({ requireAllSignatures: false });
    const base64Tx = serialized.toString("base64");

    res.json({ tx: base64Tx });
  } catch (err) {
    console.error("❌ Mint error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
