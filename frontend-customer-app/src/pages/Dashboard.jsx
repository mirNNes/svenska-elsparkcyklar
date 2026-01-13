import { useState, useEffect } from "react";
import MapView from "./MapView";
import { getActiveRide } from "../api/bikes";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [mapKey] = useState(0);
  
  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveRide();
        console.log(res);
        if (res.ride != null) {
          const navigate = useNavigate();
          navigate("/current_ride", { replace: true });
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
      <div class="map_view">
        <MapView key={mapKey} />
      </div>
  );
}
