import Link from "next/link";
import WalletControls from "../components/WalletControls";

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>📊 Crypto Sentiment Analyzer</h1>
      <p>
        Explore sentiment analysis from Reddit and unlock premium insights with your subscription NFT.
      </p>

      <div style={{ margin: "16px 0" }}>
        <WalletControls />
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/CryptoCurrency">Go to Dashboard →</Link>
      </div>
    </div>
  );
}
