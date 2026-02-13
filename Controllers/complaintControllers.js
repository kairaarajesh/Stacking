const express = require("express");
const { body, validationResult } = require("express-validator");
const Complaint = require("../models/complait"); // make sure filename is correct
const Ticket = require("../models/ticket"); // correct model
const User = require("../models/users");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const fs = require("fs");
const multer = require("multer");
// const path = require("path");

const complaintRoutes = express.Router();
//nodemon --env-file=.env routes/index.js

console.log("==========>", process.env.API_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

complaintRoutes.post(
  "/",
  upload.single("attachment"),
  [
    body("email").notEmpty().withMessage("EmailId is required"),
    body("issue_type").notEmpty().withMessage("Issue Type is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],

  async (req, res) => {
    try {
      // 1️⃣ Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          status: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // 2️⃣ File check
      if (!req.file) {
        return res.status(400).json({
          status: false,
          message: "No file uploaded",
        });
      }

      const {
        issue_type,
        issue_category,
        discrepancies,
        date,
        time,
        status,
        email,
      } = req.body;

      // 3️⃣ Check user
      const user_exists = await User.findOne({ email });
      if (!user_exists) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }

      // 4️⃣ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "complaints",
        resource_type: "image",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      // ✅ Validate Cloudinary response
      if (!result.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      const attachment = result.secure_url;

      // Remove local file
      fs.unlinkSync(req.file.path);

      // 5️⃣ Save complaint
      const complaint = new Complaint({
        issue_type,
        issue_category,
        attachment: result.secure_url,
        discrepancies,
        date,
        time,
        status: status || "pending",
        ticket_id: Date.now(),
        user_id: user_exists._id,
      });

      const complaintData = await complaint.save();

      // 6️⃣ Send email
      await transporter.sendMail({
        from: `"Support Team" <${process.env.MAIL_USER}>`,
        to: user_exists.email,
        subject: "Complaint Registered Successfully",
        html: `
          <p>Hello ${user_exists.first_name || "User"},</p>
          <p><b>Ticket ID:</b> ${complaintData.ticket_id}</p>
          <p>We will contact you within <b>24 hours</b>.</p>
        `,
      });

      // 7️⃣ Response
      return res.status(201).json({
        status: true,
        message: "Complaint registered successfully",
        data: complaintData,
      });
    } catch (error) {
      console.error("Complaint Error:", error);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        status: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
);

complaintRoutes.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ _id: -1 });

    res.status(200).json({
      status: true,
      message: "Complaints fetched successfully",
      data: complaints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

complaintRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedComplaint) {
      return res.status(404).json({
        status: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Complaint updated successfully",
      data: updatedComplaint,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Invalid Complaint ID",
    });
  }
});

complaintRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComplaint = await Complaint.findByIdAndDelete(id);

    if (!deletedComplaint) {
      return res.status(404).json({
        status: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Invalid Complaint ID",
    });
  }
});
// complaint table ticket id va;ue show
complaintRoutes.get("/ticket/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const complaints = await Complaint.find({ ticket_id: id });

    res.status(200).json({
      status: true,
      message: "Complaints fetched successfully",
      total: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

complaintRoutes.post("/ticket/:id", async (req, res) => {
  try {

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: false,
        message: "Message is required",
      });
    }

    const complaintinfo = await Complaint.findOne({ ticket_id: id });

    if (!complaintinfo) {
      return res.status(404).json({
        status: false,
        message: "Ticket not found",
      });
    }
    const usersinfo = await User.findById(complaintinfo.user_id).select(
      "first_name last_name"
    );

    if (!usersinfo) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const newMessage = {
      user_id: complaintinfo.user_id,
      first_name: usersinfo.first_name,
      last_name: usersinfo.last_name,
      message: message,
      Type: "user",
      name: "user",
      createdAt: new Date(),
    };
   
    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id: id },
      {
        $push: {
          messages: newMessage,
        },
      },
      { new: true, upsert: true },
    );

    const lastMessage = ticket.messages[ticket.messages.length - 1];

    res.status(200).json({
      status: true,
      message: "Message added successfully",
      data: {
        ticket_id: ticket.ticket_id,
        last_message: {
          user_id: lastMessage.user_id,
          first_name: lastMessage.first_name,
          last_name: lastMessage.last_name,
          message: lastMessage.message,
          sender: lastMessage.Type,
          createdAt: lastMessage.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

complaintRoutes.get("/ticket_message/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({ ticket_id: id });

    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Ticket details fetched successfully",
      ticket_id: ticket.ticket_id,
      total_messages: ticket.messages.length,
      messages: ticket.messages,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});


complaintRoutes.get("/ticket", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ _id: -1 });

    res.status(200).json({
      status: true,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

module.exports = complaintRoutes;