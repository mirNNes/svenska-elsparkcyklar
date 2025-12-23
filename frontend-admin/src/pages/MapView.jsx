import { useContext, useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllBikes, rentBike, returnBike } from "../api/bikes";
import { getAllCities } from "../api/cities";
import {
  getAllAllowedZones,
  getAllParkingZones,
  getAllStations,
} from "../api/zones";
import { BikeUpdatesContext } from "../components/Layout";
import L from "leaflet";
import { useSearchParams } from "react-router-dom";

const LOW_BATTERY_THRESHOLD = 30;

/**
 * Zooma kartan så att alla (filtrerade) cyklar syns.
 * Körs när "boundsKey" ändras (dvs när filter eller data ändras),
 * inte när man bara väljer en cykel i listan.
 */
function FitBounds({ bikes, boundsKey, isBikeSelected }) {
  const map = useMap();

  useEffect(() => {
    if (isBikeSelected) return;

    const points = bikes
      .map((b) => [b.location?.lat, b.location?.lng])
      .filter(
        ([lat, lng]) => typeof lat === "number" && typeof lng === "number"
      );

    if (points.length === 0) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
    // Kör bara när boundsKey ändras så zoom inte nollställs av live-uppdateringar.
  }, [boundsKey, map, isBikeSelected]);

  return null;
}

/** Zooma till vald cykel (körs vid klick i listan). */
function FlyToBike({ bike, setPauseFitBounds, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!bike) return;

    const lat = bike.location?.lat;
    const lng = bike.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    setPauseFitBounds(true);

    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 0.6,
    });

    map.once("moveend", () => {
      const marker = markerRefs.current[bike._id];
      marker?.openPopup();
    });
  }, [bike, map, setPauseFitBounds, markerRefs]);

  return null;
}

