export default function RidesCard({ ride }) {
  return (
    <div className="card">
      <h3>Ride #{ride.id}</h3>
      <p>starttime: {ride.rideStarted}%</p>
    </div>
  );
}
