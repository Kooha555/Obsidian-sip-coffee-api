import express from "express";
import { authRegister } from "./controllers/authController.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/auth/register", authRegister);
router.use("/profile", userRoutes);

export default router;
