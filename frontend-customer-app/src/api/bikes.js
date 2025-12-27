import { httpGet } from "./http";

export function getAllBikes() {
  return httpGet("/bike");
}

export function rentBike(bikeID, userID) {
  return httpGet(`/bike/rent/${bikeID}/${userID}`);
}
