import { api } from "./http"; 

// Hämta alla cyklar
export const getAllBikes = async () => {
  const response = await api.get("/bike");
  return response.data;
};

// Hyr en cykel
export const rentBike = async (bikeId) => {
  try {
    const response = await api.patch(`/bike/rent/${bikeId}/admin`);
    return response.data;
  } catch (err) {
    console.error("Error renting bike:", err);
    throw err;
  }
};

// Återlämna en cykel
export const returnBike = async (bikeId) => {
  try {
    const response = await api.patch(`/bike/return/${bikeId}/admin`);
    return response.data;
  } catch (err) {
    console.error("Error returning bike:", err);
    throw err;
  }
};

// Flytta en cykel to laddstation
export const moveBikeToStation = async (bikeId, stationId) => {
  const res = await api.patch(
    `/bike/${bikeId}/move-to-station/${stationId}`
  );
  return res.data;
};

// Ta bort en cykel från laddstation
export async function removeBikeFromStation(bikeId) {
  const res = await api.post(`/bike/${bikeId}/remove-from-station`);
  return res.data;
}