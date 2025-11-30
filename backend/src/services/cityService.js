const City = require('../models/City');

async function getAllCities() {
  return await City.find();
}

async function getCityById(id) {
  return await City.findOne({ id });
}

async function createCity(data) {
  return await City.create(data);
}

async function updateCity(id, data) {
  return await City.findOneAndUpdate({ id }, data, { new: true });
}

async function deleteCity(id) {
  return await City.findOneAndDelete({ id });
}

module.exports = { getAllCities, getCityById, createCity, updateCity, deleteCity };
