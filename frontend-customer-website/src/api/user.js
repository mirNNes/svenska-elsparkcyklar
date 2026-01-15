import { api as axios } from "./http"; 

export const getUser = async () => {
  const response = await axios.get("/user/me");
  return response.data;
};

export const editUser = async () => {
  const response = await axios.get("/user/edit/");
  return response.data;
};