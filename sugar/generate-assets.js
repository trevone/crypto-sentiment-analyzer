import fs from "fs";
import path from "path";

// === CONFIG HERE ===
const TOTAL = 50; // how many NFTs you want to generate
const SYMBOL = "CSA";
const COLLECTION_NAME = "CSA Pass Collection";
const NFT_PREFIX = "CSA Pass #"; // NFT name prefix

// Output folder
const outDir = path.join(process.cwd(), "assets-gen");

// Ensure folder is clean
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Image used for both NFTs + collection
const IMAGE_FILE = path.join(process.cwd(), "subscription.png");
if (!fs.existsSync(IMAGE_FILE)) {
  console.error("❌ Missing subscription.png in current directory.");
  process.exit(1);
}

// === Generate NFTs ===
for (let i = 0; i < TOTAL; i++) {
  const jsonFile = path.join(outDir, `${i}.json`);
  const imageFile = path.join(outDir, `${i}.png`);

  // copy image
  fs.copyFileSync(IMAGE_FILE, imageFile);

  const metadata = {
    name: `${NFT_PREFIX}${i + 1}`,
    symbol: SYMBOL,
    description: "Subscription Pass NFT for Crypto Sentiment Analyzer",
    image: `${i}.png`,
    attributes: [
      { trait_type: "Access", value: "Premium" },
      { trait_type: "Tier", value: "Paid" }
    ],
    properties: {
      files: [{ uri: `${i}.png`, type: "image/png" }],
      category: "image"
    }
  };

  fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2));
}

// === Generate collection.json + collection.png ===
const collectionJson = {
  name: COLLECTION_NAME,
  symbol: SYMBOL,
  description: "Collection of Subscription Pass NFTs for Crypto Sentiment Analyzer",
  image: "collection.png",
  attributes: [],
  properties: {
    files: [{ uri: "collection.png", type: "image/png" }],
    category: "image"
  }
};
fs.copyFileSync(IMAGE_FILE, path.join(outDir, "collection.png"));
fs.writeFileSync(path.join(outDir, "collection.json"), JSON.stringify(collectionJson, null, 2));

// === Generate config.json ===
// https://developers.metaplex.com/candy-machine/sugar/configuration
const config = {
  price: 0, // free on devnet
  number: TOTAL, // MUST equal NFT items, not collection
  symbol: SYMBOL,
  sellerFeeBasisPoints: 500, // 5% royalties
  isMutable: true,
  retainAuthority: true,
  creators: [
    {
      address: "<YOUR_WALLET_ADDRESS>", // 👈 replace with your Phantom devnet pubkey
      share: 100
    }
  ],
  uploadMethod: "bundlr",
  ruleSet: null,
  isSequential: false
};

fs.writeFileSync(path.join(outDir, "config.json"), JSON.stringify(config, null, 2));

console.log(`✅ Generated ${TOTAL} NFTs, collection files, and config.json in ${outDir}`);
