const express = require('express');
const productService = require('../services/productService');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.send({data: product});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.send({data: product});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await productService.getProducts()
    res.send({data: products});
  } catch (error) {
    res.send({error: error.message});
  }
});

// Update user profile (Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !=="admin") {
      throw new Error('You do not have permission to perform this action');
    }
    const product = await productService.updateProduct(req.params.id, req.body);
    const updatedProduct = await productService.getProductById(req.params.id);
    res.send({data: updatedProduct});
  } catch (error) {
    res.send({error: error.message});
  }
});

// Delete user (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return {data: "Deleted product"};
  } catch (error) {
    return {error: error};
  }
});

module.exports = router;