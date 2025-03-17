import mongoose, { Document } from 'mongoose';

interface IInventory extends Document {
    product: mongoose.Types.ObjectId;
    stock: number;
    lastUpdated: Date;
}

const inventorySchema = new mongoose.Schema<IInventory>({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    stock: { type: Number, required: true, min: 0 }, // Minimum is 0 (out of stock)
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},
    {
        timestamps: true,
    });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
