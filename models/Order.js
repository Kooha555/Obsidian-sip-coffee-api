import { Schema, model } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: String, required: true }, // อ้างอิง user ที่สั่งซื้อ
  items: [
    {
      productId: { type: String, required: true }, // อ้างอิงสินค้า
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdOn: { type: Date, default: Date.now },
});

export const Order = model("Order", OrderSchema);

// collection = "orders"
