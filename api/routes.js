import express from "express";
import orderRoutes from "./orderRoutes.js";


const router = express.Router();

router.use("/api/orders", orderRoutes);

export default router;
