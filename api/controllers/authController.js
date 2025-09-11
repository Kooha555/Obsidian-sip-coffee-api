import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";



export const getAllUsers = async (req, res) => {
  try {
    // exclude passwords in the result
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ error: false, users, message: "User fetched successfully!" });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, username, password } = req.body;

    if (!firstname || !lastname || !email || !phone || !username || !password) {
      return res
        .status(400)
        .json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({ username});
    if (isUser) {
      return res.status(409).json({ error: true, message: "Username already exist" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(409)
        .json({ error: true, message: "Email already registered" });

    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      username,
      password,
      role: "user",
    });
    await user.save();

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    
    res.status(201).json({
      error: false,
      user,
      accessToken,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: true,
      message: "Server error, cannot register",
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "100y",
    });
    res.json({ error: false, token, message: "Login successful" });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
};

export const cookieLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      }, // send some safe public info if needed
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
};

export const authMiddleware = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
};

export const profile = async (req, res) => {
  const user = await User.findById(req.user.user._id).select("-password"); // exclude password
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }
  res.status(200).json({ error: false, user });
};

export const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const verify = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: true, message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      error: false,
      userId: decoded.userId,
      message: "Token is valid",
    });
  } catch (err) {
    res.status(401).json({ error: true, message: "Invalid token" });
  }
};
