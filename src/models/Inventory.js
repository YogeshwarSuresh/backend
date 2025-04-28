const mongoose = require('mongoose');
const inventorySchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    stock: {type: Number, required: true, min: 0}, // Minimum is 0 (out of stock)
    lastUpdated: {type: Date, default: Date.now},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
  },
  {
    timestamps: true,
  });

module.exports= mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);