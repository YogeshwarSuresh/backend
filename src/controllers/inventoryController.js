const express = require('express');
const inventoryService = require('../services/inventoryService.js');

const router = express.Router();

router.get('/:productId', async (req, res) => {
  try {
    const stock = await inventoryService.getStock(req.params.productId);
    res.send({data: stock});
  } catch (error) {
    res.send({error: error.message});
  }
});

router.put('/:productId', async (req, res) => {
  try {
    const updatedStock = await inventoryService.updateStock(req.params.productId, req.body.stock);
    res.send({data: updatedStock});
  } catch (error) {
    res.send({error: error.message});
  }
});

module.exports = router;