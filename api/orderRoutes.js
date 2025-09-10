import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "./controllers/orderController.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

// POST → create order
router.post("/", authUser, createOrder);
// router.post("/orders", authUser, createOrder);

// GET → all orders ของ user
router.get("/", authUser, getUserOrders);

// GET → single order
router.get("/:orderId", authUser, getOrderById);

// DELETE → cancel order
router.delete("/:orderId", authUser, cancelOrder);

export default router;
