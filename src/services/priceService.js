const Price = require('../models/price');

const setProductPrice = async (productId, price, discount) => {
    return  Price.create({ product: productId, price, discount, effectiveDate: new Date() });
};

const getPriceHistory = async (productId) => {
    return Price.find({product: productId}).sort({effectiveDate: -1});
};

module.exports = {setProductPrice, getPriceHistory};