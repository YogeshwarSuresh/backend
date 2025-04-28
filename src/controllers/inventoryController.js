const express = require('express');
const inventoryService = require('../services/inventoryService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

/**
 * Get all inventory records
 * GET /inventory
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can view all inventory' });
    }

    const inventory = await inventoryService.getAllInventory();
    res.send({ data: inventory });
  } catch (error) {
    console.error('Get all inventory error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get low stock items
 * GET /inventory/low-stock?threshold=5
 */
router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can view low stock items' });
    }

    const threshold = parseInt(req.query.threshold) || 5;
    const lowStockItems = await inventoryService.getLowStockItems(threshold);

    res.send({ data: lowStockItems });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Check stock availability for multiple products
 * POST /inventory/check-availability
 * Body: { items: [{ productId: string, quantity: number }, ...] }
 */
router.post('/check-availability', async (req, res) => {
  try {
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).send({ error: 'Items array is required' });
    }

    const result = await inventoryService.checkStockAvailability(req.body.items);
    res.send({ data: result });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Bulk update inventory (admin only)
 * POST /inventory/bulk-update
 * Body: { items: [{ productId: string, stock: number }, ...] }
 */
router.post('/bulk-update', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can perform bulk updates' });
    }

    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).send({ error: 'Items array is required' });
    }

    const result = await inventoryService.bulkUpdateInventory(req.body.items);
    res.send({ data: result });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get inventory for a specific product
 * GET /inventory/:productId
 */
router.get('/:productId', async (req, res) => {
  try {
    const stock = await inventoryService.getStock(req.params.productId);
    res.send({ data: stock });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Update inventory for a product
 * PUT /inventory/:productId
 * Body: { stock: number }
 */
router.put('/:productId', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can update inventory' });
    }

    if (req.body.stock === undefined) {
      return res.status(400).send({ error: 'Stock quantity is required' });
    }

    const updatedStock = await inventoryService.updateStock(req.params.productId, req.body.stock);
    res.send({ data: updatedStock });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(400).send({ error: error.message });
  }
});

/**
 * Adjust inventory for a product (increment/decrement)
 * PATCH /inventory/:productId/adjust
 * Body: { adjustment: number }
 */
router.patch('/:productId/adjust', authMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can adjust inventory' });
    }

    if (req.body.adjustment === undefined) {
      return res.status(400).send({ error: 'Adjustment value is required' });
    }

    const updatedStock = await inventoryService.adjustStock(
      req.params.productId,
      req.body.adjustment
    );

    res.send({ data: updatedStock });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;