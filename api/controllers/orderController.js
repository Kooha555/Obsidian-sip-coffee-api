import { Order } from "../../models/Order.js";
import { User } from "../../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Helper function to generate a unique order number
const generateOrderNumber = () => {
  const min = 100000;
  const max = 999999;
  return `ORD-${Math.floor(Math.random() * (max - min + 1)) + min}`;
};

// POST → create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const { customerInfo, items, orderType, shippingAddress, subtotal, deliveryFee, total, note } = req.body;

    // Validate required fields
    if (!customerInfo || !items || !orderType || !subtotal || !total) {
      return res.status(400).json({
        error: true,
        message: "Missing required order data.",
      });
    }

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    const newOrder = new Order({
      orderNumber,
      customerInfo,
      items,
      orderType,
      shippingAddress: orderType === "delivery" ? shippingAddress : "N/A",
      subtotal,
      deliveryFee: orderType === "delivery" ? deliveryFee : 0,
      total,
      note,
      user: userId,
    });

    await newOrder.save();

    res.status(201).json({
      error: false,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({
      error: true,
      message: "Server error, failed to create order.",
      details: err.message,
    });
  }
};

// GET → all orders ของ user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      error: false,
      orders,
      message: "Orders fetched successfully.",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error, failed to fetch orders.",
      details: err.message,
    });
  }
};

// GET → single order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: "Order not found or you do not have permission to view it.",
      });
    }

    res.status(200).json({
      error: false,
      order,
      message: "Order fetched successfully.",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error, failed to fetch order.",
      details: err.message,
    });
  }
};

// DELETE → cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user._id;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: userId, status: { $in: ["pending", "processing"] } },
      { status: "cancelled" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        error: true,
        message: "Order not found, already cancelled, or cannot be cancelled at this stage.",
      });
    }

    res.status(200).json({
      error: false,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error, failed to cancel order.",
      details: err.message,
    });
  }
};