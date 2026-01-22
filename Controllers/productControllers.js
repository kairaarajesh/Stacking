const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/product");

const productRoutes = express.Router();

productRoutes.post(
  "/",
  [
    body("product_name").notEmpty().withMessage("Product name is required"),
    body("product_code").notEmpty().withMessage("Product code is required"),
    body("amount").isNumeric().withMessage("Amount must be numeric"),
  ],
  async (req, res) => {
    try {
      // validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          errors: errors.array(),
        });
      }

      const {
        product_name,
        product_code,
        amount,
        image,
        discrepancies,
      } = req.body;

      // create product
      const product = new Product({
        product_name,
        product_code,
        amount,
        image,
        discrepancies,
      });

      const productData = await product.save();

      return res.status(201).json({
        status: true,
        message: "Product created successfully",
        data: productData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  }
);


productRoutes.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });

    res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

productRoutes.put(
  "/:id",
  [
    body("product_name").optional().notEmpty(),
    body("product_code").optional().notEmpty(),
    body("amount").optional().isNumeric(),
  ],
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

      const { id } = req.params;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          status: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Invalid product ID",
      });
    }
  }
);

productRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Invalid product ID",
    });
  }
});

module.exports = productRoutes;
