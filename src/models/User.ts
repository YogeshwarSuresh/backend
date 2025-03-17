import mongoose, {Document} from 'mongoose';
import {ObjectId} from "mongodb";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'admin';
}

const userSchema = new mongoose.Schema<IUser>({
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, default: 'customer'},
    },
    {
        timestamps: true,
    });

const User = mongoose.model('User', userSchema);

export default User;
