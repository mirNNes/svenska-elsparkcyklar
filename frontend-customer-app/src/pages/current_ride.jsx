import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { returnBike, getActiveRide, getAllBikes } from "../api/bikes";
import { getAllCities } from "../api/cities";
import { makeDateString, calcTime, calcPrice, calcLatLng } from "../functions/rent-functions";


export default function CurrentRide() {
  const [ride, setRide] = useState([]);
  const [startTimeString, setStratTimeString] = useState("");
  const [endLat, setEndLat] = useState([]);
  const [endLng, setEndLng] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bikeRes, cityRes, activeRes] = await Promise.all([
          getAllBikes(),
          getAllCities(),
          getActiveRide(),
        ]);
        let center = [];
        let radius = 0;
        if (!cancelled) {
          bikeRes.forEach(bike => {
            if (bike._id == activeRes.ride.bikeId) {
              cityRes.forEach(city => {
                if (city._id == bike.cityId) {
                  center = city.center;
                  radius = city.radius;
                } 
              });
            } 
          });

          setRide(activeRes || []);
          let endPos = calcLatLng(activeRes.ride.startedAt, activeRes.ride.startLocation.lat, activeRes.ride.startLocation.lng, center, radius);
          setEndLat(endPos[0]);
          setEndLng(endPos[1]);
          setStratTimeString(makeDateString(activeRes.ride.startedAt));
        } 
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setActiveError("Kunde inte hämta aktiv resa");
        }
      } finally {
        if (!cancelled) setActiveLoading(false);
      }
    })();


    return () => {
      cancelled = true;
    };
  }, []);

  async function returnBikeBtn() {
    setReturnLoading(true);
    setReturnError(null);

    try {
      await returnBike(ride.ride.id, endLat, endLng);
      navigate("/rides", { replace: true });
    } catch (err) {
      console.log(err);
      const msg =
      err.response?.data?.returnError || "Kunde inte återlämna cykeln.";
      setReturnError(msg);
    } finally {
      setReturnLoading(false);
    }
  }

  if (activeLoading) return <div>Laddar aktiv resa...</div>;
  if (activeError) return <div style={{ color: "red" }}>{activeError}</div>;

  return (
    <div class="margin-div">
      <div class="main-title">
        <h1>Aktiv resa</h1>
      </div>
      <div class="card">
        <p>Resan startad:</p>
        <p>{startTimeString}</p>
        <p>Nuvarande tid:</p>
        <p>{Math.floor(calcTime(ride.ride.startedAt))} minuter</p>
        <p>Nuvarande kostnad:</p>
        <p>{calcPrice(ride.ride.startedAt)} kr</p>
      </div>
     
      
      <button className="rent-button" onClick={returnBikeBtn} disabled={returnLoading}>
        {returnLoading ? "Återlämnar..." : "Återlämna sparkcykel"}
      </button>
      {returnError && <p className="login-error">{returnError}</p>}
    </div>
  );
}
