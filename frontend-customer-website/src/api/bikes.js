import { httpGet } from "./http";
import { httpPost } from "./http";

// Bikes

export function getAllBikes() {
  return httpGet("/bike");
}

export function rentBike(bikeID, userID) {
  return httpPost(`/bike/rent/${bikeID}/${userID}`);
}

export function returnBike(rentID) {
  return httpPost(`/bike/rent-leave/${rentID}`);
}


// Rides

export function getAllRides() {
  return httpGet(`/ride/me`);
}

export function getActiveRide() {
  return httpGet(`/ride/active`);
}

export function getRide(rideID) {
  return httpGet(`/ride/${rideID}`);
}
