import { Order } from "../../models/Order.js";

// ✅ createOrder
export const createOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const userId = req.user?._id; // authUser middleware ต้องแปะ user เข้า req

  if (!userId || !items || !items.length) {
    const error = new Error("userId, items, shippingAddress, and paymentMethod are required");
    error.status = 400;
    return next(error);
  }

  try {
    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({
      error: false,
      order,
      message: "Order created successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// ✅ getOrders (ดึงของ user ที่ login)
export const getOrders = async (req, res, next) => {
  if (!req.user || !req.user._id) {
    const error = new Error("Unauthorized: No user found in request object!");
    error.status = 401;
    return next(error);
  }

  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdOn: -1 });
    res.status(200).json({
      error: false,
      orders,
      message: "All orders retrieved successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// ✅ getOrderById
export const getOrderById = async (req, res, next) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      const error = new Error("Order not found!");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      error: false,
      order,
      message: "Order retrieved successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// ✅ cancelOrder
export const cancelOrder = async (req, res, next) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      const error = new Error("Order not found!");
      error.status = 404;
      return next(error);
    }

    if (order.status !== "pending") {
      const error = new Error("Only pending orders can be cancelled!");
      error.status = 400;
      return next(error);
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      error: false,
      order,
      message: "Order cancelled successfully!",
    });
  } catch (err) {
    next(err);
  }
};