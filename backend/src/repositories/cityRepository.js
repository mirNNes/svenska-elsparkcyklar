// Repository för städer: sköter CRUD mot en in-memory-lista (förberedelse för MongoDB).
let nextCityId = 3;
const cities = [
  { id: 1, name: "Stockholm", scootersAvailable: 120 },
  { id: 2, name: "Göteborg", scootersAvailable: 80 },
];
async function getAllCities() {
  return cities;
}
async function getCityById(id) {
  return cities.find((city) => city.id === id) || null;
}
async function createCity({ name, scootersAvailable }) {
  const city = {
    id: nextCityId++,
    name,
    scootersAvailable: Number.isFinite(scootersAvailable)
      ? scootersAvailable
      : 0,
  };
  cities.push(city);
  return city;
}
async function updateCity(id, updates) {
  const city = cities.find((c) => c.id === id);
  if (!city) {
    return null;
  }
  if (updates.name !== undefined) {
    city.name = updates.name;
  }
  if (updates.scootersAvailable !== undefined) {
    city.scootersAvailable = updates.scootersAvailable;
  }
  return city;
}
async function deleteCity(id) {
  const index = cities.findIndex((c) => c.id === id);
  if (index === -1) {
    return false;
  }
  cities.splice(index, 1);
  return true;
}
module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};
