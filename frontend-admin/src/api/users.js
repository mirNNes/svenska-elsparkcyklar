import { api as axios } from "./http";

// Alla användare (admin)
export const getAllUsers = async () => {
  const response = await axios.get("/user");
  return response.data;
};
