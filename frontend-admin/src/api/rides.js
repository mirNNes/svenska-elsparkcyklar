// API-anrop för resor (rides) i admin-UI.
import { api } from "./http";

// Hämta aktiv resa för en cykel (admin)
export const getActiveRideForBike = async (bikeId) => {
  const response = await api.get(`/ride/active/bike/${bikeId}`);
  return response.data;
};

// Alla resor (admin)
export const getAllRides = async () => {
  const res = await api.get("/ride");
  return res.data;
};

// Avsluta resa (admin)
export const endRide = async (rideId) => {
  const response = await api.post("/ride/end", { rideId });
  return response.data;
};

// Resor för specifik användare (admin)
export const getRidesByUser = async (userId) => {
  const res = await api.get(`/ride/user/${userId}`);
  return res.data;
};