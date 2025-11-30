// Repository för städer: sköter CRUD mot en in-memory-lista (förberedelse för MongoDB).
const City = require("../models/City");

async function getAllCities() {
  return await City.find();
}

async function getCityById(id) {
  return await City.findOne({ id });
}

async function createCity({ name, scootersAvailable }) {
  const lastCity = await City.findOne().sort({ id: -1 });
  const nextId = lastCity ? lastCity.id + 1 : 1;

  const city = new City({
    id: nextId,
    name,
    scootersAvailable: Number.isFinite(scootersAvailable) ? scootersAvailable : 0,
  });

  await city.save();
  return city;
}

async function updateCity(id, updates) {
  const city = await City.findOne({ id });
  if (!city) return null;

  if (updates.name !== undefined) city.name = updates.name;
  if (updates.scootersAvailable !== undefined)
    city.scootersAvailable = updates.scootersAvailable;

  await city.save();
  return city;
}

async function deleteCity(id) {
  const result = await City.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};

