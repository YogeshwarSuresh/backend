const express = require('express');
const cartService = require('../services/cartService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Add product to cart
 * POST /cart
 * Body: { productId: string, quantity: number }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate request
    if (!req.body.productId) {
      return res.status(400).send({ error: 'Product ID is required' });
    }

    const quantity = req.body.quantity || 1;

    if (quantity <= 0) {
      return res.status(400).send({ error: 'Quantity must be greater than 0' });
    }

    const cart = await cartService.addToCart(req.user._id, req.body.productId, quantity);
    res.status(200).send({ data: cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).send({ error: error.message });
  }
});

/**
 * Update cart item quantity
 * PUT /cart
 * Body: { productId: string, quantity: number }
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    // Validate request
    if (!req.body.productId || !req.body.quantity) {
      return res.status(400).send({ error: 'Product ID and quantity are required' });
    }

    const cart = await cartService.updateCart(req.user._id, {
      productId: req.body.productId,
      quantity: req.body.quantity
    });

    res.status(200).send({ data: cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(400).send({ error: error.message });
  }
});

/**
 * Get user's cart
 * GET /cart
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).send({ data: cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Remove product from cart
 * DELETE /cart/remove/:productId
 */
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
    res.status(200).send({ data: cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Clear cart
 * DELETE /cart
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await cartService.clearCart(req.user._id);
    res.status(200).send({ data: { message: 'Cart cleared successfully' } });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Validate cart against inventory
 * GET /cart/validate
 */
router.get('/validate', authMiddleware, async (req, res) => {
  try {
    const validation = await cartService.validateCartInventory(req.user._id);
    res.status(200).send({ data: validation });
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Prepare cart for checkout
 * GET /cart/checkout
 */
router.get('/checkout', authMiddleware, async (req, res) => {
  try {
    const checkoutData = await cartService.prepareCartForCheckout(req.user._id);

    if (!checkoutData.valid) {
      return res.status(400).send({
        error: 'Inventory issues detected',
        data: checkoutData
      });
    }

    res.status(200).send({ data: checkoutData });
  } catch (error) {
    console.error('Checkout preparation error:', error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;