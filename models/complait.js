const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    issue_type: { type: String, required: true, trim: true },
    issue_category: { type: String, trim: true, default: null },
    attachment: { type: String, default: null },
    discrepancies: { type: String, trim: true, default: null },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ticket_id: { type: String, required: true },
    user_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Complaint", complaintSchema);
