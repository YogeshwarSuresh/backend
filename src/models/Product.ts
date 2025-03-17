import mongoose, { Document } from 'mongoose';

interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    company: mongoose.Types.ObjectId;
}

const productSchema = new mongoose.Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
},{
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
