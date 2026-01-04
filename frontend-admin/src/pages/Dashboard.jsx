import { useState } from "react";
import { httpPost } from "../api/http";
import MapView from "./MapView";

export default function Dashboard() {
  const [mapKey, setMapKey] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationInfo, setSimulationInfo] = useState(null);
  const [simulationBusy, setSimulationBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleReset() {
    try {
      await httpPost("/admin/reset-seed");
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
      <section className="simulation-strip">
        <div className="simulation-left">
          <span className="simulation-label">Simulering</span>

          <div className="simulation-status">
            <span
              className={`status-dot ${
                simulationRunning ? "running" : "stopped"
              }`}
            />
            <span>
              {simulationRunning ? "Igång" : "Avstängd"}
              {simulationInfo?.totalBikes
                ? ` • ${simulationInfo.totalBikes} cyklar`
                : ""}
            </span>
          </div>
        </div>

        <div className="simulation-actions">
          <button
            onClick={handleStartSimulation}
            disabled={simulationBusy || simulationRunning}
            className="btn start"
          >
            ▶ Starta
          </button>

          <button
            onClick={handleStopSimulation}
            disabled={simulationBusy || !simulationRunning}
            className="btn stop"
          >
            ⏸ Stoppa
          </button>

          <button
            onClick={handleReset}
            disabled={simulationBusy}
            className="btn reset"
          >
            🔄 Återställ
          </button>
        </div>
      </section>

      {/* Map */}
      <div style={{ minHeight: "70vh" }}>
        <MapView
          key={mapKey}
          simulationRunning={simulationRunning}
          refreshKey={refreshKey}
        />
      </div>

      <style>{`
        .simulation-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .simulation-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .simulation-label {
          font-size: 1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
        }

        .simulation-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot.running {
          background: #16a34a;
          box-shadow: 0 0 8px #16a34a;
        }

        .status-dot.stopped {
          background: #f59e0b;
        }

        .simulation-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          border: 1px solid transparent;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
        }

        .btn.start {
          color: #2563eb;
          border-color: #2563eb;
          font-size: 1.2rem;
        }

        .btn.stop {
          color: #b91c1c;
          border-color: #b91c1c;
          font-size: 1.2rem;
        }

        .btn.reset {
          color: #92400e;
          border-color: #92400e;
          font-size: 1.2rem;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .simulation-strip {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .simulation-actions {
            width: 100%;
          }

          .simulation-actions .btn {
            flex: 1;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .simulation-actions {
            flex-direction: column;
          }

          .simulation-actions .btn {
            width: 100%;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
