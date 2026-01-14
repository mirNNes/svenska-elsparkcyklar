import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllBikes, removeBikeFromStation } from "../api/bikes";
import { getAllCities } from "../api/cities";
import { getActiveRideForBike } from "../api/rides";
import { getAllStations } from "../api/stations";
import { FitBounds, FlyToBike, BikePopupOpener } from "../components/map/MapControls";
import BikeSideList from "../components/map/BikeSideList";
import { createBikeIcon, createSelectedBikeIcon, createStationIcon } from "../components/map/MapIcons";
import { getAllParkingZones } from "../api/zones";
import {
  formatSpeed,
  formatTelemetryTime,
  getAvailabilityText,
  getRideStatusText,
  isBatteryEmpty,
  LOW_BATTERY_THRESHOLD,
} from "../utils/mapUtils";

export default function MapView({ simulationRunning, refreshKey, bikeUpdates }) {
  const [bikes, setBikes] = useState([]);
  const [cities, setCities] = useState([]);
  const [activeRides, setActiveRides] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pauseFitBounds, setPauseFitBounds] = useState(false);
  const [shouldFlyToBike, setShouldFlyToBike] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stations, setStations] = useState([]);
  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const isBikeSelected = Boolean(selectedBikeId);
  const boundsKeyRef = useRef(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [parkingZones, setParkingZones] = useState([]);

  const cityId = searchParams.get("city");
  const availableOnly = searchParams.get("available") === "1";
  const lowBatteryOnly = searchParams.get("lowBattery") === "1";

  // Hantera fönsterstorlek
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Skapa ikoner
  const selectedBikeIcon = useMemo(
    () => createSelectedBikeIcon(isMobile),
    [isMobile]
  );

  const stationIcon = useMemo(
    () => createStationIcon(isMobile),
    [isMobile]
  );

  const bikeIcon = useMemo(
    () => createBikeIcon(isMobile),
    [isMobile]
  );


  // Återställ pauseFitBounds när ingen cykel är vald
  useEffect(() => {
    if (!selectedBikeId) {
      setPauseFitBounds(false);
      setShouldFlyToBike(false);
    }
  }, [selectedBikeId]);

  // Initial data fetch
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bikeRes, cityRes] = await Promise.all([
          getAllBikes(),
          getAllCities(),
        ]);
        if (!cancelled) {
          setBikes(bikeRes || []);
          setCities(cityRes?.data || cityRes || []);
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

  // Hämta stationer
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stationRes = await getAllStations();
        if (!cancelled) {
          setStations(
            Array.isArray(stationRes?.data)
              ? stationRes.data
              : Array.isArray(stationRes)
              ? stationRes
              : []
          );
        }
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Uppdatera cyklar när refreshKey ändras
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bikeRes = await getAllBikes();
        if (!cancelled) {
          setBikes(bikeRes || []);
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
    let cancelled = false;

    (async () => {
      try {
        const zones = await getAllParkingZones();
        if (!cancelled) {
          setParkingZones(Array.isArray(zones) ? zones : []);
        }
      } catch (err) {
        console.error("Failed to load parking zones", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bikeUpdates) return;

    setBikes(prev =>
      prev.map(b => bikeUpdates[b.id] ? { ...b, ...bikeUpdates[b.id] } : b)
    );
  }, [bikeUpdates]);

  // Default center för kartan
  const defaultCenter = useMemo(() => {
    if (cities.length > 0 && cities[0].center?.lat && cities[0].center?.lng) {
      return [cities[0].center.lat, cities[0].center.lng];
    }
    return [62.0, 15.0];
  }, [cities]);

  // Filtrerade cyklar
  const filteredBikes = useMemo(() => {
    return bikes.filter((b) => {
      if (cityId && String(b.cityId) !== String(cityId)) return false;
      if (availableOnly && !b.isAvailable) return false;
      if (lowBatteryOnly && (b.battery ?? 0) >= LOW_BATTERY_THRESHOLD)
        return false;
      return true;
    });
  }, [bikes, cityId, availableOnly, lowBatteryOnly]);

  const visibleParkingZones = useMemo(() => {
    if (!cityId) return parkingZones;
    return parkingZones.filter(
      (z) => String(z.cityId) === String(cityId)
    );
  }, [parkingZones, cityId]);


  // Statistik
  const stats = useMemo(() => {
    const total = filteredBikes.length;
    const outOfBattery = filteredBikes.filter((b) => isBatteryEmpty(b)).length;
    const available = filteredBikes.filter((b) => !!b.isAvailable).length;
    const rented = filteredBikes.filter(
      (b) => !b.isAvailable && !isBatteryEmpty(b)
    ).length;
    const lowBattery = filteredBikes.filter((b) => {
      const battery = b.battery ?? 0;
      return battery > 0 && battery < LOW_BATTERY_THRESHOLD;
    }).length;

    const moving = filteredBikes.filter(
      (b) => Number(b.speed) > 0 && !isBatteryEmpty(b)
    ).length;

    const stationary = total - moving;

    return {
      total,
      available,
      rented,
      moving,
      stationary,
      lowBattery,
      outOfBattery,
    };
  }, [filteredBikes]);

  // Bounds key för FitBounds
  const boundsKey = useMemo(() => {
    if (pauseFitBounds) return boundsKeyRef.current;
    boundsKeyRef.current += 1;
    return boundsKeyRef.current;
  }, [filteredBikes.length, pauseFitBounds]);

  // Vald cykel
  const selectedBike = useMemo(() => {
    return filteredBikes.find((b) => b._id === selectedBikeId) || null;
  }, [filteredBikes, selectedBikeId]);

  const bikesByParkingZone = useMemo(() => {
    const map = {};
    for (const zone of parkingZones) {
      map[zone.id] = [];
    }

    for (const bike of bikes) {
      if (bike.parkingZoneId && map[bike.parkingZoneId]) {
        map[bike.parkingZoneId].push(bike);
      }
    }

    return map;
  }, [bikes, parkingZones]);

  const selectedBikeKey = selectedBike ? String(selectedBike.id) : null;

  // Hämta aktiv resa för vald cykel
  useEffect(() => {
    if (!selectedBikeKey) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getActiveRideForBike(selectedBike.id);
        if (!cancelled) {
          setActiveRides((prev) => ({
            ...prev,
            [selectedBikeKey]: data?.ride || null,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setActiveRides((prev) => ({ ...prev, [selectedBikeKey]: null }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBikeKey, selectedBike]);

  if (loading) return <div>Laddar karta...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          className="mobile-toggle-btn"
          aria-label="Visa cykellista och filter"
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            flexShrink: 0,
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>☰</span>
          <span>Cyklar & Filter</span>
        </button>

        <h1
          className="map-title"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", margin: 0 }}
        >
          Karta
          {cityId && (
            <span style={{ opacity: 0.6, fontSize: "clamp(1rem, 3vw, 1.6rem)" }}>
              {" "}
              – filtrerad
            </span>
          )}
        </h1>
      </div>

      {/* Controls + stats */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
          padding: "0.5rem 0",
          fontSize: "clamp(0.875rem, 2vw, 1rem)",
          marginBottom: "0.5rem",
        }}
        className="controls-section"
      >
        <label
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              if (e.target.checked) {
                params.set("available", "1");
              } else {
                params.delete("available");
              }
              navigate(`?${params.toString()}`);
              setSelectedBikeId(null);
              setShouldFlyToBike(false);
            }}
          />
          <span className="label-text">Visa bara lediga</span>
        </label>

        <label
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={lowBatteryOnly}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              if (e.target.checked) {
                params.set("lowBattery", "1");
              } else {
                params.delete("lowBattery");
              }
              navigate(`?${params.toString()}`);
              setSelectedBikeId(null);
              setShouldFlyToBike(false);
            }}
          />
          <span className="label-text">
            Låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)
          </span>
        </label>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginLeft: "auto",
          }}
          className="stats-section"
        >
          <span>
            <strong>Total:</strong> {stats.total}
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
          <span>
            <strong>Slut:</strong> {stats.outOfBattery}
          </span>
        </div>
      </div>

      {/* List + Map */}
      <div
        style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
        className="main-content"
      >
        <BikeSideList
          bikes={filteredBikes}
          selectedId={selectedBikeId}
          onSelect={(bikeId) => {
            setSelectedBikeId(bikeId);
            setShouldFlyToBike(true); // Zooma när man väljer från listan
          }}
          activeRides={activeRides}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          availableOnly={availableOnly}
          lowBatteryOnly={lowBatteryOnly}
          onFilterChange={() => {
            setSelectedBikeId(null);
            setShouldFlyToBike(false);
          }}
          navigate={navigate}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="map-wrapper" style={{ position: "relative" }}>
            <MapContainer
              center={defaultCenter}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />

              <FitBounds
                bikes={filteredBikes}
                boundsKey={boundsKey}
                isBikeSelected={isBikeSelected || simulationRunning}
              />
              <FlyToBike 
                bike={shouldFlyToBike ? selectedBike : null} 
                setPauseFitBounds={setPauseFitBounds}
                onComplete={() => setShouldFlyToBike(false)}
              />
              <BikePopupOpener selectedBikeId={selectedBikeId} />

              {/* Cykelmarkörer */}
              {filteredBikes.map((bike) => {
                const lat = bike.location?.lat;
                const lng = bike.location?.lng;
                if (typeof lat !== "number" || typeof lng !== "number")
                  return null;

                const isSelected = selectedBikeId === bike._id;
                const activeRide = activeRides[String(bike.id)];

                return (
                  <Marker
                    key={bike._id}
                    position={[lat, lng]}
                    icon={isSelected ? selectedBikeIcon : bikeIcon}
                    bikeId={bike._id}
                    eventHandlers={{
                      click: () => {
                        setSelectedBikeId(bike._id);
                        setShouldFlyToBike(false);
                      },
                    }}
                  >
                    <Popup
                      autoPan
                      offset={[0, -10]}
                      closeButton
                      closeOnEscapeKey
                      onClose={() => {
                        setSelectedBikeId(null);
                        setShouldFlyToBike(false);
                      }}
                    >
                      <div style={{ minWidth: 220 }}>
                        <strong>Bike #{bike.id}</strong>
                        <div>Status: {getAvailabilityText(bike)}</div>
                        <div>Batteri: {bike.battery ?? 0}%</div>

                        {bike.currentStationId && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ color: "green" }}>
                              🔌 Laddstation:{" "}
                              {stations.find((s) => s.id === bike.currentStationId)?.name}
                            </div>

                            <button
                              style={{
                                marginTop: 6,
                                padding: "4px 8px",
                                fontSize: "0.8rem",
                                background: "#d32f2f",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                              onClick={async () => {
                                if (!window.confirm("Ta bort cykel från laddstation?")) return;

                                try {
                                  await removeBikeFromStation(bike.id);

                                  setBikes(prev =>
                                    prev.map(b =>
                                      b.id === bike.id
                                        ? {
                                            ...b,
                                            currentStationId: null,
                                            isCharging: false,
                                            isAvailable: true,
                                          }
                                        : b
                                    )
                                  );
                                } catch (err) {
                                  alert(err.message || "Misslyckades");
                                }
                              }}
                            >
                              Ta bort från laddstation
                            </button>
                          </div>
                        )}

                        <div>Hastighet: {formatSpeed(bike.speed)}</div>
                        {!bike.isCharging && (
                          <div>Resa: {getRideStatusText(bike, activeRide)}</div>
                        )}

                        {bike.isCharging && (
                          <div style={{ color: "green" }}>🔋 Laddas (ingen resa)</div>
                        )}

                        {activeRide?.startedAt && (
                          <div>Start: {formatTelemetryTime(activeRide.startedAt)}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Parkeringszoner */}
              {visibleParkingZones.map((zone) => (
                <Circle
                  key={`parking-zone-${zone.id}`}
                  center={[zone.center.lat, zone.center.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    color: "#2e7d32",
                    fillColor: "#66bb6a",
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: "4",
                    pane: "overlayPane",
                  }}
                >
                  <Popup>
                    <strong>{zone.name}</strong>
                    <br />
                    Accepterad parkeringszon
                    <br />
                    Radie: {zone.radius} m
                    <br />
                    <br />
                    Cyklar här: {bikesByParkingZone[zone.id]?.length ?? 0}
                    <ul style={{ paddingLeft: 16 }}>
                      {bikesByParkingZone[zone.id]?.map((b) => (
                        <li key={b.id}>Bike #{b.id}</li>
                      ))}
                    </ul>
                  </Popup>
                </Circle>
              ))}

              {/* Stationsmarkörer */}
              {stations
                .filter(
                  (s) =>
                    s?.location &&
                    typeof s.location.lat === "number" &&
                    typeof s.location.lng === "number"
                )
                .map((station) => (
                  <Marker
                    key={`station-${station.id}`}
                    position={[station.location.lat, station.location.lng]}
                    icon={stationIcon}
                  >
                    <Popup>
                      <strong>{station.name}</strong>
                      <br />
                      Cyklar: {station.currentBikes}
                      {station.capacity > 0 && ` / ${station.capacity}`}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          <p
            style={{
              marginTop: "0.5rem",
              color: "#555",
              fontSize: "0.875rem",
            }}
          >
            Tips: Om flera cyklar står på samma plats kan ikoner ligga på
            varandra — zooma in för att se dem tydligare.
          </p>
        </div>
      </div>

      <style>{`
        .selected-bike-icon {
          background: none !important;
          border: none !important;
        }
        
        .station-icon {
          background: none !important;
          border: none !important;
        }
        
        .mobile-close-btn {
          display: none;
        }
        
        .mobile-toggle-btn {
          display: none;
        }
        
        @media (max-width: 768px) {
          .bike-list {
            position: fixed;
            top: 0;
            left: 0;
            width: 85vw;
            max-width: 360px;
            height: 100vh;
            background: white;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 1200;
            box-shadow: 2px 0 8px rgba(0,0,0,0.3);
          }

          .bike-list.mobile-open {
            transform: translateX(0);
          }
          
          .mobile-close-btn {
            display: block !important;
          }
          
          .mobile-toggle-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          
          .main-content {
            flex-direction: column;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .controls-section > div:first-child {
            display: none;
          }
          
          .stats-section {
            margin-left: 0;
            margin-top: 0;
            font-size: 0.8rem;
            gap: 0.75rem;
            justify-content: space-between;
          }
          
          .label-text {
            font-size: 0.9rem;
          }

          .map-title {
            display: none;
          }

          .mobile-overlay {
            touch-action: none;
          }

          .map-wrapper {
            margin-top: 0.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-section span {
            font-size: 0.75rem;
          }

          .stats-section {
            font-size: 0.75rem;
            gap: 0.5rem;
          }

          input[type=checkbox] {
            display: inline-block;
            transform: scale(1);
            transform-origin: left center;
          }
        }
      `}</style>
    </div>
  );
}