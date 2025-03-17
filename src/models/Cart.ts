import mongoose, {Document, Model} from 'mongoose';

interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    products: ICartItem[];
}

const cartSchema = new mongoose.Schema<ICart>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1, min: 1 },
        },
    ],
    },
    {
        timestamps: true,
    }
);

const Cart: Model<ICart> = mongoose.model('Cart', cartSchema);
export { Cart, ICartItem, ICart };
