import express from "express";
import authRoutes from "./authRoutes.js";
import { getAllUsers } from "./controllers/authcontroller.js";
import productsRoutes from "./productRoutes.js";

const router = express.Router();

router.use("/products", productsRoutes);
router.get("/users", getAllUsers);
router.use("/auth", authRoutes);
router.use("/profile", userRoutes);

export default router;
