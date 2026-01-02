import { api } from "./http";

export const getAllInvoices = async () => {
  const res = await api.get("/invoice/me");
  return res.data;
};
