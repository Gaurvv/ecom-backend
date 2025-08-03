const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pName: {
    type: String,
    unique: true,
  },
  price: {
    type: Number,
  },
  rating: {
    type: Number,
  },
  description: {
    type: String,
  },
  popularity: {
    type: Number,
  },
  image: {
    type: String,
  },
  features: {
    type: [String],
  },
  category: {
    type: String,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;