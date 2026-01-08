import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { returnBike, getActiveRide } from "../api/bikes";


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

  function makeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();
    const hour = newDate.getHours();
    const minute = newDate.getMinutes();

    const timeString = `${day}/${month+1}/${year} ${hour}:${minute}`;

    setStratTimeString(timeString);
  }

  function calcTime(startTime) {
    let diff = Math.abs(new Date() - new Date(startTime));
    let minutes = Math.floor((diff/1000)/60);

    return minutes;
  }

  function calcPrice(startTime) {
    let minutes = calcTime(startTime);
    let price = (minutes * 2) + 10;

    return price;
  }

  function calcLatLng(startTime, startLat, startLng) {
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

    setEndLat(endingLat);
    setEndLng(endingLng);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getActiveRide();
        if (!cancelled) {
          setRide(res || []);
          console.log(res);
          calcLatLng(res.ride.startedAt, res.ride.startLocation.lat, res.ride.startLocation.lng);
          makeDateString(res.ride.startedAt);
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
      const response = await returnBike(ride.ride.id, endLat, endLng);
      console.log(response);
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
        <p>{calcTime(ride.ride.startedAt)} minuter</p>
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
