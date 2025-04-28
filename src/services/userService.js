const bcrypt = require('bcrypt');
const User = require('../models/user');
const {ObjectId} = require("mongodb");

const register = async (data) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = new User({...data, password: passwordHash, role: 'customer'});
  return await user.save();
};

const authenticate = async (email, password) => {
  const user = await User.findOne({email}).select("+password");
  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  return user;
}

const find = async () => {
  try {
    return User.find({isDeleted: {$ne: true}});
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching users");
  }
};

const getUserCount = async () => {
  try {
    return await User.countDocuments({isDeleted: {$ne: true}});
  } catch (error) {
    console.log(error);
    throw new Error("Error counting users");
  }
};

const findById = async (id) => {
  try {
    return await User.findById(new ObjectId(id));
  } catch (error) {
    console.log(error);
    throw new Error("User not found");
  }
};

const updateUser = async (id, data) => {
  // Don't allow updating the role through this function
  if (data.role) {
    delete data.role;
  }

  // If password is being updated, hash it
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return User.updateOne({_id: id}, {$set: data});
};

const deleteUser = async (id) => {
  return User.updateOne({_id: id}, {$set: {isDeleted: true, deletedAt: new Date()}});
};

module.exports = {
  register,
  authenticate,
  find,
  findById,
  updateUser,
  deleteUser,
  getUserCount
};