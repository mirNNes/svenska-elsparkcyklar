import RideCard from "./RideCard";

export default function RidesList({ rides }) {
  return (
    <div>
      {rides.map((ride) => (
        <RideCard key={ride._id} ride={ride} />
      ))}
    </div>
  );
}
