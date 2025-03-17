import mongoose, { Document } from 'mongoose';

interface IPrice extends Document {
    product: mongoose.Types.ObjectId;
    price: number;
    discount: number; // Discount percentage
    effectiveDate: Date;
    deletedAt: Date;
    isDeleted: boolean;
}

const priceSchema = new mongoose.Schema<IPrice>({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // Discount in percentage (0-100)
    effectiveDate: { type: Date, default: Date.now }, // When the price is updated
    deletedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
},{
    timestamps: true,
});

const Price = mongoose.model('Price', priceSchema);
export default Price;
