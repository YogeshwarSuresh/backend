import Price from '../models/Price';

export const setProductPrice = async (productId: string, price: number, discount: number) => {
    return await Price.create({ product: productId, price, discount, effectiveDate: new Date() });
};

export const getPriceHistory = async (productId: string) => {
    return await Price.find({ product: productId }).sort({ effectiveDate: -1 });
};
