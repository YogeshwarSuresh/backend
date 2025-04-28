const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI,{ dbName: "ecommerce"});
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

module.exports = connectDB;
