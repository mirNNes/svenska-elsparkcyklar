import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllBikes, getActiveRide } from "../api/bikes";
import { getAllCities } from "../api/cities";
import L from "leaflet";

const bikeIcon = new L.Icon({
  iconUrl: "/scooter.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function MapView() {
  const [bikes, setBikes] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bikeRes, cityRes] = await Promise.all([
          getAllBikes(),
          getAllCities(),
        ]);
        if (!cancelled) {
          let bikes = bikeRes.filter(function (bike) {
            return bike.isAvailable === true;
          });
          setBikes(bikes || []);
          setCities(cityRes || []);
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

  const defaultCenter = useMemo(() => {
    // Använd första stadens center om den finns, annars mitten av Sverige
    if (cities.length > 0 && cities[0].center?.lat && cities[0].center?.lng) {
      return [cities[0].center.lat, cities[0].center.lng];
    }
    return [62.0, 15.0];
  }, [cities]);

  if (loading) return <div>Laddar karta...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ height: "85%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: "78vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {bikes.map((bike) => (
          <Marker
            key={bike._id}
            position={[bike.location?.lat || 0, bike.location?.lng || 0]}
            icon={bikeIcon}
          >
            <Popup>
              <div>
                <strong>Bike #{bike.id}</strong>
                <br />
                Status: {bike.isAvailable ? "Tillgänglig" : "Upptagen"}
                <br />
                Batteri: {bike.battery}%
                <br />
                <Link to={`/rent/${bike.id}`}>Hyr cykel</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
