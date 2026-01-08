import { useState } from "react";
import { moveBikeToStation } from "../api/stations";

export default function BikeCard({ bike, stations }) {
  const station = stations.find(
    (s) => s.id === bike.currentStationId
  );

  const [moving, setMoving] = useState(false);

  async function handleMoveToStation(stationId) {
    if (!stationId) return;

    try {
      setMoving(true);
      await moveBikeToStation(bike.id, stationId);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Kunde inte flytta cykeln");
    } finally {
      setMoving(false);
    }
  }

  return (
    <div className="card">
      <h3>Bike #{bike.id}</h3>

      <p>Batteri: {bike.battery ?? 0}%</p>
      <p>Status: {bike.isAvailable ? "Tillgänglig" : "Upptagen"}</p>

      <p>
        Position: {bike.location?.lat}, {bike.location?.lng}
      </p>

      <div style={{ marginTop: "0.5rem" }}>
              <select
                disabled={moving}
                onChange={(e) => handleMoveToStation(e.target.value)}
              >
                <option value="">Flytta till laddstation</option>
                {stations
                  .filter(
                    (s) => String(s.cityId) === String(bike.cityId)
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {bike.isCharging && station && (
              <p style={{ color: "green", marginTop: "0.5rem" }}>
                🔌 Laddar på station #{station.id} ({station.name})
              </p>
            )}
          </div>
        );
      }
