import { useEffect, useState } from "react";
import { getAllScooters } from "./api";

export default function Dashboard() {
  const [scooters, setScooters] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllScooters();
      setScooters(data);
    }
    fetchData();
  }, []);

  // Statistik
  const total = scooters.length;
  const rented = scooters.filter(s => !s.isAvailable).length;
  const avgBattery =
    total > 0
      ? Math.round(scooters.reduce((sum, s) => sum + s.battery, 0) / total)
      : 0;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats">
        <div className="stat-card">
          <h3>Total cyklar</h3>
          <p>{total}</p>
        </div>
        <div className="stat-card">
          <h3>Uthyrda cyklar</h3>
          <p>{rented}</p>
        </div>
        <div className="stat-card">
          <h3>Genomsnittligt batteri</h3>
          <p>{avgBattery}%</p>
        </div>
      </div>

      <h2>Alla Elsparkcyklar</h2>
      <ul className="scooter-list">
        {scooters.map((scooter) => (
          <li key={scooter._id} className="scooter-item">
            ID: {scooter.id}, Battery: {scooter.battery}{" "}
            {scooter.battery < 20 ? "🔴" : scooter.battery < 50 ? "🟠" : "🟢"}, Available:{" "}
            {scooter.isAvailable ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}
