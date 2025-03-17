import mongoose, {Document, Schema} from 'mongoose';

interface IOrderProduct {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    products: IOrderProduct[];
    totalPrice: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products: [
        {
            product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true},
            price: {type: Number, required: true}
        }
    ],
    totalPrice: {type: Number, required: true},
    status: {type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending'},
}, {
    timestamps: true,
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;