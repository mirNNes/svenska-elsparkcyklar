// Repository för användare: ansvarar för CRUD i en in-memory-lista (inför byte till MongoDB).
const User = require("../models/User");

async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  return await User.findOne({ id });
}

async function createUser({ name, email }) {
  // Räkna ut nästa id dynamiskt
  const lastUser = await User.findOne().sort({ id: -1 });
  const nextId = lastUser ? lastUser.id + 1 : 1;

  const user = new User({
    id: nextId,
    name,
    email,
  });

  await user.save();
  return user;
}

async function updateUser(id, updates) {
  const user = await User.findOne({ id });
  if (!user) return null;

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;

  await user.save();
  return user;
}

async function deleteUser(id) {
  const result = await User.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

