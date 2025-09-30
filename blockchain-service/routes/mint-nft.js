import fs from "fs";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

export default async function mintNFT(req, res) {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const secretKey = JSON.parse(
      fs.readFileSync("C:/Users/tfsch/.config/solana/id-alt.json")
    );
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage({
        address: "https://devnet.irys.xyz",
        providerUrl: clusterApiUrl("devnet"),
        timeout: 60000,
    }));

    // read assets
    const imageBuffer = fs.readFileSync("assets/0.png");
    const metadata = JSON.parse(fs.readFileSync("assets/0.json"));

    // upload image + metadata
    const imageUri = await metaplex.storage().upload(imageBuffer);
    const metadataUri = await metaplex.storage().uploadJson({
      ...metadata,
      image: imageUri,
    });

    // mint NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: metadata.name,
      sellerFeeBasisPoints: 500,
    });

    return res.json({
      success: true,
      nft: nft.address.toBase58(),
      explorer: `https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`,
    });
  } catch (err) {
    console.error("❌ Mint NFT error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
