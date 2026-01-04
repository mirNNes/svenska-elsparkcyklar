import { api } from "./http";

// Alla stationer
export const getAllStations = async () => {
  const res = await api.get("/station");
  return res.data;
};

// Alla parkeringszoner
export const getAllParkingZones = async () => {
  const res = await api.get("/parking-zone");
  return res.data;
};

// Alla tillåtna zoner
export const getAllAllowedZones = async () => {
  const res = await api.get("/allowed-zone");
  return res.data;
};