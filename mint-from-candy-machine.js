import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import candyMachinePkg from "@metaplex-foundation/mpl-candy-machine";
import tokenMetadataPkg from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";

const { mplCandyMachine, mintV2 } = candyMachinePkg;
const { mplTokenMetadata } = tokenMetadataPkg;

const umi = createUmi("https://api.devnet.solana.com")
  .use(mplCandyMachine())
  .use(mplTokenMetadata());

const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf-8")
);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
umi.use(keypairIdentity(keypair));

console.log("🚀 Wallet:", umi.identity.publicKey.toString());

const candyMachineId = "E2fgTHKhSm7rVaj98kCG9waoyA9f1ZAqcp3D8Pa5ZPh4";

const tx = await mintV2(umi, {
  candyMachine: candyMachineId,
  collectionMint: "5CrrqVKNArt3kT4e9BbNvZTmPFPvEgPHxpqQjgcVFR8M", // your collection mint
}).sendAndConfirm(umi);

console.log("✅ NFT Minted! Signature:", tx.signature);
