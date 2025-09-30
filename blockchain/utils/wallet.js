import fs from "fs";
import { Keypair } from "@solana/web3.js";

export function loadWallet(keypairPath) {
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}
