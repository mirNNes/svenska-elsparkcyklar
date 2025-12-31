import { httpGet } from "./http";

export function getAllInvoices() {
  return httpGet("/invoice/me");
}
