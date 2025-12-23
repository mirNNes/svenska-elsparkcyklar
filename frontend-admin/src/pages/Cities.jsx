import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCities } from "../api/cities";
import { getAllBikes } from "../api/bikes";
import CityCard from "../components/CityCard";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hämta städer och cyklar
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [cityData, bikeData] = await Promise.all([
        getAllCities(),
        getAllBikes(),
      ]);

      if (!cancelled) {
        setCities(cityData);
        setBikes(bikeData);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Räkna hur många cyklar som finns per stad
  const bikeCountByCity = useMemo(() => {
    const map = {};
    for (const bike of bikes) {
      if (!bike.cityId) continue;
      map[bike.cityId] = (map[bike.cityId] || 0) + 1;
    }
    return map;
  }, [bikes]);

  if (loading) return <div>Laddar städer...</div>;

  return (
    <div>
      <h1>Städer</h1>

      <p style={{ opacity: 0.8 }}>
        Klicka på en stad för att se cyklarna som finns där.
      </p>

      {cities.map((city) => (
        <CityCard
          key={city._id}
          city={city}
          bikeCount={bikeCountByCity[city._id] || 0}
          onOpen={() => navigate(`/bikes?city=${city._id}`)}
        />
      ))}
    </div>
  );
}
