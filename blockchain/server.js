// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import subscriptionRoutes from "./routes/subscription.js";
import mintRoute from "./routes/mint.js";   // 👈 new import

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/mint-subscription", mintSubscription);
app.use("/api", subscriptionRoutes);

// 👇 expose Candy Machine mint endpoint
app.use("/mint", mintRoute);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Blockchain service running at http://localhost:${PORT}`);
});
