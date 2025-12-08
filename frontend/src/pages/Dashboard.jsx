import { useEffect, useState } from "react";
import { getAllScooters } from "../api";

export default function Dashboard() {
  const [scooters, setScooters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllScooters();
      setScooters(data);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Alla Elsparkcyklar</h1>
      <ul>
        {scooters.map((scooter) => (
          <li key={scooter._id}>
            ID: {scooter.id}, Battery: {scooter.battery}, Available:{" "}
            {scooter.isAvailable ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}
