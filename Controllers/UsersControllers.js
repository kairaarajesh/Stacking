const express = require("express");
const User = require("../models/users");

const userRoutes = express.Router();

userRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
  
     
    const [users, total] = await Promise.all([    
      User.find()
        .select("-password") 
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      
      User.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);
  
    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        limit,
      },
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

module.exports = userRoutes;
