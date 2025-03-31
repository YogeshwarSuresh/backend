const mongoose = require('mongoose');
const Cart = require('../models/cart');
const ObjectId = mongoose.Schema.ObjectId;

const addToCart = async (userId, productId, quantity) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart();
    } else {
        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: new ObjectId(productId), quantity });
        }
    }
    return await cart.save();
};

// working
// const updateCart = async (userId, body) => {
//     let cart = await Cart.findOne({ user: userId });
//     if (cart) {
//         const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
//         if (productIndex > -1) {
//             cart.products[productIndex].quantity += quantity;
//         } else {
//             cart.products.push({ product: new ObjectId(productId), quantity });
//         }
//     }
//     return await cart.save();
// };


const getCart = async (userId) => {
    return await Cart.findOne({ user: userId }).populate('products.product');
};

const removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;
    cart.products = cart.products.filter((item) => item.product.toString() !== productId);
    return await cart.save();
};

const clearCart = async (userId) => {
    return await Cart.findOneAndDelete({ user: userId });
};

module.exports = {addToCart, getCart, removeFromCart, clearCart}