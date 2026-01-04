import { useContext, useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllBikes } from "../api/bikes";
import { getAllCities } from "../api/cities";
import { getActiveRideForBike } from "../api/rides";
import { BikeUpdatesContext } from "../components/Layout";
import L from "leaflet";
import { useSearchParams, useNavigate } from "react-router-dom";

const LOW_BATTERY_THRESHOLD = 30;

// visa telemetri i UI
function formatSpeed(speed) {
  if (!Number.isFinite(speed)) return "n/a";
  return `${Math.round(speed)} m/s`;
}

function formatTelemetryTime(value) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleString("sv-SE");
}

function getBikeModeLabel(bike) {
  if (bike.isOperational === false) return "Avstängd";
  if (bike.isInService === true) return "Service";
  return "OK";
}

function isBatteryEmpty(bike) {
  const battery = Number(bike?.battery);
  if (!Number.isFinite(battery)) return false;
  return battery <= 0;
}

function getAvailabilityText(bike) {
  if (isBatteryEmpty(bike)) return "Batteri slut";
  return bike.isAvailable ? "Tillgänglig" : "Upptagen";
}

function getRideStatusText(bike, activeRide) {
  if (isBatteryEmpty(bike)) return "Batteri slut";
  if (activeRide) return `Pågår (Ride #${activeRide.id})`;
  if (bike.isAvailable) return "Ingen aktiv resa";
  return "Pågår (hämtas...)";
}

/**
 * Zooma kartan så att alla (filtrerade) cyklar syns.
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
  }, [boundsKey, map, isBikeSelected, bikes]);

  return null;
}

/** Zooma till vald cykel */
function FlyToBike({ bike, setPauseFitBounds }) {
  const map = useMap();
  const lastBikeId = useRef(null);

  useEffect(() => {
    if (!bike) {
      lastBikeId.current = null;
      return;
    }

    if (lastBikeId.current === bike._id) return;
    lastBikeId.current = bike._id;

    const lat = bike.location?.lat;
    const lng = bike.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    setPauseFitBounds(true);

    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 0.6,
    });
  }, [bike, map, setPauseFitBounds]);

  return null;
}

