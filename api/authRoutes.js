import express from "express";
import { authMiddleware, cookieLogin, createAccount, login, logout, profile, verify } from "./controllers/authController.js";
import { authUser } from "../middleware/auth.js";

const router = new express.Router();

router.post("/register", createAccount);

router.post("/login", login);

router.post("/cookie/login", cookieLogin);

router.post("/logout", logout);

router.get("/profile", authUser, profile);

// Verify token
router.get("/verify", verify);

router.get("/me", authUser, authMiddleware);

export default router;
