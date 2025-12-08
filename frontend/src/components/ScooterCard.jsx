export default function ScooterCard({ scooter }) {
  return (
    <div className="card">
      <h3>Elsparkcykel #{scooter.id}</h3>
      <p>Batteri: {scooter.battery}%</p>
      <p>Status: {scooter.isAvailable ? "Tillgänglig" : "Upptagen"}</p>
      <p>Position: {scooter.location.lat}, {scooter.location.lng}</p>
    </div>
  );
}
