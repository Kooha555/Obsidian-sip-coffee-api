import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import apiRoutes from "./api/routes.js";
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
