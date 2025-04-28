const Product = require("../models/product");
const fs = require('fs');
const path = require('path');

const createProduct = async (data) => {
  return Product.create(data);
};

const getProducts = async () => {
  return Product.find({isDeleted: {$ne: true}});
};

const getProductById = async (id) => {
  return Product.findById(id);
};

const updateProduct = async (id, data) => {
  // If we're updating the image, we should delete the old one
  if (data.imagePath) {
    const product = await Product.findById(id);

    if (product && product.imagePath) {
      try {
        // Delete old image file if it exists
        const oldImagePath = product.imagePath;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with update even if file deletion fails
      }
    }
  }

  return Product.updateOne({_id: id}, {$set: data});
};

const deleteProduct = async (id) => {
  // Soft delete the product
  const result = await Product.updateOne({_id: id}, {$set: {isDeleted: true}});

  // Optionally, you could also delete the image file here
  // But for a soft delete, it's usually better to keep the files

  return result;
};

// Hard delete function (optional - for admin cleanup purposes)
const purgeProduct = async (id) => {
  const product = await Product.findById(id);

  if (product && product.imagePath) {
    try {
      // Delete image file if it exists
      if (fs.existsSync(product.imagePath)) {
        fs.unlinkSync(product.imagePath);
      }
    } catch (error) {
      console.error('Error deleting image during purge:', error);
    }
  }

  return Product.deleteOne({_id: id});
};

module.exports = {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  purgeProduct // Optional additional function
};