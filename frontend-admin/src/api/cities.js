import { api } from "./http";

export const getAllCities = async () => {
  const res = await api.get("/city");
  return res.data;
};
