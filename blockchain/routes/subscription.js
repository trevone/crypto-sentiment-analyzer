// blockchain-service/routes/subscription.js
import express from "express";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const router = express.Router();
const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection);
console.log("✅ Subscription routes loaded");

// Replace with your subscription NFT collection name or symbol
const SUBSCRIPTION_SYMBOL = "PTP"; // Paid Tier Pass

// Check if a wallet holds a subscription NFT
router.get("/check-subscription/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const owner = new PublicKey(walletAddress);

    // fetch NFTs owned by this wallet
    const nfts = await metaplex.nfts().findAllByOwner({ owner });

    // check if any match your subscription NFT symbol
    const hasSubscription = nfts.some(
      (nft) =>
        nft.symbol === SUBSCRIPTION_SYMBOL ||
        nft.name.includes("Paid Tier Pass")
    );

    res.json({ wallet: walletAddress, hasSubscription });
  } catch (err) {
    console.error("❌ Error checking subscription:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
