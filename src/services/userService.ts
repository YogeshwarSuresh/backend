import bcrypt from 'bcryptjs'
import {ObjectId} from "mongodb";
import User from '../models/User';

const create = async (data: { name: string; email: string; password: string }) => {
    const user = new User({...data, role: 'customer'});
    return await user.save();
};

const authenticate = async (email: string, password: string) => {
    const user = await User.findOne({email});
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    return user;
}

const find = async () => {
    try {
        return User.find();
    } catch (error) {
        console.log(error);
    }
};

const findById = async (id: string) => {
    try {
        return await User.aggregate([{$match: {_id: new ObjectId(id)}}]);
    } catch (error) {
        console.log(error);
    }
};

const updateUser = async (id: ObjectId, data: Partial<{
    name: string;
    email: string;
}>) => {
    return User.updateOne({_id: id}, {data: data});
};

const deleteUser = async (id: string) => {
    return User.updateOne({_id: id}, {isDeleted: true, deletedAt: new Date()});
};

export default {create, authenticate, find, findById, updateUser, deleteUser};