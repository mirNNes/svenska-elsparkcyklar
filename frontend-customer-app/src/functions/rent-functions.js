export function makeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();
    const hour = newDate.getHours();
    const minute = newDate.getMinutes();

    const timeString = `${day}/${month+1}/${year} ${hour}:${minute}`;

    return timeString;
}

export function calcTime(startTime) {
    let diff = Math.abs(new Date() - new Date(startTime));
    let minutes = Math.floor((diff/1000)/60);

    return minutes;
}

export function calcPrice(startTime) {
    let minutes = calcTime(startTime);
    let price = (minutes * 2) + 10;

    return price;
}

function checkIfInside(spotCoordinates, center, radius) {
    let newRadius = distanceInKmBetweenEarthCoordinates(spotCoordinates[0], spotCoordinates[1], center.lat, center.lng);

    if( newRadius < radius ) {
        //point is inside the circle
        return true;
    }
    //point is on the circle
    return false;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function calcLatLng(startTime, startLat, startLng, center, radius) {
    let rndLat = Math.floor(Math.random() * 2) + 1;
    let rndLng = Math.floor(Math.random() * 2) + 1;
    let minutes = calcTime(startTime);

    let endingLat = startLat + (minutes * 0.0001);
    let endingLng = startLng + (minutes * 0.0001); 

    if (rndLat == 1){
        endingLat = startLat - (minutes * 0.0001);
    }

    if (rndLng == 1){
        endingLng = startLng - (minutes * 0.0001); 
    }

    let insideOK = checkIfInside({endingLat, endingLng}, center, radius);

    if (insideOK) {
        return [endingLat, endingLng];
    }

    return [startLat, startLng];

}