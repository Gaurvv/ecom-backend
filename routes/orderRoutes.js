const express = require("express");
const route = express.Router();
const Order = require("../model/orderModel");
const { jwtAuthMiddleWare } = require("../jwt");
const User = require("../model/userModal");

// GET all orders
route.get("/", async (req, res) => {
  try {
    const orderData = await Order.find();
    res.status(200).json({ message: "Orders fetched successfully", data: orderData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST new order
route.post("/", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const data = req.body;

    // Add user info
    data.userName = user.userName;
    data.contactNumber = user.contactNumber;
    data.city = user.city;
    data.street = user.street;
    data.deliveryDescription = user.deliveryDescription;

    const order = new Order(data);
    const response = await order.save();
    res.status(200).json({ message: "Order saved successfully", response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH update order
route.patch("/", async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;
    const response = await Order.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Order updated successfully", response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE order
route.delete("/", async (req, res) => {
  try {
    const { id } = req.body;
    await Order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = route;
