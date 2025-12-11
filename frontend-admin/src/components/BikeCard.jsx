export default function BikeCard({ bike }) {
  return (
    <div className="card">
      <h3>Bike #{bike.id}</h3>
      <p>Batteri: {bike.battery}%</p>
      <p>Status: {bike.isAvailable ? "Tillgänglig" : "Upptagen"}</p>
      <p>
        Position: {bike.location?.lat}, {bike.location?.lng}
      </p>
    </div>
  );
}
