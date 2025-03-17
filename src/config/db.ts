import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('',{ dbName: "ecommerce"});
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

export default connectDB;
