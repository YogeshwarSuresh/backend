const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const inventoryService = require('./inventoryService');
const productService = require('./productService');

/**
 * Add a product to the user's cart with inventory validation
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
const addToCart = async (userId, productId, quantity = 1) => {
    try {
        // First check if we have enough inventory
        const inventory = await inventoryService.getStock(productId);
        if (!inventory || inventory.stock < quantity) {
            const available = inventory ? inventory.stock : 0;
            throw new Error(`Insufficient stock. Only ${available} item(s) available.`);
        }

        // Get the cart
        let cart = await Cart.findOne({ user: userId });

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({
                user: userId,
                products: [{ product: productId, quantity }]
            });
        } else {
            // Check if product already exists in cart
            const productIndex = cart.products.findIndex(
              item => item.product.toString() === productId
            );

            if (productIndex > -1) {
                // Calculate new total quantity
                const newQuantity = cart.products[productIndex].quantity + quantity;

                // Check again if we have enough stock for the updated quantity
                if (inventory.stock < newQuantity) {
                    throw new Error(`Cannot add ${quantity} more. Only ${inventory.stock} total available.`);
                }

                // Update quantity
                cart.products[productIndex].quantity = newQuantity;
            } else {
                // Add new product to cart
                cart.products.push({ product: productId, quantity });
            }
        }

        return await cart.save();
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

/**
 * Update a product quantity in the cart
 * @param {string} userId - User ID
 * @param {object} product - Product object with productId and quantity
 * @returns {Promise<Object>} - Updated cart
 */
const updateCart = async (userId, product) => {
    try {
        const { productId, quantity } = product;

        // Validate quantity
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        // Check inventory
        const inventory = await inventoryService.getStock(productId);
        if (!inventory || inventory.stock < quantity) {
            const available = inventory ? inventory.stock : 0;
            throw new Error(`Cannot update to ${quantity}. Only ${available} item(s) available.`);
        }

        // Find and update cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error('Cart not found');
        }

        const productIndex = cart.products.findIndex(
          item => item.product.toString() === productId
        );

        if (productIndex === -1) {
            throw new Error('Product not found in cart');
        }

        // Update the quantity
        cart.products[productIndex].quantity = quantity;

        return await cart.save();
    } catch (error) {
        console.error('Error updating cart:', error);
        throw error;
    }
};

/**
 * Get the user's cart with populated product details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Cart with product details
 */
const getCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId })
          .populate('products.product', 'name description price category');

        // If no cart, return empty object
        if (!cart) {
            return {
                user: userId,
                products: [],
                isEmpty: true
            };
        }

        // Add inventory information to each product
        const enhancedCart = { ...cart.toObject() };

        for (let i = 0; i < enhancedCart.products.length; i++) {
            const item = enhancedCart.products[i];
            const inventory = await inventoryService.getStock(item.product._id);

            // Add inventory info
            item.inStock = inventory ? inventory.stock > 0 : false;
            item.availableStock = inventory ? inventory.stock : 0;

            // Flag if quantity exceeds available stock
            if (item.quantity > item.availableStock) {
                item.quantityExceedsStock = true;
            }
        }

        return enhancedCart;
    } catch (error) {
        console.error('Error getting cart:', error);
        throw error;
    }
};

/**
 * Remove a product from the cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Updated cart
 */
const removeFromCart = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error('Cart not found');
        }

        // Remove the product
        cart.products = cart.products.filter(
          item => item.product.toString() !== productId
        );

        return await cart.save();
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

/**
 * Clear all items from the cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Result of operation
 */
const clearCart = async (userId) => {
    try {
        return await Cart.findOneAndDelete({ user: userId });
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};

/**
 * Validate cart items against current inventory
 * @param {string} userId - User ID
 * @returns {Promise<{valid: boolean, issues: Array}>} - Validation result
 */
const validateCartInventory = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.products.length === 0) {
            return { valid: true, issues: [] };
        }

        const issues = [];
        let valid = true;

        // Check each product in cart
        for (const item of cart.products) {
            const inventory = await inventoryService.getStock(item.product);

            if (!inventory || inventory.stock < item.quantity) {
                valid = false;

                // Get product details for better error messages
                const product = await productService.getProductById(item.product);
                const productName = product ? product.name : `Product ${item.product}`;

                issues.push({
                    productId: item.product,
                    productName,
                    requested: item.quantity,
                    available: inventory ? inventory.stock : 0
                });
            }
        }

        return { valid, issues };
    } catch (error) {
        console.error('Error validating cart inventory:', error);
        throw error;
    }
};

/**
 * Prepare cart for checkout - validates inventory and returns cart with product details
 * @param {string} userId - User ID
 * @returns {Promise<{cart: Object, valid: boolean, issues: Array}>}
 */
const prepareCartForCheckout = async (userId) => {
    try {
        const cart = await getCart(userId);

        if (!cart || cart.isEmpty || cart.products.length === 0) {
            throw new Error('Cart is empty');
        }

        const validation = await validateCartInventory(userId);

        return {
            cart,
            valid: validation.valid,
            issues: validation.issues
        };
    } catch (error) {
        console.error('Error preparing cart for checkout:', error);
        throw error;
    }
};

module.exports = {
    addToCart,
    updateCart,
    getCart,
    removeFromCart,
    clearCart,
    validateCartInventory,
    prepareCartForCheckout
};