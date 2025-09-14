// import 'dotenv' เพื่ออ่านค่าตัวแปรในไฟล์ .env
import dotenv from "dotenv";
// import Order model ที่เราสร้างไว้ เพื่อใช้จัดการข้อมูลใน collection 'orders'
import { Order } from "../../models/Order.js";

// เรียกใช้ dotenv.config() เพื่อให้ project สามารถอ่านไฟล์ .env ได้
dotenv.config();

// Helper function เพื่อสร้างเลขที่คำสั่งซื้อที่ไม่ซ้ำกัน
const generateOrderNumber = () => {
  const min = 100000; // กำหนดเลขน้อยสุด
  const max = 999999; // กำหนดเลขมากสุด
  // สร้างเลขสุ่ม 6 หลัก และนำไปต่อท้าย 'ORD-'
  return `ORD-${Math.floor(Math.random() * (max - min + 1)) + min}`;
};

// POST → create order สำหรับสร้างคำสั่งซื้อใหม่ (ใช้ตอนที่ลูกค้ากดยืนยันการสั่งซื้อที่หน้า Checkout)
export const createOrder = async (req, res) => {
  try {
    // (ตรวจสอบความปลอดภัย) เช็คว่ามีข้อมูลผู้ใช้จาก middleware authUser หรือไม่
    // ถ้าไม่มี แสดงว่าไม่ได้ login ให้ส่งสถานะ 401 และข้อความ error
    if (!req.user?._id) {
      return res.status(401).json({ error: true, message: "Not authenticated" });
    }
    // ดึง userId จาก req.user ที่มาจาก middleware
    const userId = req.user._id;
    // ดึงข้อมูลที่จำเป็นจาก body ของ request (ที่มาจาก frontend)
    const {
      customerInfo,
      basketItems,
      orderType,
      address,
      subtotal,
      // ตั้งค่าเริ่มต้นของ deliveryFee เป็น 0 ถ้า Frontend ไม่ได้ส่งมา
      deliveryFee = 0,
      total,
      note,
    } = req.body;

    // Validation (ตรวจสอบข้อมูลที่สำคัญว่าได้รับมาครบถ้วนและถูกต้องหรือไม่)
    if (
      !customerInfo || // ต้องมีข้อมูลลูกค้า
      !Array.isArray(basketItems) || // basketItems ต้องเป็น Array
      basketItems.length === 0 || // basketItems ต้องไม่เป็น Array ว่าง
      !orderType ||  // ต้องมีประเภทการสั่งซื้อ
      subtotal == null || // subtotal ต้องมีค่า (ไม่เป็น null หรือ undefined)
      total == null  // total ต้องมีค่า (ไม่เป็น null หรือ undefined)
    ) {
      // ถ้าข้อมูลไม่ครบ ให้ส่งสถานะ 400 (Bad Request) และข้อความ error
      return res.status(400).json({
        error: true,
        message: "Missing required order data.",
      });
    }

    // Ensure orderNumber is unique (retry a few times if collision)
    // กำหนดตัวแปรสำหรับเลขคำสั่งซื้อและจำนวนครั้งที่ลองสุ่ม
    let orderNumber;
    let attempts = 0;
    // วนลูปไม่เกิน 5 ครั้งเพื่อสุ่มเลขที่ยังไม่ซ้ำ
    while (attempts < 5) {
      // สุ่มเลขที่คำสั่งซื้อ
      orderNumber = generateOrderNumber();
      // ค้นหาใน database ว่ามีเลขนี้อยู่แล้วหรือไม่
      const exists = await Order.findOne({ orderNumber }).lean().exec();
      // ถ้าไม่พบ แสดงว่าเลขนี้ยังไม่ซ้ำ ให้หยุด loop ทันที
      if (!exists) break;
      // ถ้าพบ ให้เพิ่มจำนวนครั้งที่ลองสุ่ม
      attempts++;
    }

    // สร้าง Object ใหม่จาก Order model และใส่ข้อมูลที่ได้รับ
    const newOrder = new Order({
      orderNumber,
      customerInfo,
      basketItems,
      orderType,
      // ถ้า orderType เป็น "delivery" ให้ใช้ address ที่ส่งมา ถ้าไม่ใช่ ให้เป็นค่า "N/A"
      address: orderType === "delivery" ? address : "N/A",
      subtotal,
       // ถ้า orderType เป็น "delivery" ให้ใช้ deliveryFee ที่ส่งมา ถ้าไม่ใช่ ให้เป็นต่า 0
      deliveryFee: orderType === "delivery" ? deliveryFee : 0,
      total,
      note,
      user: userId,
    });

    // บันทึก Object ใหม่ลงใน database
    await newOrder.save();

    // Response to frontend ส่งสถานะ 201 (Created) พร้อมข้อมูล order ที่สร้างเสร็จแล้ว
    res.status(201).json({
      error: false,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    // ถ้าเกิดข้อผิดพลาดใดๆ ระหว่างกระบวนการ ให้บันทึก error ลง console
    console.error("Create order error:", err);
    // ส่งสถานะ 500 (Server Error) พร้อมข้อความ error กลับไป
    res.status(500).json({
      error: true,
      message: "Server error, failed to create order.",
      details: err.message,
    });
  }
};

// GET → all orders ของ user
// Function สำหรับดึงรายการคำสั่งซื้อทั้งหมดของ user ที่ login อยู่ มาแสดงหน้า profile/my orders
export const getUserOrders = async (req, res) => {
  try {
    // (ตรวจสอบความปลอดภัย) เช็คว่ามีข้อมูลผู้ใช้จาก middleware หรือไม่
    if (!req.user?._id) {
      // ถ้าไม่มี แสดงว่าไม่ได้ login ให้ส่งสถานะ 401 และข้อความ error
      return res.status(401).json({ error: true, message: "Not authenticated" });
    }
    // ดึง userId จาก req.user
    const userId = req.user._id;
    // ค้นหาคำสั่งซื้อทั้งหมดใน database ที่ user ID ตรงกับ user ที่ login อยู่
    // เรียงลำดับจากใหม่ไปเก่า (-createdAt)
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // ส่งสถานะ 200 (OK) พร้อมรายการ orders ทั้งหมดกลับไป
    res.status(200).json({
      error: false,
      orders,
      message: "Orders fetched successfully.",
    });
  } catch (err) {
    // ถ้าเกิดข้อผิดพลาด ให้บันทึก error และส่งสถานะ 500 พร้อมข้อความ error กลับไป
    res.status(500).json({
      error: true,
      message: "Server error, failed to fetch orders.",
      details: err.message,
    });
  }
};

// GET → single order
// Function สำหรับดึงข้อมูลคำสั่งซื้อเพียงรายการเดียว (ดึงข้อมูล order ที่เพิ่งสร้างมาแสดงผลที่หน้า Order Confirmation
export const getOrderById = async (req, res) => {
  try {
    // (ตรวจสอบความปลอดภัย) เช็คว่ามีข้อมูลผู้ใช้จาก middleware หรือไม่
    if (!req.user?._id) {
      // ถ้าไม่มี แสดงว่าไม่ได้ login ให้ส่งสถานะ 401 และข้อความ error
      return res.status(401).json({ error: true, message: "Not authenticated" });
    }
    // ดึง orderId จาก params ใน URL
    const { orderId } = req.params;
     // ดึง userId จาก req.user
    const userId = req.user._id;

    // ค้นหาข้อมูล order ใน database ที่ _id และ user ID ตรงกัน เพื่อป้องกันไม่ให้ user ดู order ของคนอื่นได้
    const order = await Order.findOne({ _id: orderId, user: userId });

    // ถ้าไม่พบ order ให้ส่งสถานะ 404 (Not Found) กลับไป
    if (!order) {
      return res.status(404).json({
        error: true,
        message: "Order not found or you do not have permission to view it.",
      });
    }

    // ถ้าเจอ order ให้ส่งสถานะ 200 (OK) และข้อมูล order กลับไป
    res.status(200).json({
      error: false,
      order,
      message: "Order fetched successfully.",
    });
  } catch (err) {
    // ถ้าเกิดข้อผิดพลาด ให้บันทึก error และส่งสถานะ 500 พร้อมข้อความ error กลับไป
    res.status(500).json({
      error: true,
      message: "Server error, failed to fetch order.",
      details: err.message,
    });
  }
};