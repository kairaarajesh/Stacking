const express = require("express");
const { body, validationResult } = require("express-validator");
const Complaint = require("../models/complait"); // make sure filename is correct
const Ticket = require("../models/ticket"); // correct model
const Admin = require("../models/users");

const complaintRoutes = express.Router();

complaintRoutes.post(
  "/",
  [
    body("email").notEmpty().withMessage("EmailId is required"),
    body("issue_type").notEmpty().withMessage("Issue Type is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          errors: errors.array(),
        });
      }

      const {
        issue_type,
        issue_category,
        attachment,
        discrepancies,
        date,
        time,
        status,
        email,
      } = req.body;

      user_exists = await Admin.findOne({ email: email });
      if (user_exists) {
        const complaint = new Complaint({
          issue_type,
          issue_category,
          attachment,
          discrepancies,
          date,
          time,
          status,
          ticket_id: new Date().getTime(),
          user_id: user_exists.id,
        });

        const complaintData = await complaint.save();

        return res.status(201).json({
          status: true,
          message: "24 hours successfully",
          data: complaintData,
        });
      } else {
        return res.status(401).json({
          message: "User not found",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  }
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
      { new: true, runValidators: true }
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

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!message) {
      return res.status(400).json({
        status: false,
        message: "Message is required",
      });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id: id },
      {
        $push: {
          messages: {
            user_id: user._id,
            first_name: user.first_name,
            message: message,
            sender: "user",
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: true,
      message: "Message added successfully",
      data: {
        ticket_id: ticket.ticket_id,
        last_message: ticket.messages[ticket.messages.length - 1],
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

module.exports = complaintRoutes;
