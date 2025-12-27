import { httpGet } from "./http";

export function getInvoiceMe() {
  return httpGet("/invoice/me");
}
