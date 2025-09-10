import express from "express";
import authRoutes from "./authRoutes.js";
import { getAllUsers } from "./controllers/authcontroller.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.use("/auth", authRoutes);


export default router;
