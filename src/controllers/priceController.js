const express = require('express');
const priceService = require('../services/priceService.js');

const router = express.Router();

router.get('/:productId', async (req, res) => {
  try {
    const price = await priceService.getPriceHistory(req.params.productId);
    res.json(price);
  } catch (error) {
    res.send({error: error.message});
  }
});

// need to add more admin validation
router.put('/:productId', async (req, res) => {
  try {
    const updatedPrice = await priceService.setProductPrice(req.params.productId, req.body.price);
    res.send({data: updatedPrice});
  } catch (error) {
    res.send({error: error.message});
  }
});

module.exports = router;