const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    buyPrice: {
        type: Number,
        required: true,
    },
    sellPrice: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    imageProduct: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
