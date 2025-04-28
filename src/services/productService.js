const Product = require("../models/product");

const createProduct = async (data) => {
  // Accept imageUrl from the frontend
  const { name, description, price, category, company, imageUrl } = data;

  return Product.create({
    name,
    description,
    price,
    category,
    company,
    imageUrl
  });
};

const getProducts = async () => {
  return Product.find({ isDeleted: { $ne: true } }).populate('company', 'name');
};

const getProductById = async (id) => {
  return Product.findById(id);
};

const updateProduct = async (id, data) => {
  // Accept imageUrl in the update as well
  return Product.findByIdAndUpdate(id, { $set: data }, { new: true });
};

const deleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { $set: { isDeleted: true } });
};

module.exports = {createProduct, getProductById, getProducts, updateProduct, deleteProduct};