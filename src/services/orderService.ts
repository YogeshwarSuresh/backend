import Order from '../models/Order';
import { ObjectId } from 'mongodb';

export const createOrder = async (
    userId: string,
    products: { product: string; quantity: number; price: number }[],
    totalPrice: number
) => {
    const order = new Order({
        user: new ObjectId(userId),
        products: products.map((item) => ({
            product: new ObjectId(item.product),
            quantity: item.quantity,
            price: item.price
        })),
        totalPrice,
        status: 'pending'
    });
    return await order.save();
};

export const getOrders = async (userId: string) => {
    return Order.find({ user: new ObjectId(userId) })
        .populate('products.product');
};

export const getOrderById = async (orderId: string) => {
    return Order.findById(orderId).populate('products.product');
};

export const updateOrderStatus = async (
    orderId: string,
    status: string
) => {
    return Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
    ).populate('products.product');
};

export const deleteOrder = async (orderId: string) => {
    return Order.findByIdAndDelete(orderId);
};