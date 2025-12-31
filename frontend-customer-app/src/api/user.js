import { api as axios } from "./http"; 

export const getUSer = async () => {
  const response = await axios.get("/user/me");
  return response.data;
};

export const editUser = async () => {
  const response = await axios.get("/user/edit/");
  return response.data;
};
