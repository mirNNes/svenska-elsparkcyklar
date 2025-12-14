// backend/src/repositories/bikeRepository.js
const BikeModel = require("../models/Bike");

// Dummydata för fallback/test
const dummyBikes = [
  { id: 1, name: "Bike 1", city: "Stockholm", isAvailable: true },
  { id: 2, name: "Bike 2", city: "Göteborg", isAvailable: true },
];

async function getAllBikes() {
  try {
    const bikes = await BikeModel.find({}).lean();
    return bikes.length ? bikes : dummyBikes;
  } catch (err) {
    console.error("Fel vid hämtning av bikes:", err);
    return dummyBikes; // fallback
  }
}

async function getBikeById(id) {
  try {
    if (!Number.isInteger(id)) return null;
    const bike = await BikeModel.findOne({ id }).lean();
    return bike || dummyBikes.find(b => b.id === id) || null;
  } catch (err) {
    console.error("Fel vid hämtning av bike by id:", err);
    return dummyBikes.find(b => b.id === id) || null;
  }
}

async function createBike(data) {
  try {
    const newBike = await BikeModel.create(data);
    return newBike.toObject();
  } catch (err) {
    console.error("Fel vid skapande av bike:", err);
    // dummydata (endast för test)
    const newId = dummyBikes.length + 1;
    const bike = { id: newId, ...data };
    dummyBikes.push(bike);
    return bike;
  }
}

async function deleteBike(id) {
  try {
    const result = await BikeModel.deleteOne({ id });
    if (result.deletedCount === 0) return { success: false, reason: "not_found" };
    return { success: true };
  } catch (err) {
    console.error("Fel vid deleteBike:", err);
    return { success: false, reason: "error" };
  }
}


module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  deleteBike,
};
