const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    product_code: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    image: { type: String },
    discrepancies: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
