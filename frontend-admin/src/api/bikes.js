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
