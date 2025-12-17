import { httpGet } from "./http";

export function getAllCities() {
  return httpGet("/city");
}
