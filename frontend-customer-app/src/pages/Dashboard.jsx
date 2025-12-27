import { useState } from "react";
import { httpPost } from "../api/http";
import MapView from "./MapView";

export default function Dashboard() {
  // Används för att tvinga kartan att mountas om efter en reset
  const [mapKey, setMapKey] = useState(0);

  // async function handleReset() {
  //   try {
  //     // Admin-reset av seed-data (kräver inloggning)
  //     await httpPost("/admin/reset-seed");
  //     // Tvinga kartan att hämta ny seed-data
  //     setMapKey((prev) => prev + 1);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Kunde inte återställa seed-data");
  //   }
  // }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> */}
        {/* <div>
          <h1 style={{ margin: 0 }}>Hyra cyklar</h1> */}
          {/* <p style={{ margin: 0 }}>Karta över alla seedade cyklar</p> */}
        {/* </div> */}
        {/* <button onClick={handleReset}>Återställ seed-data</button> */}
      {/* </header> */}

      {/* Kartan får egen key så den mountas om vid reset */}
      <div class="map_view">
        <MapView key={mapKey} />
      </div>
    </div>
  );
}
