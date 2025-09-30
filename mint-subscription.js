import fs from "fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  irysStorage
} from "@metaplex-foundation/js";

// === 1. Setup wallet & connection ===
const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf-8")
);
const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

const connection = new Connection("https://api.devnet.solana.com");
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(irysStorage({
    address: "https://devnet.irys.xyz",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 60000,
  }));

console.log("🚀 Wallet:", wallet.publicKey.toString());

// === 2. Config ===
const collectionName = "Crypto Sentiment Subscription";
const symbol = "CSSUB";
const now = new Date();
const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
const expiry = nextMonth.toISOString().split("T")[0]; // e.g. "2025-10-30"

// === 3. Helper: upload metadata ===
async function uploadMetadata(imagePath, expiryDate) {
  console.log("📤 Uploading subscription NFT metadata...");

  const imageBuffer = fs.readFileSync(imagePath);
  const imageUri = await metaplex.storage().upload(imageBuffer);

  const metadata = {
    name: `Paid Tier Pass - Expires ${expiryDate}`,
    symbol,
    description: `Unlocks premium features in the Crypto Sentiment app. Valid until ${expiryDate}.`,
    image: imageUri,
    attributes: [
      { trait_type: "Access", value: "Paid Tier" },
      { trait_type: "Expires", value: expiryDate }
    ],
    properties: {
      files: [{ uri: imageUri, type: "image/png" }],
      category: "image",
      creators: [
        { address: wallet.publicKey.toBase58(), share: 100 }
      ]
    }
  };

  const { uri } = await metaplex.nfts().uploadMetadata(metadata);
  console.log("✅ Metadata uploaded:", uri);
  return uri;
}

// === 4. Burn expired subscription (if any) ===
async function burnOldNfts() {
  console.log("🔎 Checking for existing subscription NFTs...");

  const nfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey });

  for (const nft of nfts) {
    if (nft.symbol === symbol) {
      console.log(`⏳ Found subscription NFT: ${nft.address.toBase58()}`);

      // Fetch full metadata
      const fullNft = await metaplex.nfts().findByMint({ mintAddress: nft.address });
      const expiryAttr = fullNft.json?.attributes?.find(a => a.trait_type === "Expires");

      if (expiryAttr && new Date(expiryAttr.value) < new Date()) {
        console.log("🔥 Subscription expired, burning old NFT...");
        await metaplex.nfts().delete({ mintAddress: nft.address });
      } else {
        console.log("✅ Current subscription still valid, skipping mint.");
        return true;
      }
    }
  }
  return false;
}

// === 5. Mint new subscription ===
async function mintSubscription() {
  const alreadyValid = await burnOldNfts();
  if (alreadyValid) return;

  const metadataUri = await uploadMetadata("./assets/0.png", expiry);

  console.log("🪙 Minting new subscription NFT...");
  const { nft } = await metaplex.nfts().create({
    uri: metadataUri,
    name: `PaidTier-${expiry}`, // ✅ short, under 32 chars
    symbol,
    sellerFeeBasisPoints: 0,
    creators: [{ address: wallet.publicKey, share: 100 }],
    isMutable: true
    });


  console.log("✅ Subscription NFT Minted:", nft.address.toBase58());
  console.log("🔗 Explorer:", `https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
}

await mintSubscription();
