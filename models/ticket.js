const mongoose = require("mongoose");
  
const ticketSchema = new mongoose.Schema(
  {
    ticket_id: { type: String, required: true, unique: true },

 user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
          
    messages: [
      {
        user_id: { type: String, required: true, default: null },
        name: { type: String },
        first_name: { type: String },
        last_name: { type: String },
        message: { type: String, required: true, trim: true },
        Type: { type: String, enum: ["user", "admin"], default: "user" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);