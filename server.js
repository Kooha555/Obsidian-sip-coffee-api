import dotenv from "dotenv";
import express from "express";
import apiRoutes from "./api/routes.js";

dotenv.config();

const app = express();
app.use("/", apiRoutes);

app.get("/", (req, res) => {
  res.send("ObsidianSip");
});

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} ✅✅`);
});
