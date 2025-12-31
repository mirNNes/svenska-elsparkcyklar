import RidesCard from "./RidesCard";

export default function RidesList({ rides }) {
  return (
    <div>
      {rides.map((ride) => (
        <RidesCard key={ride._id} ride={ride} />
      ))}
    </div>
  );
}
