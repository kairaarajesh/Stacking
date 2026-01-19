const express = require("express");
const {  validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel =require("../models/users.js") ;

const userRoutes = express.Router();

userRoutes.post(
  "/",
  async (req, res) => {
    try {
      // validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          errors: errors.array(),
        });
      }
console.log("==============",req.body)
      const { name, email, password, phone, address } = req.body;
    
      // check existing user
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: false,
          message: "Email already exists",
        });
      }
    
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // save user
      const user = new userModel({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
      });

      await user.save();

      // generate JWT
      const token = jwt.sign(
        { userId: user._id },
       "test",
        // process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // remove password from response
      const userData = user.toObject();
      delete userData.password;
    
      res.status(201).json({
        status: true,
        message: "User registered successfully",
        token,
        user: userData,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  }
);

module.exports = userRoutes;
