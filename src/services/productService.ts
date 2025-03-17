import Product from '../models/Product';

export const createProduct = async (data: { name: string; description: string; price: number; category: string; company: string }) => {
    const product = new Product(data);
    return await product.save();
};

export const getProducts = async () => {
    return Product.find().populate('company');
};

export const getProductById = async (id: string) => {
    return Product.findById(id).populate('company');
};

export const updateProduct = async (id: string, data: Partial<{ name: string; description: string; price: number; category: string; company: string }>) => {
    return Product.findByIdAndUpdate(id, data, {new: true});
};

export const deleteProduct = async (id: string) => {
    return Product.findByIdAndDelete(id);
};
