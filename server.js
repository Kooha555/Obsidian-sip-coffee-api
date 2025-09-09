import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import apiRoutes from "./api/routes.js";
import helmet from "helmet";
import cors from "cors";
import limiter from "./middleware/rateLimiter.js";
import cookieParser from "cookie-parser";
import { connectMongo } from "./config/mongo.js";
import errorHandler from "./middleware/errorhandler.js";

dotenv.config();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
};

const app = express();
app.use(helmet());

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://frontend-rag-notes.vercel.app",
  ], // frontend domain
  credentials: true, // ✅ allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use(errorHandler);
app.use(limiter);
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/", apiRoutes);
app.get("/", (req, res) => {
  res.send("ObsidianSip");
});

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} ✅✅`);
});

(async () => {
  try {
    await connectMongo();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT} ✅`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
