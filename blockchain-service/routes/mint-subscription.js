import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import {
  Metaplex,
  bundlrStorage,          // ✅ use bundlrStorage here
  keypairIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js";


// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Metaplex + Irys setup (same as your working script) ---
const connection = new Connection(clusterApiUrl("devnet"));
const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf-8")
);
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair))
  .use(
    bundlrStorage({                       // ✅ instead of irysStorage
      address: "https://devnet.irys.xyz", // still works, Irys runs a Bundlr node
      providerUrl: clusterApiUrl("devnet"),
      timeout: 60000,
    })
  );


// NOTE: keep your assets **inside blockchain-service/assets/**
const IMAGE_PATH = path.join(__dirname, "..", "assets", "subscription.png");
const META_PATH  = path.join(__dirname, "..", "assets", "subscription.json");

export default async function mintSubscription(req, res) {
  try {
    console.log("🚀 Wallet:", keypair.publicKey.toString());

    // --- Read files from disk ---
    const imageBuffer = fs.readFileSync(IMAGE_PATH);      // Buffer
    const metadataObj = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));

    // --- Wrap inputs as Metaplex files (prevents pipe error) ---
    const imageFile = toMetaplexFile(imageBuffer, "subscription.png", {
      contentType: "image/png",
    });
    const metadataFile = toMetaplexFile(
      Buffer.from(JSON.stringify(metadataObj), "utf8"),
      "subscription.json",
      { contentType: "application/json" }
    );

    console.log("⬆️ Uploading image...");
    const imageUri = await metaplex.storage().upload(imageFile);
    console.log("✅ Image uploaded:", imageUri);

    console.log("⬆️ Uploading metadata...");
    // inject the uploaded image URL and upload the JSON file
    const mergedMetaFile = toMetaplexFile(
      Buffer.from(
        JSON.stringify({ ...metadataObj, image: imageUri }, null, 0),
        "utf8"
      ),
      "subscription.json",
      { contentType: "application/json" }
    );
    const metadataUri = await metaplex.storage().upload(mergedMetaFile);
    console.log("✅ Metadata uploaded:", metadataUri);

    console.log("🪙 Minting subscription NFT...");
    const { nft } = await metaplex.nfts().create(
      {
        uri: metadataUri,
        name: (metadataObj.name || "Subscription Pass").slice(0, 32),
        sellerFeeBasisPoints: 0,
      },
      { commitment: "finalized" }
    );

    console.log("✅ Subscription NFT Minted:", nft.address.toBase58());
    return res.json({
      success: true,
      nftAddress: nft.address.toBase58(),
      explorer: `https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`,
    });
  } catch (err) {
    console.error("❌ Mint failed:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
