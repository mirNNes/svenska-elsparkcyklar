import { useEffect, useState } from "react";
import { httpGet } from "../api/http";

export default function Dashboard() {
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await httpGet("/bike");
        setBikes(data);
      } catch (err) {
        console.error("Kunde inte hämta bikes", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Alla Bikes</h1>
      <ul>
        {bikes.map((bike) => (
          <li key={bike._id}>
            ID: {bike.id}, Battery: {bike.battery}, Available:{" "}
            {bike.isAvailable ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}
