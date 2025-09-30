import {
  createUmi,
  keypairIdentity,
  generateSigner,
} from "@metaplex-foundation/umi";

import { createUmi as createDefaultUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine, create } from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata, createNft } from "@metaplex-foundation/mpl-token-metadata";

import fs from "fs";

// 1. Setup Umi with Bundlr uploader already inside
const umi = createDefaultUmi("https://api.devnet.solana.com")
  .use(mplCandyMachine())
  .use(mplTokenMetadata());

// 2. Load your wallet
const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf-8")
);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
umi.use(keypairIdentity(keypair));

console.log("🚀 Wallet:", umi.identity.publicKey.toString());

// 3. Mint the Collection NFT
const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  authority: umi.identity,
  name: "Crypto Sentiment Collection",
  uri: "https://gateway.irys.xyz/C7adsy4icjeqiqVPyaQs9XCPAcxDVEZiL9diwDnZBY7t",
  sellerFeeBasisPoints: 500,
}).sendAndConfirm(umi);

console.log("✅ Collection NFT Minted:", collectionMint.publicKey.toString());

// 4. Create Candy Machine
const cm = generateSigner(umi);

const cmBuilder = await create(umi, {
  candyMachine: cm,
  authority: umi.identity,
  payer: umi.identity,
  collectionMint: collectionMint.publicKey,
  collectionUpdateAuthority: umi.identity,
  tokenStandard: 0, // NFT
  sellerFeeBasisPoints: 500,
  itemsAvailable: 1n,
  maxEditionSupply: 0n,
  isMutable: true,
  symbol: "PASS",
  creators: [
    {
      address: umi.identity.publicKey,
      verified: true,
      share: 100,
    },
  ],
  configLineSettings: {
    prefixName: "",
    nameLength: 32,
    prefixUri: "",
    uriLength: 200,
    isSequential: false,
  },
});

await cmBuilder.sendAndConfirm(umi);

console.log("✅ Candy Machine Created:", cm.publicKey.toString());
