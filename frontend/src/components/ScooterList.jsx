import ScooterCard from "./ScooterCard";

export default function ScooterList({ scooters }) {
  return (
    <div>
      {scooters.map(scooter => (
        <ScooterCard key={scooter._id} scooter={scooter} />
      ))}
    </div>
  );
}
