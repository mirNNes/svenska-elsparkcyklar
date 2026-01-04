import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllBikes } from "../api/bikes";
import { getAllCities } from "../api/cities";
import BikeList from "../components/BikeList";

const LOW_BATTERY_THRESHOLD = 30;

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [cityName, setCityName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get("city");
  const availableOnly = searchParams.get("available") === "1";
  const lowBatteryOnly = searchParams.get("lowBattery") === "1";

  // Hämta alla cyklar
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getAllBikes();
        if (!cancelled) setBikes(data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Kunde inte hämta cyklar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Hämta stadens namn
  useEffect(() => {
    if (!cityId) {
      setCityName(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const cities = await getAllCities();
        const city = cities.find(
          (c) => String(c._id) === String(cityId)
        );

        if (!cancelled) {
          setCityName(city?.name || "Okänd stad");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setCityName("Okänd stad");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cityId]);

  // Filtrera cyklar
  const filteredBikes = useMemo(() => {
    return bikes.filter((b) => {
      if (cityId && String(b.cityId) !== String(cityId)) return false;
      if (availableOnly && !b.isAvailable) return false;
      if (
        lowBatteryOnly &&
        (b.battery ?? 0) >= LOW_BATTERY_THRESHOLD
      )
        return false;
      return true;
    });
  }, [bikes, cityId, availableOnly, lowBatteryOnly]);

  // Hjälpfunktion för att uppdatera query params
  function updateQueryParam(key, enabled) {
    const params = new URLSearchParams(searchParams);

    if (enabled) {
      params.set(key, "1");
    } else {
      params.delete(key);
    }

    setSearchParams(params);
  }

  if (loading) return <div>Laddar cyklar...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>
        Cyklar
        {cityName && (
          <span style={{ opacity: 0.6, fontSize: "2rem" }}> – {cityName}</span>
        )}
        {(availableOnly || lowBatteryOnly) && (
          <span style={{ opacity: 0.5, fontSize: "0.9rem" }}>
            {" "}
            (filtrerade)
          </span>
        )}
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            window.location.href = `/?${params.toString()}`;
          }}
        >
          Visa på karta
        </button>
      </div>

      {/* Filterkontroller */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", gap: ".6rem", alignItems: "center", fontSize: "1.1rem" }}>
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) =>
              updateQueryParam("available", e.target.checked)
            }
          />
          Visa bara lediga
        </label>

        <label style={{ display: "flex", gap: ".6rem", alignItems: "center", fontSize: "1.1rem" }}>
          <input
            type="checkbox"
            checked={lowBatteryOnly}
            onChange={(e) =>
              updateQueryParam("lowBattery", e.target.checked)
            }
          />
          Visa bara låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)
        </label>
      </div>

      {/* Lista */}
      {filteredBikes.length === 0 ? (
        <p>Inga cyklar hittades.</p>
      ) : (
        <BikeList bikes={filteredBikes} />
      )}
    </div>
  );
}
