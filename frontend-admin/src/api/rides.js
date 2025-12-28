// API-anrop för resor (rides) i admin-UI.
import { api as axios } from "./http";

// Hämta aktiv resa för en cykel (admin)
export const getActiveRideForBike = async (bikeId) => {
  const response = await axios.get(`/ride/active/bike/${bikeId}`);
  return response.data;
};

// Alla resor (admin)
export const getAllRides = async () => {
  const response = await axios.get("/ride");
  return response.data;
};

// Avsluta resa (admin)
export const endRide = async (rideId) => {
  const response = await axios.put(`/ride/${rideId}/end`);
  return response.data;
};