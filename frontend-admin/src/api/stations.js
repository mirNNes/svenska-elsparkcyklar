import { api } from "./http";

// Alla laddstationer
export const getAllStations = async () => {
  const res = await api.get("/station");
  return res.data;
};

// Flytta cykel till laddstation
export const moveBikeToStation = async (bikeId, stationId) => {
  const res = await api.patch(
    `/bike/${bikeId}/move-to-station/${stationId}`
  );
  return res.data;
};
