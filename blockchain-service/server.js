import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import mintNFT from "./routes/mint-nft.js";
import mintSubscription from "./routes/mint-subscription.js";
import subscriptionRoutes from "./routes/subscription.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/mint-nft", mintNFT);
app.post("/mint-subscription", mintSubscription);
app.use("/api", subscriptionRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Blockchain service running at http://localhost:${PORT}`);
});

