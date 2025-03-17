import {Cart} from '../models/Cart';
import {ObjectId} from "mongodb";

export const addToCart = async (userId: string, productId: string, quantity: number) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart();
    } else {
        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: new ObjectId(productId), quantity });
        }
    }
    return await cart.save();
};

export const getCart = async (userId: string) => {
    return await Cart.findOne({ user: userId }).populate('products.product');
};

export const removeFromCart = async (userId: string, productId: string) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;
    cart.products = cart.products.filter((item) => item.product.toString() !== productId);
    return await cart.save();
};

export const clearCart = async (userId: string) => {
    return await Cart.findOneAndDelete({ user: userId });
};
