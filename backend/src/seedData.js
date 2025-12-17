// Enkelt seed-skript som fyller databasen med några städer och cyklar
const City = require("./models/City");
const Bike = require("./models/Bike");

const seedCities = [
  {
    name: "Ystad",
    center: { lat: 55.4295, lng: 13.82 },
    radius: 5000,
  },
  {
    name: "Sundsvall",
    center: { lat: 62.3908, lng: 17.3069 },
    radius: 7000,
  },
  {
    name: "Kiruna",
    center: { lat: 67.8558, lng: 20.2253 },
    radius: 8000,
  },
];

// Skapa några cyklar runt stadens center
function createBikePositions(center, count) {
  // Liten offset i grader (~0.005 ≈ 500 m) för att sprida cyklarna lite
  const offsets = [0, 0.002, -0.002, 0.004, -0.004, 0.006, -0.006];
  const bikes = [];
  for (let i = 0; i < count; i++) {
    const dx = offsets[i % offsets.length];
    const dy = offsets[(i + 3) % offsets.length];
    bikes.push({
      location: {
        lat: center.lat + dx,
        lng: center.lng + dy,
      },
    });
  }
  return bikes;
}

async function seedIfEmpty() {
  const cityCount = await City.countDocuments();
  if (cityCount > 0) {
    console.log("Seed: hoppade över, städer finns redan.");
    return;
  }

  console.log("Seed: skapar teststäder och cyklar...");

  // Börja på nästa lediga city-id och bike-id
  const lastCity = await City.findOne().sort({ id: -1 });
  let nextCityId = lastCity ? lastCity.id + 1 : 1;

  const lastBike = await Bike.findOne().sort({ id: -1 });
  let nextBikeId = lastBike ? lastBike.id + 1 : 1;

  for (const cityData of seedCities) {
    const city = await City.create({
      id: nextCityId++,
      name: cityData.name,
      center: cityData.center,
      radius: cityData.radius,
      scootersAvailable: 0,
    });

    // Skapa 5 cyklar per stad
    const bikes = createBikePositions(cityData.center, 5);
    for (const bikeData of bikes) {
      await Bike.create({
        id: nextBikeId++,
        cityId: city._id,
        isAvailable: true,
        battery: 100,
        location: bikeData.location,
      });
    }
  }

  console.log("Seed: klart.");
}

module.exports = seedIfEmpty;
