// routes/mint.js
import express from "express";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const router = express.Router();

// --- CONFIG ---
const RPC_URL = clusterApiUrl("devnet"); // or your own RPC provider
const CANDY_MACHINE_ID = new PublicKey("92yg51De5DwXfniRAfBNRjGq89RPmfEyPL6nVw8MCSJs");

// Setup connection + Metaplex
const connection = new Connection(RPC_URL, "confirmed");
const metaplex = Metaplex.make(connection);

// --- ROUTE ---
// POST /mint { "wallet": "<user_pubkey>" }
router.post("/", async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet) {
      return res.status(400).json({ error: "Missing wallet address" });
    }

    const buyer = new PublicKey(wallet);

    // Fetch Candy Machine
    const candyMachine = await metaplex.candyMachines().findByAddress({
      address: CANDY_MACHINE_ID,
    });

    // Build mint transaction (unsigned)
    const { transaction } = await metaplex.candyMachines().builders().mint({
      candyMachine,
      payer: buyer,
    });

    // Send tx back to frontend as base64
    res.json({
      tx: transaction.serialize({ requireAllSignatures: false }).toString("base64"),
    });
  } catch (err) {
    console.error("❌ Mint error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
