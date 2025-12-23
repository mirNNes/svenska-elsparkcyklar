// API-anrop för resor (rides) i admin-UI.
import { api as axios } from "./http";

// Hämta aktiv resa för en cykel (admin)
export const getActiveRideForBike = async (bikeId) => {
  const response = await axios.get(`/ride/active/bike/${bikeId}`);
  return response.data;
};
