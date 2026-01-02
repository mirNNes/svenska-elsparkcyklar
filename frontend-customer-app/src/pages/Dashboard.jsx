import { useState, useEffect } from "react";
import MapView from "./MapView";
import { getActiveRide } from "../api/bikes";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [mapKey] = useState(0);
  const navigate = useNavigate();
  
  let activeRide = false;

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveRide();
        console.log(res);
        if (res.ride != null) {
          activeRide = true;
        }
        if(activeRide) {
          navigate("/current_ride", { replace: true });
        }
      } catch (err) {
        activeRide = false;
      } finally {
      }
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div class="map_view">
        <MapView key={mapKey} />
      </div>
    </div>
  );
}
