import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "./controllers/orderController.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    res.status(200).send("Hello! This is an Express API server for Orders.");
  } catch (err) {
    next(err);
  }
});

// POST → create order
router.post("/orders", createOrder);
// router.post("/orders", authUser, createOrder);

// GET → all orders ของ user
router.get("/orders", authUser, getUserOrders);

// GET → single order
router.get("/orders/:id", authUser, getOrderById);

// DELETE → cancel order
router.delete("/orders/:id", authUser, cancelOrder);

export default router;
