const Order = require("../models/Order");
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const createOrder = async (
  userId,
  products,
  totalPrice
) => {
  //products => { product: string; quantity: number; price: number }
  const order = new Order({
    user: new ObjectId(userId),
    products: products.map((item) => ({
      product: new ObjectId(item.product),
      quantity: item.quantity,
      price: item.price
    })),
    totalPrice,
    status: 'pending'
  });
  return await order.save();
};

const getOrders = async (userId) => {
  return Order.find(userId)
};

const getOrderById = async (orderId) => {
  return Order.findById(orderId);
};

const updateOrderStatus = async (
  orderId,
  status
) => {
  return Order.updateOne(
    orderId,
    {$set: {status}},
  );
};

const deleteOrder = async (orderId) => {
  return Order.updateOne({_id: orderId}, {$set: {isDeleted: false}});
};

module.exports = {createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder};