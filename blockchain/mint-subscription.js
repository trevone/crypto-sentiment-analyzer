import fs from "fs";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, irysStorage, keypairIdentity } from "@metaplex-foundation/js";

const connection = new Connection(clusterApiUrl("devnet"));
const secretKey = JSON.parse(fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json"));
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

console.log("🚀 Wallet:", keypair.publicKey.toString());

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair))
  .use(
    irysStorage({
      address: "https://devnet.irys.xyz",
      providerUrl: clusterApiUrl("devnet"),
      timeout: 60000,
    })
  );

// file paths
const imagePath = "assets/subscription.png"; // ✅ make sure this exists
const metadataPath = "assets/subscription.json"; // base metadata

async function mintSubscription() {
  console.log("🔎 Checking for existing subscription NFTs...");
  // TODO: implement lookup by owner + symbol, for now we always mint new

  console.log("📤 Reading files...");
  const imageBuffer = fs.readFileSync(imagePath);
  const metadata = JSON.parse(fs.readFileSync(metadataPath));

  console.log("⬆️ Uploading image...");
  const imageUri = await metaplex.storage().upload(imageBuffer);
  console.log("✅ Image uploaded:", imageUri);

  console.log("⬆️ Uploading metadata...");
  const metadataUri = await metaplex.storage().uploadJson({
    ...metadata,
    image: imageUri,
  });
  console.log("✅ Metadata uploaded:", metadataUri);

  console.log("🪙 Minting subscription NFT...");
  const { nft } = await metaplex.nfts().create(
    {
      uri: metadataUri,
      name: metadata.name.slice(0, 32),
      sellerFeeBasisPoints: 0,
    },
    { commitment: "finalized" }
  );

  console.log("✅ Subscription NFT Minted:", nft.address.toBase58());
  console.log(
    "🔗 Explorer:",
    `https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`
  );
}

await mintSubscription();
