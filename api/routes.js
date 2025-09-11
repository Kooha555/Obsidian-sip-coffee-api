import express from "express";
import productsRoutes from "./productRoutes.js";

const router = express.Router();

router.use("/products", productsRoutes);

export default router;
