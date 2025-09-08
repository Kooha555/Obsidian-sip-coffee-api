import express from "express";
import { authRegister } from "./controllers/auth.controller.js";

const router = express.Router();

router.use("/auth/register", authRegister);

export default router;
