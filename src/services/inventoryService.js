const Inventory = require('../models/inventory');
const updateStock = async (productId, stock) => {
    return await Inventory.updateOne({ product: productId }, { stock, lastUpdated: new Date() }, { upsert: true, new: true });
};

const getStock = async (productId) => {
    return await Inventory.findOne({ product: productId });
};

module.exports = {getStock, updateStock};
