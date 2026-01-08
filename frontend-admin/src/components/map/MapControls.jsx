import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Zooma kartan så att alla cyklar syns.
 */
export function FitBounds({ bikes, boundsKey, isBikeSelected }) {
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

/**
 * Zooma till vald cykel
 */
export function FlyToBike({ bike, setPauseFitBounds }) {
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

/**
 * Öppna popup för vald cykel
 */
export function BikePopupOpener({ selectedBikeId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedBikeId) return;

    setTimeout(() => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const options = layer.options;
          if (options && options.bikeId === selectedBikeId) {
            const popup = layer.getPopup();
            if (popup) {
              popup.openOn(map);
            }
          }
        }
      });
    }, 100);
  }, [selectedBikeId, map]);

  return null;
}