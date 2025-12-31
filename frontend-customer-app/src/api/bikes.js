import { api as axios } from "./http"; 

// Hämta alla cyklar
export const getAllBikes = async () => {
  const response = await axios.get("/bike");
  return response.data;
};

// Hyr en cykel
export const rentBike = async (bikeId) => {
  try {
    const response = await axios.patch("/ride/start", {
      bikeId,
    });
    return response.data;
  } catch (err) {
    console.error("Error renting bike:", err);
    throw err;
  }
};

// Återlämna en cykel
export const returnBike = async (rideId) => {
  try {
    const response = await axios.patch("/ride/end", {
      rideId,
    });
    return response.data;
  } catch (err) {
    console.error("Error returning bike:", err);
    throw err;
  }
};


// Rides
export const getAllRides = async () => {
  const response = await axios.get("/ride/me");
  return response.data;
}

export const getActiveRide = async () => {
  const response = await axios.get("/ride/active");
  return response.data;
}

export const getRide = async () => {
  const response = await axios.get(`/ride/${rideID}`);
  return response.data;
}
