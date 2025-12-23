// Repository för användare: ansvarar för CRUD mot MongoDB (ersätter in-memory).
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  return await User.findOne({ id });
}

async function getUserByObjectId(objectId) {
  return await User.findById(objectId);
}

async function getUserByEmail(email) {
  return await User.findOne({ email });
}

async function getUserByUsername(username) {
  return await User.findOne({ username });
}

async function createUser({ name, email, username, role, stats, password }) {
  // Räkna ut nästa id dynamiskt (behåller numeriskt id parallellt med Mongo _id)
  const lastUser = await User.findOne().sort({ id: -1 });
  const nextId = lastUser ? lastUser.id + 1 : 1;

  const passwordHash = await bcrypt.hash(password || "changeme123", 10);

  const user = new User({
    id: nextId,
    name,
    email,
    username,
    role,
    passwordHash,
    stats,
  });

  await user.save();
  return user;
}

async function updateUser(id, updates) {
  const user = await User.findOne({ id });
  if (!user) return null;

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.username !== undefined) user.username = updates.username;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.stats !== undefined) user.stats = updates.stats;

  await user.save();
  return user;
}

async function addBalance(id, amount) {
  const user = await User.findOne({ id });
  if (!user) return null;

  user.balance = Math.round((user.balance + amount) * 100) / 100;
  await user.save();
  return user;
}

async function updateBalanceByObjectId(objectId, newBalance) {
  return await User.findByIdAndUpdate(
    objectId,
    { balance: newBalance },
    { new: true }
  );
}

async function deleteUser(id) {
  const result = await User.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByObjectId,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  addBalance,
  updateBalanceByObjectId,
  deleteUser,
};
