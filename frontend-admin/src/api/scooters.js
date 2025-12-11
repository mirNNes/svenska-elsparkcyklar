import { httpGet } from "./http";

export function getAllBikes() {
  return httpGet("/bikes");
}
