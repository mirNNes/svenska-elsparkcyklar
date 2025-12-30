import { useState } from "react";
import { httpPost } from "../api/http";
import MapView from "./MapView";

export default function Dashboard() {
  // Används för att tvinga kartan att mountas om efter en reset
  const [mapKey, setMapKey] = useState(0);



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div class="map_view">
        <MapView key={mapKey} />
      </div>
    </div>
  );
}
