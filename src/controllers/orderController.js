const express = require('express');
const orderService = require('../services/orderService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.send({data: order});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await orderService.getOrders(req.user._id);
    res.send({data: orders});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);
    res.send({data: order});
  } catch (error) {
    res.send({error: error.message});
  }
});

module.exports = router;