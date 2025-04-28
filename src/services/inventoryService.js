const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

/**
 * Updates stock quantity for a product
 * @param {string} productId - Product ID
 * @param {number} stock - New stock quantity
 * @param {object} options - Optional parameters like session for transactions
 * @returns {Promise<Object>} - Updated inventory record
 */
const updateStock = async (productId, stock, options = {}) => {
  try {
    if (stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const update = {
      stock,
      lastUpdated: new Date()
    };

    const updatedInventory = await Inventory.findOneAndUpdate(
      {product: productId},
      update,
      {
        upsert: true,
        new: true,
        ...options
      }
    );

    return updatedInventory;
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Incrementally adjusts stock quantity for a product
 * @param {string} productId - Product ID
 * @param {number} adjustment - Amount to adjust (positive or negative)
 * @param {object} options - Optional parameters like session for transactions
 * @returns {Promise<Object>} - Updated inventory record
 */
const adjustStock = async (productId, adjustment, options = {}) => {
  try {
    // Get current inventory
    const inventory = await Inventory.findOne({product: productId});

    // If no inventory record exists and we're reducing stock, that's an error
    if (!inventory && adjustment < 0) {
      throw new Error(`No inventory record found for product ${productId}`);
    }

    // If inventory exists, make sure we don't go below zero
    if (inventory && inventory.stock + adjustment < 0) {
      throw new Error(`Not enough stock for product ${productId}`);
    }

    // Current stock or 0 if no record exists
    const currentStock = inventory ? inventory.stock : 0;

    // Update the inventory with new stock level
    return updateStock(productId, currentStock + adjustment, options);
  } catch (error) {
    console.error(`Error adjusting stock for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Gets current stock information for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Inventory record
 */
const getStock = async (productId) => {
  try {
    return await Inventory.findOne({product: new ObjectId(productId)});
  } catch (error) {
    console.error(`Error getting stock for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Gets low stock items (optionally below a threshold)
 * @param {number} threshold - Stock threshold to consider "low" (default: 5)
 * @returns {Promise<Array>} - List of inventory items with low stock
 */
const getLowStockItems = async (threshold = 5) => {
  try {
    return await Inventory.find({stock: {$lte: threshold}})
      .populate('product', 'name price category');
  } catch (error) {
    console.error(`Error fetching low stock items:`, error);
    throw error;
  }
};

/**
 * Checks if there's enough stock for a list of products
 * @param {Array} items - Array of {productId, quantity} objects
 * @returns {Promise<{success: boolean, message: string, insufficientItems: Array}>}
 */
const checkStockAvailability = async (items) => {
  try {
    const result = {
      success: true,
      message: 'All items in stock',
      insufficientItems: []
    };

    // Check each item
    for (const item of items) {
      const inventory = await getStock(item.productId || item.product);

      if (!inventory || inventory.stock < item.quantity) {
        result.success = false;
        result.insufficientItems.push({
          productId: item.productId || item.product,
          requested: item.quantity,
          available: inventory ? inventory.stock : 0
        });
      }
    }

    if (!result.success) {
      result.message = `Some items have insufficient stock`;
    }

    return result;
  } catch (error) {
    console.error('Error checking stock availability:', error);
    throw error;
  }
};

/**
 * Gets all inventory records
 * @returns {Promise<Array>} - All inventory records
 */
const getAllInventory = async () => {
  try {
    return await Inventory.find()
      .populate('product', 'name price category');
  } catch (error) {
    console.error('Error fetching all inventory:', error);
    throw error;
  }
};

/**
 * Bulk update inventory for multiple products (for initial setup or import)
 * @param {Array} items - Array of {productId, stock} objects
 * @returns {Promise<{success: boolean, updated: number, errors: Array}>}
 */
const bulkUpdateInventory = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = {
      success: true,
      updated: 0,
      errors: []
    };

    for (const item of items) {
      try {
        await updateStock(item.productId, item.stock, {session});
        result.updated++;
      } catch (error) {
        result.errors.push({
          productId: item.productId,
          error: error.message
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    // Commit or abort transaction
    if (result.success) {
      await session.commitTransaction();
    } else {
      await session.abortTransaction();
    }

    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  updateStock,
  adjustStock,
  getStock,
  getLowStockItems,
  checkStockAvailability,
  getAllInventory,
  bulkUpdateInventory
};