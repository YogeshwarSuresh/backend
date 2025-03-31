const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
  price: {type: Number, required: true},
  discount: {type: Number, default: 0, min: 0, max: 100}, // Discount in percentage (0-100)
  effectiveDate: {type: Date, default: Date.now}, // When the price is updated
  deletedAt: {type: Date, default: Date.now},
  isDeleted: {type: Boolean, default: false},
}, {
  timestamps: true,
});

const Price = mongoose.model('Price', priceSchema);
module.exports = Price;