/** Sidolista */
function BikeSideList({ bikes, selectedId, onSelect, activeRides, isOpen, onClose, availableOnly, lowBatteryOnly, onFilterChange, navigate }) {
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
    <>
      {/* Overlay för mobil */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          className="mobile-overlay"
        />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 320,
          maxHeight: "73vh",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "white",
          zIndex: 1000,
        }}
        className="bike-list"
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
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
              display: "none",
            }}
            className="mobile-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Filter checkboxes */}
        <div
          style={{
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "#f5f5f5",
            borderRadius: 6,
            marginBottom: 10,
          }}
          className="mobile-filters"
        >
          <strong style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>Filter</strong>
          <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.checked) {
                  params.set('available', '1');
                } else {
                  params.delete('available');
                }
                navigate(`?${params.toString()}`);
                onFilterChange();
              }}
            />
            <span>Visa bara lediga</span>
          </label>

          <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={lowBatteryOnly}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.checked) {
                  params.set('lowBattery', '1');
                } else {
                  params.delete('lowBattery');
                }
                navigate(`?${params.toString()}`);
                onFilterChange();
              }}
            />
            <span>Låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)</span>
          </label>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök id…"
          style={{
            width: "calc(100% - 20px)",
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
            const speedText = formatSpeed(b.speed);
            const modeText = getBikeModeLabel(b);
            const activeRide = activeRides[String(b.id)];
            const availabilityText = getAvailabilityText(b);
            const rideText = getRideStatusText(b, activeRide);
            const showLowBattery =
              !isBatteryEmpty(b) && battery < LOW_BATTERY_THRESHOLD;
            return (
              <button
                key={b._id}
                onClick={() => {
                  onSelect(b._id);
                  onClose();
                }}
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
                  {availabilityText}
                  {showLowBattery ? " • Låg batteri" : ""}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  Hastighet: {speedText} • Läge: {modeText}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  Resa: {rideText}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bike-list {
            position: fixed;
            left: 0;
            top: 90px;
            bottom: 0;
            max-width: 85vw;
            max-height: calc(100vh - 60px);
            border-radius: 0 8px 8px 0;
            transform: translateX(${isOpen ? '0' : '-100%'});
            transition: transform 0.3s ease-in-out;
          }
          
          .mobile-close-btn {
            display: block;
          }

          .mobile-filters {
            display: flex;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-overlay {
            display: none;
          }

          .mobile-filters {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

export default function MapView({ simulationRunning, refreshKey }) {
  const [bikes, setBikes] = useState([]);
  const [cities, setCities] = useState([]);
  const [activeRides, setActiveRides] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBikeSelected, setIsBikeSelected] = useState(false);
  const [pauseFitBounds, setPauseFitBounds] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bikeUpdates = useContext(BikeUpdatesContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bikeIcon = useMemo(() => {
    const iconSize = isMobile ? 32 : 52;
    const iconAnchor = isMobile ? 16 : 16;
    
    return new L.Icon({
      iconUrl: "/scooter.png",
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconAnchor, iconAnchor * 2],
    });
  }, [isMobile]);

  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const boundsKeyRef = useRef(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cityId = searchParams.get("city");
  const availableOnly = searchParams.get("available") === "1";
  const lowBatteryOnly = searchParams.get("lowBattery") === "1";

  useEffect(() => {
    if (!selectedBikeId) {
      setPauseFitBounds(false);
    }
  }, [selectedBikeId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bikeRes, cityRes] =
          await Promise.all([
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

  useEffect(() => {
    const updates = bikeUpdates || {};
    if (!Object.keys(updates).length) return;

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
          speed: update.speed ?? bike.speed,
          isOperational: update.isOperational ?? bike.isOperational,
          isInService: update.isInService ?? bike.isInService,
          lastTelemetryAt: update.lastTelemetryAt ?? bike.lastTelemetryAt,
          updatedAt: update.updatedAt ?? bike.updatedAt,
        };
      })
    );

    setActiveRides((prev) => {
      let changed = false;
      const next = { ...prev };

      Object.entries(updates).forEach(([key, update]) => {
        if (update?.isAvailable === true && next[key]) {
          next[key] = null;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [bikeUpdates]);

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
      if (lowBatteryOnly && (b.battery ?? 0) >= LOW_BATTERY_THRESHOLD)
        return false;
      return true;
    });
  }, [bikes, cityId, availableOnly, lowBatteryOnly]);

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

    return { total, available, rented, lowBattery, outOfBattery };
  }, [filteredBikes]);

  const boundsKey = useMemo(() => {
    if (pauseFitBounds) return boundsKeyRef.current;

    boundsKeyRef.current += 1;
    return boundsKeyRef.current;
  }, [filteredBikes.length, pauseFitBounds]);

  const selectedBike = useMemo(() => {
    return filteredBikes.find((b) => b._id === selectedBikeId) || null;
  }, [filteredBikes, selectedBikeId]);

  const selectedBikeKey = selectedBike ? String(selectedBike.id) : null;
  const selectedActiveRide = selectedBikeKey ? activeRides[selectedBikeKey] : null;

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
      {/* Header with title and mobile menu button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <button
          onClick={() => setDrawerOpen(true)}
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
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
          className="mobile-toggle-btn"
          aria-label="Visa cykellista och filter"
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
            <span style={{ opacity: 0.6, fontSize: "clamp(1rem, 3vw, 1.6rem)" }}> – filtrerad</span>
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
        <label style={{ display: "flex", gap: ".5rem", alignItems: "center", whiteSpace: "nowrap" }}>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.checked) {
              params.set('available', '1');
            } else {
              params.delete('available');
            }
            navigate(`?${params.toString()}`);
            setSelectedBikeId(null);
            setIsBikeSelected(false);
          }}
        />
        <span className="label-text">Visa bara lediga</span>
      </label>

      <label style={{ display: "flex", gap: ".5rem", alignItems: "center", whiteSpace: "nowrap" }}>
        <input
          type="checkbox"
          checked={lowBatteryOnly}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.checked) {
              params.set('lowBattery', '1');
            } else {
              params.delete('lowBattery');
            }
            navigate(`?${params.toString()}`);
            setSelectedBikeId(null);
            setIsBikeSelected(false);
          }}
        />
        <span className="label-text">Låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)</span>
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
          <span><strong>Total:</strong> {stats.total}</span>
          <span><strong>Lediga:</strong> {stats.available}</span>
          <span><strong>Uthyrda:</strong> {stats.rented}</span>
          <span><strong>Låg batteri:</strong> {stats.lowBattery}</span>
          <span><strong>Slut:</strong> {stats.outOfBattery}</span>
        </div>
      </div>

      {/* List + Map */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }} className="main-content">
        <BikeSideList
          bikes={filteredBikes}
          selectedId={selectedBikeId}
          onSelect={(bikeId) => {
            setSelectedBikeId(bikeId);
            setIsBikeSelected(true);
          }}
          activeRides={activeRides}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          availableOnly={availableOnly}
          lowBatteryOnly={lowBatteryOnly}
          onFilterChange={() => {
            setSelectedBikeId(null);
            setIsBikeSelected(false);
          }}
          navigate={navigate}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="map-wrapper"
            style={{ position: "relative" }}
          >
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
              isBikeSelected={isBikeSelected}
            />
            <FlyToBike
              bike={selectedBike}
              setPauseFitBounds={setPauseFitBounds}
            />

            {filteredBikes.map((bike) => {
              const lat = bike.location?.lat;
              const lng = bike.location?.lng;
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;

              return (
                <Marker
                  key={bike._id}
                  position={[lat, lng]}
                  icon={bikeIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedBikeId(bike._id);
                      setIsBikeSelected(true);
                    },
                  }}
                />
              );
            })}
          </MapContainer>

          {selectedBike && (
            <div
              className="bike-info-popup"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1000,
                background: "white",
                padding: 12,
                borderRadius: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                width: 260,
                maxWidth: "calc(100vw - 32px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <strong>Bike #{selectedBike.id}</strong>
                <button
                  onClick={() => {
                    setSelectedBikeId(null);
                    setIsBikeSelected(false);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  aria-label="Stäng"
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: 13 }}>
                <div>Status: {getAvailabilityText(selectedBike)}</div>
                <div>Batteri: {selectedBike.battery ?? 0}%</div>
                <div>Hastighet: {formatSpeed(selectedBike.speed)}</div>
                <div>Läge: {getBikeModeLabel(selectedBike)}</div>
                <div>Senast telemetri: {formatTelemetryTime(selectedBike.lastTelemetryAt)}</div>
                <div>Resa: {getRideStatusText(selectedBike, selectedActiveRide)}</div>
                {selectedActiveRide?.startedAt ? (
                  <div>Start: {formatTelemetryTime(selectedActiveRide.startedAt)}</div>
                ) : null}
              </div>
            </div>
          )}
          </div>

          <p style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.875rem" }}>
            Tips: Om flera cyklar står på samma plats kan ikoner ligga på
            varandra — zooma in för att se dem tydligare.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle-btn {
            display: flex;
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

          .bike-info-popup {
            position: fixed !important;
            top: auto !important;
            bottom: 16px !important;
            left: 16px !important;
            right: 16px !important;
            width: auto !important;
            max-width: none !important;
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