const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  category: {type: String, required: true},
  company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
  imageUrl: {type: String},
  isDeleted: {type: Boolean, default: false},
}, {
  timestamps: true,
});



module.exports = mongoose.models.Product  || mongoose.model('Product', productSchema);