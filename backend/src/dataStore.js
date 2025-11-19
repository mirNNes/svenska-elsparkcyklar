// Gemensam in-memory-store för stads-, användar-, cykel- och ride-data.
const cities = [
  { id: 1, name: "Stockholm", scootersAvailable: 120 },
  { id: 2, name: "Göteborg", scootersAvailable: 80 },
];

const users = [
  { id: 1, name: "Mirnes", email: "mirnes@example.com" },
  { id: 2, name: "Rebecka", email: "rebecka@example.com" },
];

const bikes = [
  { id: 1, cityId: 1, isAvailable: true },
  { id: 2, cityId: 2, isAvailable: true },
];

const rents = []; // Aktiv hyrning kopplad till bike-routen.

const rides = [
  {
    id: 1,
    bikeId: 1,
    userId: 1,
    startedAt: "2024-01-01T10:00:00.000Z",
    endedAt: "2024-01-01T10:15:00.000Z",
  },
];

module.exports = {
  cities,
  users,
  bikes,
  rents,
  rides,
};
