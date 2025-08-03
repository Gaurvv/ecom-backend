const express = require("express");
const route = express.Router();
const Product = require("../model/productModel");

route.get("/", async (req, res) => {
  try {
    const productData = await Product.find();
    res
      .status(200)
      .json({ message: "data fetch sucessfully", data: productData });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

route.post("/", async (req, res) => {
  try {
    const data = req.body;
    const product = new Product(data);
    const response = await product.save();
    res
      .status(200)
      .json({ message: "{product Data saved sucessfully", response: response });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

route.patch("/", async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;
    const response = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Data updated sucessfully", response: response });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

route.delete("/", async (req, res) => {
  try {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted sucessfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = route;