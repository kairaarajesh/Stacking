const express = require("express");
const {  validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminModel =require("../models/admin.js");

const adminRoutes = express.Router();

console.log(process.env.JWT_SECRET,);

adminRoutes.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      role = "user",
      permissions = [],
    } = req.body;

    // 1️⃣ Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, Email and Password are required",
      });
    }

    // 2️⃣ Check existing admin
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      permissions,
    });

    const adminData = admin.toObject();
    delete adminData.password;

    return res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      data: adminData, // ✅ no token here
    });
  } catch (error) {
    console.error(error);

    // duplicate email safety
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});


adminRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and Password are required",
      });
    }

    // 2️⃣ Find admin
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // 4️⃣ JWT payload
    const tokenPayload = {
      id: admin._id,
      role: admin.role,
      permissions: admin.permissions,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5️⃣ Remove password
    const adminData = admin.toObject();
    delete adminData.password;

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      data: adminData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

module.exports = adminRoutes;
