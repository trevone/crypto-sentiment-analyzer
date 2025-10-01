import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

// Replace with your collection mint address
const COLLECTION_MINT = new PublicKey("7oAx7wm6kjiT3HRJho6E2Nwdxuebo4AGAg9rPZbjh6Gi");

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection);

(async () => {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: COLLECTION_MINT });
    console.log("✅ Collection NFT symbol:", nft.symbol);
    console.log("   Name:", nft.name);
  } catch (err) {
    console.error("❌ Error fetching NFT:", err);
  }
})();
