const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: { type: String, required: true, unique: true },
     messages: [
      {
        user_id: { type: String, required: true },
        first_name: {type: String,required: true,},
        message: {type: String,  required: true,  trim: true,},
        sender: {  type: String,  enum: ["user", "admin"],  default: "user",},
        createdAt: { type: Date, default: Date.now,},
      },
    ],
  },
  { timestamps: true}
); 

module.exports = mongoose.model("Ticket", ticketSchema);
