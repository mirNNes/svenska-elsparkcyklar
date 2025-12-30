import { httpGet } from "./http";
import { httpPost } from "./http";

// Bikes

export function getAllBikes() {
  return httpGet("/bike");
}

export function rentBike(bikeID, userID) {
  return httpPost("/ride/start", {
                    bikeID,
                    userID,
                  });
}

export function returnBike() {
  return httpPost("/ride/end", {
              rideID,
            });
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
