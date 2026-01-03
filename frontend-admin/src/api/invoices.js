import { api } from "./http";

// Alla fakturor (admin)
export const getAllInvoices = async () => {
  const res = await api.get("/invoice");
  return res.data;
};

// Fakturor för specifik användare (admin)
export const getInvoicesByUser = async (userId) => {
  const res = await api.get(`/invoice/user/${userId}`);
  return res.data;
};

// En specifik faktura (admin)
export const getInvoiceById = async (invoiceId) => {
  const res = await api.get(`/invoice/${invoiceId}`);
  return res.data;
};

// Betala faktura (admin)
export const payInvoice = async (invoiceId) => {
  const res = await api.post(`/invoice/${invoiceId}/pay`);
  return res.data;
};
