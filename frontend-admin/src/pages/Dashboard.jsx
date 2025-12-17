import { useEffect, useState } from "react";
import { httpGet } from "../api/http";

export default function Dashboard() {
  // Lista med alla cyklar från backend
  const [bikes, setBikes] = useState([]);
  // Visar "Laddar..." medan data hämtas från /api/bike
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/bike → hämtar alla cyklar
        const res = await httpGet("/bike");
        if (!cancelled) setBikes(res.data);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Visa laddning medan cyklar hämtas
  if (loading) return <div>Laddar...</div>;

  return (
    <div>
      {/* Översikt: totalt antal cyklar */}
      <h1>Dashboard ({bikes.length} cyklar)</h1>
      {/* Lista alla cyklar med status */}
      <ul>
        {bikes.map(bike => (
          <li key={bike._id}>
            ID: {bike.id} | Batteri: {bike.battery}% | Ledig: {bike.isAvailable ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}
