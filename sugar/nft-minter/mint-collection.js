const { Connection, clusterApiUrl, Keypair } = require("@solana/web3.js");
const { Metaplex, keypairIdentity } = require("@metaplex-foundation/js");
const fs = require("fs");

const keypairFile = "C:/Users/tfsch/.config/solana/id-alt.json";
const secret = JSON.parse(fs.readFileSync(keypairFile));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

(async () => {
  console.log("🚀 Wallet:", keypair.publicKey.toBase58());

  const { nft } = await metaplex.nfts().create({
    uri: "https://gateway.irys.xyz/C7adsy4icjeqiqVPyaQs9XCPAcxDVEZiL9diwDnZBY7t",
    name: "Crypto Sentiment Collection",
    symbol: "PTP",
    sellerFeeBasisPoints: 0,
  });

  console.log("✅ Collection NFT Mint Address:", nft.address.toBase58());
})();
