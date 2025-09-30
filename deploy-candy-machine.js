import { Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import fs from "fs";

// ------------------
// 1. Load Wallet (Windows path hardcoded)
// ------------------
const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf8")
);
const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

// ------------------
// 2. Setup Metaplex
// ------------------
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(irysStorage());

console.log("🚀 Wallet:", wallet.publicKey.toBase58());

// ------------------
// 3. Mint Collection NFT
// ------------------
const { nft: collectionNft } = await metaplex.nfts().create({
  name: "Crypto Sentiment Collection",
  symbol: "CSC",
  uri: "https://gateway.irys.xyz/C7adsy4icjeqiqVPyaQs9XCPAcxDVEZiL9diwDnZBY7t", // metadata.json for collection
  sellerFeeBasisPoints: 0,
  isCollection: true,
});

console.log("✅ Collection NFT Minted:", collectionNft.address.toBase58());

// ------------------
// 4. Upload Pass Metadata
// ------------------
const uri = "https://gateway.irys.xyz/C7adsy4icjeqiqVPyaQs9XCPAcxDVEZiL9diwDnZBY7t";
console.log("✅ Using Pre-Uploaded Metadata:", uri);

// ------------------
// 5. Create Candy Machine V3
// ------------------
const { candyMachine } = await metaplex.candyMachines().create({
  itemsAvailable: 1n,
  sellerFeeBasisPoints: 0,
  collection: collectionNft.mintAddress, // ✅ pass PublicKey directly
  symbol: "PASS",
  creators: [{ address: wallet.publicKey, share: 100 }],
});

console.log("✅ Candy Machine Created:", candyMachine.address.toBase58());

// ------------------
// 6. Insert Items
// ------------------
await metaplex.candyMachines().insertItems({
  candyMachine,
  items: [{ name: "Paid Tier Pass", uri }],
});

console.log("✅ Item Added to Candy Machine");

// ------------------
// 7. Mint From Candy Machine
// ------------------
const { nft: mintedNft } = await metaplex.candyMachines().mint({
  candyMachine,
  payer: wallet,
});

console.log("🎉 NFT Minted From Candy Machine:", mintedNft.address.toBase58());
