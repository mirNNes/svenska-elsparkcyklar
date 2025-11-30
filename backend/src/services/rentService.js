const Rent = require('../models/Rent');

async function getAllRents() {
  return await Rent.find();
}

async function getRentById(id) {
  return await Rent.findOne({ id });
}

async function createRent(data) {
  return await Rent.create(data);
}

async function updateRent(id, data) {
  return await Rent.findOneAndUpdate({ id }, data, { new: true });
}

async function deleteRent(id) {
  return await Rent.findOneAndDelete({ id });
}

module.exports = { getAllRents, getRentById, createRent, updateRent, deleteRent };