/** Sidolista (sök + klick för att välja cykel). */
function BikeSideList({ bikes, selectedId, onSelect }) {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bikes;

    return bikes.filter((b) => {
      const idStr = String(b.id ?? "").toLowerCase();
      const mongoIdStr = String(b._id ?? "").toLowerCase();
      return idStr.includes(q) || mongoIdStr.includes(q);
    });
  }, [bikes, query]);

  return (
    <div
      style={{
        width: 320,
        maxHeight: "70vh",
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <strong>Cyklar</strong>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>
          {list.length} st
        </span>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Sök id…"
        style={{
          width: "90%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #ccc",
          marginBottom: 10,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {list.map((b) => {
          const isSelected = selectedId === b._id;
          const battery = b.battery ?? 0;

          return (
            <button
              key={b._id}
              onClick={() => onSelect(b._id)}
              style={{
                textAlign: "left",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                background: isSelected ? "#f0f7ff" : "white",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  color: "black",
                }}
              >
                <strong>Bike #{b.id}</strong>
                <span style={{ opacity: 0.8 }}>{battery}%</span>
              </div>

              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {b.isAvailable ? "Tillgänglig" : "Upptagen"}
                {battery < LOW_BATTERY_THRESHOLD ? " • Låg batteri" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MapView({ simulationRunning, refreshKey }) {
  const [bikes, setBikes] = useState([]);
  const [cities, setCities] = useState([]);
  const [stations, setStations] = useState([]);
  const [parkingZones, setParkingZones] = useState([]);
  const [allowedZones, setAllowedZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markerRefs = useRef({});
  const [isBikeSelected, setIsBikeSelected] = useState(false);
  const [pauseFitBounds, setPauseFitBounds] = useState(false);
  const bikeUpdates = useContext(BikeUpdatesContext);

  const bikeIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: "/scooter.png",
        iconSize: [52, 52],
        iconAnchor: [16, 32],
      }),
    []
  );

  // Selected bike from list
  const [selectedBikeId, setSelectedBikeId] = useState(null);

  // Key that triggers FitBounds (data/filters change)
  const boundsKeyRef = useRef(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const cityId = searchParams.get("city");
  const availableOnly = searchParams.get("available") === "1";
  const lowBatteryOnly = searchParams.get("lowBattery") === "1";

  // Uppdaterar filter via Url-query params
  function updateQueryParam(key, enabled) {
    const params = new URLSearchParams(searchParams);

    if (enabled) {
      params.set(key, "1");
    } else {
      params.delete(key);
    }

    setSearchParams(params);
  }

  useEffect(() => {
    if (!selectedBikeId) {
      setPauseFitBounds(false);
    }
  }, [selectedBikeId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bikeRes, cityRes, stationRes, parkingRes, allowedRes] =
          await Promise.all([
            getAllBikes(),
            getAllCities(),
            getAllStations(),
            getAllParkingZones(),
            getAllAllowedZones(),
          ]);
        if (!cancelled) {
          setBikes(bikeRes || []);
          setCities(cityRes?.data || cityRes || []);
          setStations(stationRes || []);
          setParkingZones(parkingRes || []);
          setAllowedZones(allowedRes || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta karta och cyklar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updates = bikeUpdates || {};
    if (!Object.keys(updates).length) return;

    // Uppdatera position/batteri live när vi får socket-events
    setBikes((prev) =>
      prev.map((bike) => {
        const update = updates[bike.id];
        if (!update) return bike;
        return {
          ...bike,
          location: update.location ?? bike.location,
          battery: update.battery ?? bike.battery,
          isAvailable: update.isAvailable ?? bike.isAvailable,
          cityId: update.cityId ?? bike.cityId,
          updatedAt: update.updatedAt ?? bike.updatedAt,
        };
      })
    );
  }, [bikeUpdates]);

  useEffect(() => {
    let cancelled = false;

    // Uppdatera cykel-listan när vi explicit triggar en refresh
    (async () => {
      try {
        const [bikeRes, stationRes, parkingRes, allowedRes] = await Promise.all(
          [
            getAllBikes(),
            getAllStations(),
            getAllParkingZones(),
            getAllAllowedZones(),
          ]
        );
        if (!cancelled) {
          setBikes(bikeRes || []);
          setStations(stationRes || []);
          setParkingZones(parkingRes || []);
          setAllowedZones(allowedRes || []);
        }
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!simulationRunning) return;

    let cancelled = false;

    const pollBikes = async () => {
      try {
        const bikeRes = await getAllBikes();
        if (!cancelled) setBikes(bikeRes || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      }
    };

    // Hämta cyklar löpande när simuleringen är igång
    const intervalId = setInterval(pollBikes, 8000);
    pollBikes();

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [simulationRunning]);

  const defaultCenter = useMemo(() => {
    if (cities.length > 0 && cities[0].center?.lat && cities[0].center?.lng) {
      return [cities[0].center.lat, cities[0].center.lng];
    }
    return [62.0, 15.0];
  }, [cities]);

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

  const stats = useMemo(() => {
    const total = filteredBikes.length;
    const available = filteredBikes.filter((b) => !!b.isAvailable).length;
    const rented = total - available;
    const lowBattery = filteredBikes.filter(
      (b) => (b.battery ?? 0) < LOW_BATTERY_THRESHOLD
    ).length;

    return { total, available, rented, lowBattery };
  }, [filteredBikes]);

  // bump boundsKey when filters/data changes
  const boundsKey = useMemo(() => {
    if (pauseFitBounds) return boundsKeyRef.current;

    boundsKeyRef.current += 1;
    return boundsKeyRef.current;
  }, [filteredBikes.length, pauseFitBounds]);

  const selectedBike = useMemo(() => {
    return filteredBikes.find((b) => b._id === selectedBikeId) || null;
  }, [filteredBikes, selectedBikeId]);

  const handleRent = async (bikeId) => {
    try {
      await rentBike(bikeId);
      setBikes((prev) =>
        prev.map((b) => (b._id === bikeId ? { ...b, isAvailable: false } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Kunde inte hyra cykeln");
    }
  };

  const handleReturn = async (bikeId) => {
    try {
      await returnBike(bikeId);
      setBikes((prev) =>
        prev.map((b) => (b._id === bikeId ? { ...b, isAvailable: true } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Kunde inte återlämna cykeln");
    }
  };

  if (loading) return <div>Laddar karta...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <h1>
        Karta
        {cityId && (
          <span style={{ opacity: 0.6, fontSize: "1.6rem" }}>
            {" "}
            – filtrerad
          </span>
        )}
      </h1>

      {/* Controls + stats */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "0.5rem 0",
        }}
      >
        <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => {
            updateQueryParam("available", e.target.checked);
            setSelectedBikeId(null);
            setIsBikeSelected(false);
          }}
          style={{ transform: "scale(1.4)" }}
        />
          Visa bara lediga
        </label>

        <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={lowBatteryOnly}
            onChange={(e) => {
              updateQueryParam("lowBattery", e.target.checked);
              setSelectedBikeId(null);
              setIsBikeSelected(false);
            }}
            style={{ transform: "scale(1.4)" }}
          />
          Visa bara låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)
        </label>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span>
            <strong>Totalt:</strong> {stats.total}
          </span>
          <span>
            <strong>Lediga:</strong> {stats.available}
          </span>
          <span>
            <strong>Uthyrda:</strong> {stats.rented}
          </span>
          <span>
            <strong>Låg batteri:</strong> {stats.lowBattery}
          </span>
        </div>
      </div>

      {/* List + Map */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <BikeSideList
          bikes={filteredBikes}
          selectedId={selectedBikeId}
          onSelect={(bikeId) => {
            setSelectedBikeId(bikeId);
            setIsBikeSelected(true);
          }}
        />

        <div style={{ flex: 1 }}>
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: "70vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />

            {/* Tillåtna zoner (blå) */}
            {allowedZones.map((zone) => {
              const lat = zone.center?.lat;
              const lng = zone.center?.lng;
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;
              return (
                <Circle
                  key={`allowed-${zone._id}`}
                  center={[lat, lng]}
                  radius={zone.radius || 0}
                  pathOptions={{
                    color: "#1976d2",
                    fillColor: "#1976d2",
                    fillOpacity: 0.08,
                    weight: 1,
                  }}
                />
              );
            })}

            {/* Parkeringszoner (grön) */}
            {parkingZones.map((zone) => {
              const lat = zone.center?.lat;
              const lng = zone.center?.lng;
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;
              return (
                <Circle
                  key={`parking-${zone._id}`}
                  center={[lat, lng]}
                  radius={zone.radius || 0}
                  pathOptions={{
                    color: "#2e7d32",
                    fillColor: "#2e7d32",
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />
              );
            })}

            {/* Laddstationer (orange) */}
            {stations.map((station) => {
              const lat = station.location?.lat;
              const lng = station.location?.lng;
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;
              return (
                <CircleMarker
                  key={`station-${station._id}`}
                  center={[lat, lng]}
                  radius={6}
                  pathOptions={{
                    color: "#ef6c00",
                    fillColor: "#ef6c00",
                    fillOpacity: 0.9,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div>
                      <strong>{station.name}</strong>
                      <br />
                      Kapacitet: {station.capacity}
                      <br />
                      Cyklar: {station.currentBikes}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            <FitBounds
              bikes={filteredBikes}
              boundsKey={simulationRunning ? null : boundsKey}
              isBikeSelected={isBikeSelected}
            />
            <FlyToBike
              bike={selectedBike}
              setPauseFitBounds={setPauseFitBounds}
              markerRefs={markerRefs}
            />

            {filteredBikes.map((bike) => {
              const lat = bike.location?.lat;
              const lng = bike.location?.lng;
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;

              const battery = bike.battery ?? 0;

              return (
                <Marker
                  key={bike._id}
                  position={[lat, lng]}
                  icon={bikeIcon}
                  ref={(ref) => {
                    if (ref) markerRefs.current[bike._id] = ref;
                  }}
                >
                  <Popup>
                    <div>
                      <strong>Bike #{bike.id}</strong>
                      <br />
                      Status: {bike.isAvailable ? "Tillgänglig" : "Upptagen"}
                      <br />
                      Batteri: {battery}%
                      <br />
                      {bike.isAvailable ? (
                        <button onClick={() => handleRent(bike._id)}>
                          Hyr
                        </button>
                      ) : (
                        <button onClick={() => handleReturn(bike._id)}>
                          Återlämna
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <p style={{ marginTop: "0.5rem", color: "#555" }}>
            Tips: Om flera cyklar står på samma plats kan ikoner ligga på
            varandra — zooma in för att se dem tydligare.
          </p>
        </div>
      </div>
    </div>
  );
}
