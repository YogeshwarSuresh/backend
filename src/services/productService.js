const Product = require("../models/product");

const createProduct = async (data) => {
  return Product.create(data);
};

const getProducts = async () => {
  return Product.find();
};

const getProductById = async (id) => {
  return Product.findById(id);
};

const updateProduct = async (id, data) => {
  return Product.updateOne(id, {$set: data});
};

const deleteProduct = async (id) => {
  return Product.updateOne(id, {$set: {isDeleted: true}});
};

module.exports = {createProduct, getProductById, getProducts, updateProduct, deleteProduct};