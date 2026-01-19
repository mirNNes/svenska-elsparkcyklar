import { api } from "./http";

// Alla laddstationer
export const getAllStations = async () => {
  const res = await api.get("/station");
  return res.data;
};
