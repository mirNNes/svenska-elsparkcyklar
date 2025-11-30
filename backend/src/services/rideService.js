const Ride = require('../models/Ride');

async function getAllRides() {
  return await Ride.find();
}

async function getRideById(id) {
  return await Ride.findOne({ id });
}

async function createRide(data) {
  return await Ride.create(data);
}

async function updateRide(id, data) {
  return await Ride.findOneAndUpdate({ id }, data, { new: true });
}

async function deleteRide(id) {
  return await Ride.findOneAndDelete({ id });
}

module.exports = { getAllRides, getRideById, createRide, updateRide, deleteRide };
