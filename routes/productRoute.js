const express = require("express");
const router = express.Router();
const Product = require("../model/productModel");
const mongoose = require("mongoose");

// GET all products
router.get("/", async (req, res) => {
  try {
    const productData = await Product.find();
    console.log("Fetched products:", productData);

    res.status(200).json({
      message: "Data fetched successfully",
      data: productData,
    });
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("GET by ID Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// POST new product
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Product Data:", req.body);

    const data = req.body;

    if (!data.productName || data.productName.trim() === "") {
      return res.status(400).json({ message: "productName is required" });
    }

    const product = new Product(data);
    const response = await product.save();
    console.log("Saved product:", response);

    res.status(201).json({
      message: "Product data saved successfully",
      data: response,
    });
  } catch (error) {
    console.error("POST Error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        message: `Product with ${field} "${value}" already exists`,
        field: field,
        duplicateField: field,
        duplicateValue: value,
      });
    }

    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



// PATCH product by ID
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    // Optional: Validate productName if it's in update data
    if ("productName" in updatedData && (!updatedData.productName || updatedData.productName.trim() === "")) {
      return res.status(400).json({ message: "productName cannot be empty" });
    }

    const response = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!response) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("PATCH Error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        message: `Product with ${field} "${value}" already exists`,
        field: field,
        duplicateField: field,
        duplicateValue: value,
      });
    }

    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// DELETE product by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
