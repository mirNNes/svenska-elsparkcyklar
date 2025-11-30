const Bike = require('../models/Bike');

async function getAllBikes() {
  return await Bike.find();
}

async function getBikeById(id) {
  return await Bike.findOne({ id });
}

async function createBike(data) {
  return await Bike.create(data);
}

async function updateBike(id, data) {
  return await Bike.findOneAndUpdate({ id }, data, { new: true });
}

async function deleteBike(id) {
  return await Bike.findOneAndDelete({ id });
}

module.exports = { getAllBikes, getBikeById, createBike, updateBike, deleteBike };
