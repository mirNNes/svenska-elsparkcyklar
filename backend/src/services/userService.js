const User = require('../models/User');

async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  return await User.findOne({ id });
}

async function createUser(data) {
  return await User.create(data);
}

async function updateUser(id, data) {
  return await User.findOneAndUpdate({ id }, data, { new: true });
}

async function deleteUser(id) {
  return await User.findOneAndDelete({ id });
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
