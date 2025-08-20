const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userName: {
    type: String, 
  },
  cName: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  city: {
    type: String,
  },
  street: {
    type: String,
  },
  deliveryDescription: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
  items: [
    {
      itemName: { type: String },
      quantity: { type: String },
    },
  ],
  status: {
    type: String,
    default: "Pending",
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
