import { useEffect, useMemo, useState } from "react";
import { getAllRides } from "../api/rides";
import { getAllBikes } from "../api/bikes";
import { getAllCities } from "../api/cities";

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [ridesRes, bikesRes, citiesRes] = await Promise.all([
        getAllRides(),
        getAllBikes(),
        getAllCities(),
      ]);

      setRides(ridesRes);
      setBikes(bikesRes);
      setCities(citiesRes);
    } catch (e) {
      setError("Misslyckades att ladda resor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const bikesByObjectId = useMemo(() => {
    const map = new Map();
    for (const b of bikes) {
      if (b?._id) map.set(String(b._id), b);
    }
    return map;
  }, [bikes]);

  const citiesById = useMemo(
    () => new Map(cities.map((c) => [c.id, c])),
    [cities]
  );

  const filteredRides = useMemo(() => {
    return rides
      .filter((r) => (onlyActive ? !r.endedAt : true))
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }, [rides, onlyActive]);

  if (loading) return <div style={{ padding: 16 }}>Laddar resor…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Resor</h2>

      <label
        style={{
          display: "flex",
          gap: ".6rem",
          alignItems: "center",
          fontSize: "1.1rem",
          marginBottom: 12,
        }}
      >
        <input
          type="checkbox"
          checked={onlyActive}
          onChange={(e) => setOnlyActive(e.target.checked)}
          style={{ transform: "scale(1.4)" }}
        />
        Bara aktiva resor
      </label>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Rese-ID", "Cykel", "Stad", "Start", "Slut", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 8px",
                  borderBottom: "1px solid #eee",
                  color: "#444",
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
              const bike = bikesByObjectId.get(String(r.bikeId));
              const city = citiesById.get(bike?.cityId);

              const status = r.endedAt ? "Avslutad" : "Aktiv";

              return (
                <tr key={r._id ?? r.id}>
                  <td style={{ padding: "10px 8px" }}>{r.id ?? "—"}</td>

                  <td style={{ padding: "10px 8px" }}>
                    {bike?.id ?? "—"}
                  </td>

                  <td style={{ padding: "10px 8px" }}>
                    {city?.name ?? "—"}
                  </td>

                  <td style={{ padding: "10px 8px" }}>
                    {r.startedAt ? new Date(r.startedAt).toLocaleString("sv-SE") : "—"}
                  </td>

                  <td style={{ padding: "10px 8px" }}>
                    {r.endedAt ? new Date(r.endedAt).toLocaleString("sv-SE") : "—"}
                  </td>

                  <td style={{ padding: "10px 8px" }}>{status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
