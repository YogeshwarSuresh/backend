import Inventory from '../models/Inventory';

export const updateStock = async (productId: string, stock: number) => {
    return await Inventory.findOneAndUpdate({ product: productId }, { stock, lastUpdated: new Date() }, { upsert: true, new: true });
};

export const getStock = async (productId: string) => {
    return await Inventory.findOne({ product: productId });
};
