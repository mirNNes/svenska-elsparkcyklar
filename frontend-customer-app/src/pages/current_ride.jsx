import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { returnBike, getActiveRide } from "../api/bikes";


export default function CurrentRide() {
  const [ride, setRide] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState(null);

  const navigate = useNavigate();
  
  const { rideID } = useParams();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getActiveRide();
        if (!cancelled) setRide(res || []);
        console.log(res);
      } catch (err) {
        if (!cancelled) {
          console.activeError(err);
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
      const response = await returnBike(rideID);
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
    <div className="margin-div">
      <h1>Du hyr nu sparkcykel med id?</h1>
      <h1>Resor</h1>
      
        <p>{ride.id}</p>  
      <button className="green-button" onClick={returnBikeBtn} disabled={returnLoading}>
        {returnLoading ? "Återlämnar..." : "Återlämna sparkcykel"}
      </button>
      {returnError && <p className="login-error">{returnError}</p>}
    </div>
  );
}
