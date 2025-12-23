// API-anrop för stationer och zoner i admin-frontend.
import { api as axios } from "./http";

export const getAllStations = async () => {
  const response = await axios.get("/station");
  return response.data;
};

export const getAllParkingZones = async () => {
  const response = await axios.get("/parking-zone");
  return response.data;
};

export const getAllAllowedZones = async () => {
  const response = await axios.get("/allowed-zone");
  return response.data;
};
