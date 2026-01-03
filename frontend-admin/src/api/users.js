import { api } from "./http";

// Alla användare (admin)
export const getAllUsers = async () => {
  const res = await api.get("/user");
  return res.data;
};

// En användare (admin)
export const getUserById = async (id) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};
