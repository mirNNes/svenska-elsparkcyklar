import { useEffect, useState } from "react";
import { getAllRides } from "../api/bikes";
import RidesList from "../components/RidesList";

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllRides();
        if (!cancelled) setRides(res.data || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta resor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Laddar resor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="margin-div">
      <h1>Resor</h1>
      {rides.length === 0 ? (
        <p>Inga resor hittades ännu.</p>
      ) : (
        <RidesList rides={rides} />
      )}
    </div>
  );
}
