const express = require('express');
const orderService = require('../services/orderService.js');
const productService = require('../services/productService.js');
const inventoryService = require('../services/inventoryService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Create a new order
 * This will create an order and update inventory levels
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate request body
    if (!req.body.products || !Array.isArray(req.body.products) || req.body.products.length === 0) {
      return res.status(400).send({error: 'Products array is required'});
    }

    const products = req.body.products;
    let totalPrice = 0;

    // Validate each product and calculate the total price
    for (const item of products) {
      if (!item.product || !item.quantity) {
        return res.status(400).send({error: 'Each product must have a product ID and quantity'});
      }

      // Get current product information
      const product = await productService.getProductById(item.product);
      if (!product) {
        return res.status(404).send({error: `Product ${item.product} not found`});
      }

      // Check inventory
      const inventory = await inventoryService.getStock(item.product);
      if (!inventory || inventory.stock < item.quantity) {
        return res.status(400).send({
          error: `Not enough stock for ${product.name}. Available: ${inventory ? inventory.stock : 0}`
        });
      }

      // Set the correct price from database
      item.price = product.price;

      // Add to total
      totalPrice += product.price * item.quantity;
    }

    // Create the order with inventory updates
    const order = await orderService.createOrder(req.user._id, products, totalPrice);

    res.status(201).send({data: order});
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).send({error: error.message});
  }
});

/**
 * Get all orders for the current user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // If user is admin, they can see all orders
    const userId = req.user.role === 'admin' ? null : req.user._id;
    const orders = await orderService.getOrders(userId);
    res.send({data: orders});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * Get a specific order by ID
 */
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);

    // Check if order belongs to user or user is admin
    if (!order) {
      return res.status(404).send({error: 'Order not found'});
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({error: 'You do not have permission to view this order'});
    }

    res.send({data: order});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

/**
 * Update an order's status
 * This will also handle inventory adjustments
 */
router.put('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).send({error: 'You do not have permission to update order status'});
    }

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!req.body.status || !validStatuses.includes(req.body.status)) {
      return res.status(400).send({error: 'Valid status is required'});
    }

    // Update status and handle inventory
    const updatedOrder = await orderService.updateOrderStatus(
      req.params.orderId,
      req.body.status
    );

    res.send({data: updatedOrder});
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).send({error: error.message});
  }
});

/**
 * Cancel an order
 * This will return inventory to stock
 */
router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);

    // Check if order exists and belongs to user or user is admin
    if (!order) {
      return res.status(404).send({error: 'Order not found'});
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({error: 'You do not have permission to cancel this order'});
    }

    // Only pending orders can be cancelled by customers
    if (req.user.role !== 'admin' && order.status !== 'pending') {
      return res.status(400).send({error: 'Only pending orders can be cancelled'});
    }

    // Cancel the order (this updates inventory)
    const updatedOrder = await orderService.updateOrderStatus(req.params.orderId, 'cancelled');

    res.send({data: updatedOrder});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

module.exports = router;