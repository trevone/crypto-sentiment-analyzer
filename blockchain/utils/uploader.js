import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

export function createUploader(umi) {
  return irysUploader({
    address: "https://devnet.irys.xyz",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 60000,
  })(umi);
}
