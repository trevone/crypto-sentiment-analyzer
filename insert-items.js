import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import candyMachinePkg from "@metaplex-foundation/mpl-candy-machine";
import tokenMetadataPkg from "@metaplex-foundation/mpl-token-metadata";
import bundlrUploader from "@metaplex-foundation/umi-uploader-bundlr";
import fs from "fs";

const { mplCandyMachine, addConfigLines } = candyMachinePkg;
const { mplTokenMetadata } = tokenMetadataPkg;

const umi = createUmi("https://api.devnet.solana.com")
  .use(mplCandyMachine())
  .use(mplTokenMetadata())
  .use(bundlrUploader());

// Wallet
const secretKey = JSON.parse(
  fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json", "utf-8")
);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
umi.use(keypairIdentity(keypair));

console.log("🚀 Wallet:", umi.identity.publicKey.toString());

// Candy Machine ID (replace with yours from deploy script)
const candyMachineId = "E2fgTHKhSm7rVaj98kCG9waoyA9f1ZAqcp3D8Pa5ZPh4";

// Upload asset JSON + image to Bundlr
const metadata = JSON.parse(
  fs.readFileSync("./sugar/assets/0.json", "utf-8")
);
const imageBytes = fs.readFileSync("./sugar/assets/0.png");
const imageUri = await umi.uploader.upload(imageBytes);
metadata.image = imageUri;
metadata.properties.files[0].uri = imageUri;

const metadataUri = await umi.uploader.uploadJson(metadata);

// Add item to Candy Machine
const tx = await addConfigLines(umi, {
  candyMachine: candyMachineId,
  index: 0,
  configLines: [
    {
      name: metadata.name,
      uri: metadataUri,
    },
  ],
}).sendAndConfirm(umi);

console.log("✅ Items inserted into Candy Machine:", tx.signature);
