import { httpGet } from "./http";

export function getAllScooters() {
  return httpGet("/scooters");
}
