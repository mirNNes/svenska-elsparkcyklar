export default function CityCard({ city, bikeCount, onOpen }) {
  return (
    <div
      className="card"
      onClick={() => onOpen(city)}
      style={{ cursor: "pointer" }}
    >
      <h3>{city.name}</h3>

      <p>
        <strong>Cyklar i stad:</strong> {bikeCount}
      </p>

      {city.center?.lat && city.center?.lng && (
        <p>
          <strong>Center:</strong> {city.center.lat}, {city.center.lng}
        </p>
      )}

      {city.radius && (
        <p>
          <strong>Radie:</strong> {city.radius} m
        </p>
      )}

      <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
        Klicka för att visa alla cyklar i {city.name}
      </p>
    </div>
  );
}
