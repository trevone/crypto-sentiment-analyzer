// blockchain/mint-nft.js
import fs from "fs";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, irysStorage, keypairIdentity } from "@metaplex-foundation/js";

const connection = new Connection(clusterApiUrl("devnet"));
const secretKey = JSON.parse(fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json"));
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

console.log("🚀 Wallet:", keypair.publicKey.toString());

// Configure Metaplex with Irys explicitly
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair))
  .use(
    irysStorage({
      address: "https://devnet.irys.xyz",
      providerUrl: clusterApiUrl("devnet"),
      timeout: 60000, // avoids hanging
    })
  );

// File paths
const imagePath = "assets/0.png";
const metadataPath = "assets/0.json";

console.log("📤 Reading files...");
const imageBuffer = fs.readFileSync(imagePath);
const metadata = JSON.parse(fs.readFileSync(metadataPath));

// Upload image
console.log("⬆️ Uploading image...");
const imageUri = await metaplex.storage().upload(imageBuffer);
console.log("✅ Image uploaded:", imageUri);

// Upload metadata (replace image with uploaded link)
console.log("⬆️ Uploading metadata...");
const metadataUri = await metaplex.storage().uploadJson({
  ...metadata,
  image: imageUri,
});
console.log("✅ Metadata uploaded:", metadataUri);

// Mint NFT
console.log("🪙 Minting NFT...");

const { nft } = await metaplex.nfts().create(
  {
    uri: metadataUri,
    name: metadata.name.slice(0, 32), // ensure <=32 chars
    sellerFeeBasisPoints: 500, // 5% royalties
  },
  { commitment: "finalized" } // wait until finalized
);

console.log("✅ NFT Minted:", nft.address.toBase58());
console.log("🔗 Explorer:", `https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
