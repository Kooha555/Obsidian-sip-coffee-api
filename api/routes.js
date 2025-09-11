import express from "express";
import authRoutes from "./authRoutes.js";
import { getAllUsers } from "./controllers/authController.js";
import orderRoutes from "./orderRoutes.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);


export default router;
