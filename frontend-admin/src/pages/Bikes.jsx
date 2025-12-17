import { useEffect, useState } from "react";
import { getAllBikes } from "../api/bikes";
import BikeList from "../components/BikeList";

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllBikes();
        if (!cancelled) setBikes(res.data || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta cyklar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Laddar cyklar...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>Cyklar ({bikes.length})</h1>
      {bikes.length === 0 ? (
        <p>Inga cyklar hittades ännu.</p>
      ) : (
        <BikeList bikes={bikes} />
      )}
    </div>
  );
}
