const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * Creates a new order and updates inventory accordingly
 * @param {string} userId - User ID
 * @param {Array} products - Array of products with quantities and prices
 * @param {number} totalPrice - Total order price
 * @returns {Promise<Object>} - The created order
 */
// Modified createOrder function without transactions
const createOrder = async (userId, products, totalPrice) => {
  try {
    // First validate inventory for all products
    for (const item of products) {
      // Find current inventory
      const inventory = await Inventory.findOne({ product: item.product });

      if (!inventory || inventory.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${item.product}`);
      }
    }

    // Create the order
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

    await order.save();

    // Update inventory for each product
    for (const item of products) {
      await Inventory.updateOne(
        { product: item.product },
        { $inc: { stock: -item.quantity }, $set: { lastUpdated: new Date() } }
      );
    }

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets all orders for a user
 * @param {string} userId - User ID (optional for admin)
 * @returns {Promise<Array>} - List of orders
 */
const getOrders = async (userId = null) => {
  const query = userId ? { user: new ObjectId(userId) } : {};
  return Order.find(query)
    .populate('user', 'name email')
    .populate('products.product', 'name price');
};

/**
 * Gets an order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - The order
 */
const getOrderById = async (orderId) => {
  return Order.findById(orderId)
    .populate('user', 'name email')
    .populate('products.product', 'name price');
};

/**
 * Updates order status and adjusts inventory if needed
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - The updated order
 */
const updateOrderStatus = async (orderId, status) => {
  try {
    // Get the current order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;

    // If cancelling an order that was pending or shipped, return items to inventory
    if (status === 'cancelled' && (previousStatus === 'pending' || previousStatus === 'shipped')) {
      for (const item of order.products) {
        // Add the quantity back to inventory
        await Inventory.updateOne(
          { product: item.product },
          { $inc: { stock: item.quantity }, $set: { lastUpdated: new Date() } }
        );
      }
    }

    // If order was cancelled and now is being un-cancelled, deduct inventory again
    if (previousStatus === 'cancelled' && (status === 'pending' || status === 'shipped' || status === 'delivered')) {
      for (const item of order.products) {
        // Find current inventory
        const inventory = await Inventory.findOne({ product: item.product });

        if (inventory) {
          // Make sure we have enough stock
          if (inventory.stock < item.quantity) {
            throw new Error(`Not enough stock for product ${item.product} to reactivate order`);
          }

          // Deduct from inventory again
          await Inventory.updateOne(
            { product: item.product },
            { $inc: { stock: -item.quantity }, $set: { lastUpdated: new Date() } }
          );
        } else {
          throw new Error(`No inventory record found for product ${item.product}`);
        }
      }
    }

    // Update the order status
    await Order.updateOne(
      { _id: orderId },
      { $set: { status } }
    );

    return await Order.findById(orderId);

  } catch (error) {
    throw error;
  }
};

/**
 * Soft deletes an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteOrder = async (orderId) => {
  return Order.updateOne({_id: orderId}, {$set: {isDeleted: true, deletedAt: new Date()}});
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};