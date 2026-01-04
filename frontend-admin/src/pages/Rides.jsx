import { useEffect, useMemo, useState } from "react";
import { getAllRides } from "../api/rides";

export default function Rides() {
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const ridesRes = await getAllRides();
      setRides(ridesRes);
    } catch (err) {
      setError("Misslyckades att ladda resor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRides = useMemo(() => {
    return rides
      .filter((r) => (onlyActive ? !r.endedAt : true))
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }, [rides, onlyActive]);

  if (loading) return <div style={{ padding: 16 }}>Laddar resor…</div>;

  return (
    <div className="rides-page">
      <div style={{ padding: "clamp(0.75rem, 2vw, 1rem)" }}>
        <h2 style={{ marginTop: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>Resor</h2>

        <label
          style={{
            display: "flex",
            gap: ".6rem",
            alignItems: "center",
            fontSize: "1rem",
            marginBottom: 16,
          }}
        >
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          Visa bara aktiva resor
        </label>

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

        {/* Desktop table */}
        <div className="desktop-table" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Rese-ID", "Cykel", "Stad", "Start", "Slut", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "3px solid #003b84",
                      color: "#444",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 14, color: "#666" }}>
                    Inga resor hittades.
                  </td>
                </tr>
              ) : (
                filteredRides.map((r) => {
                  const bike = r.bikeId;
                  const city = bike?.cityId;
                  const status = r.endedAt ? "Avslutad" : "Aktiv";

                  return (
                    <tr key={r._id ?? r.id}>
                      <td style={{ padding: "12px 8px" }}>{r.id ?? "—"}</td>
                      <td style={{ padding: "12px 8px" }}>{bike?.id ?? "—"}</td>
                      <td style={{ padding: "12px 8px" }}>{city?.name ?? "—"}</td>
                      <td style={{ padding: "12px 8px" }}>
                        {r.startedAt ? new Date(r.startedAt).toLocaleString("sv-SE") : "—"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        {r.endedAt ? new Date(r.endedAt).toLocaleString("sv-SE") : "—"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>{status}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {filteredRides.length === 0 ? (
            <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
              Inga resor hittades.
            </div>
          ) : (
            filteredRides.map((r) => {
              const bike = r.bikeId;
              const city = bike?.cityId;
              const status = r.endedAt ? "Avslutad" : "Aktiv";

              return (
                <div
                  key={r._id ?? r.id}
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: "1rem",
                    marginBottom: "0.75rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                    <strong style={{ fontSize: "1.1rem" }}>Resa #{r.id ?? "—"}</strong>
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        background: status === "Aktiv" ? "#dbeafe" : "#f0f0f0",
                        color: status === "Aktiv" ? "#1e40af" : "#666",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      {status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.25rem" }}>
                    <strong>Cykel:</strong> {bike?.id ?? "—"}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.25rem" }}>
                    <strong>Stad:</strong> {city?.name ?? "—"}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.25rem" }}>
                    <strong>Start:</strong> {r.startedAt ? new Date(r.startedAt).toLocaleString("sv-SE") : "—"}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    <strong>Slut:</strong> {r.endedAt ? new Date(r.endedAt).toLocaleString("sv-SE") : "—"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-table {
            display: none;
          }

          .mobile-cards {
            display: block;
          }

          .rides-page {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .rides-page {
            padding: 0.5rem;
          }
        }

        .rides-page tbody tr:hover td {
          background: rgb(245, 245, 245);
        }
      `}</style>
    </div>
  );
}