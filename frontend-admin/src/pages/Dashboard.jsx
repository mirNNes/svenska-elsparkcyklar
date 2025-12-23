import { useState } from "react";
import { httpPost } from "../api/http";
import MapView from "./MapView";

export default function Dashboard() {
  // Används för att tvinga kartan att mountas om efter en reset
  const [mapKey, setMapKey] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationInfo, setSimulationInfo] = useState(null);
  const [simulationBusy, setSimulationBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleReset() {
    try {
      // Admin-reset av seed-data (kräver inloggning)
      await httpPost("/admin/reset-seed");
      // Tvinga kartan att hämta ny seed-data
      setMapKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Kunde inte återställa seed-data");
    }
  }

  async function handleStartSimulation() {
    try {
      setSimulationBusy(true);
      const res = await httpPost("/simulation/start", { count: 500 });
      setSimulationRunning(true);
      setSimulationInfo(res.data);
      // Ladda om kartan så att nya simcyklar hämtas direkt
      setMapKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Kunde inte starta simuleringen");
    } finally {
      setSimulationBusy(false);
    }
  }

  async function handleStopSimulation() {
    try {
      setSimulationBusy(true);
      await httpPost("/simulation/stop");
      setSimulationRunning(false);
      setSimulationInfo(null);
      // Uppdatera kartans cykeldata efter stop
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Kunde inte stoppa simuleringen");
    } finally {
      setSimulationBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: 0 }}>Karta över alla seedade cyklar</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleStartSimulation}
            disabled={simulationBusy || simulationRunning}
          >
            Starta simulering (500/stad)
          </button>
          <button
            onClick={handleStopSimulation}
            disabled={simulationBusy || !simulationRunning}
          >
            Stoppa simulering
          </button>
          <button onClick={handleReset} disabled={simulationBusy}>
            Återställ seed-data
          </button>
        </div>
      </header>

      <p style={{ margin: 0 }}>
        Simulation: {simulationRunning ? "igång" : "avstängd"}
        {simulationInfo?.totalBikes ? ` (${simulationInfo.totalBikes} cyklar)` : ""}
      </p>

      {/* Kartan får egen key så den mountas om vid reset */}
      <div style={{ minHeight: "70vh" }}>
        <MapView
          key={mapKey}
          simulationRunning={simulationRunning}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}
