import { useEffect, useState } from "react";
import { getAllStations } from "../api/stations";
import BikeCard from "./BikeCard";

export default function BikeList({ bikes }) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    getAllStations()
      .then(setStations)
      .catch(() => setStations([]));
  }, []);

  return (
    <div>
      {bikes.map((bike) => (
        <BikeCard
          key={bike._id}
          bike={bike}
          stations={stations}
        />
      ))}
    </div>
  );
}
