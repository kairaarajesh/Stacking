const express = require("express");
const {  validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminModel =require("../models/admin.js") ;

const adminRoutes = express.Router();

console.log(process.env.JWT_SECRET,);

adminRoutes.post("/", async (req, res) => {
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

    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create admin
    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      permissions,
    });

    // JWT payload (IMPORTANT)
    const tokenPayload = {
      id: admin._id,
      role: admin.role,
      permissions: admin.permissions,
    };

    // generate token
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET ||"test",
      { expiresIn: "1d" }
    );

    // remove password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      token,
      admin: adminData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

module.exports = adminRoutes;
