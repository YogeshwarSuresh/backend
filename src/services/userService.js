const bcrypt = require('bcrypt');
const User = require('../models/user');
const {ObjectId} = require("mongodb");

const create = async (data) => {
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
    return User.find();
  } catch (error) {
    console.log(error);
  }
};

const findById = async (id) => {
  try {
    return await User.findById(new ObjectId(id));
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (id, data) => {
  return User.updateOne({_id: id}, {$set: data});
};

const deleteUser = async (id) => {
  return User.updateOne({_id: id}, {$set: {isDeleted: true, deletedAt: new Date()}});
};

module.exports = {create, authenticate, find, findById, updateUser, deleteUser};
