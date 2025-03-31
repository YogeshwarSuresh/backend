const express = require('express');
const cartService = require('../services/cartService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.addToCart(req.user._id, req.body);
    res.send({data: cart});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.updateCart(req.user._id, req.body);
    res.send({data: cart});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.send({ data: cart })
  } catch (error) {
    res.send({error: error.message});
  }
});

router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
    res.send({data: cart});
  } catch (error) {
    res.send({error: error.message});
  }
});

module.exports = router;