// src/components/BikeList.jsx
import BikeCard from "./BikeCard";

export default function BikeList({ bikes }) {
  return (
    <div>
      {bikes.map((bike) => (
        <BikeCard key={bike._id} bike={bike} />
      ))}
    </div>
  );
}
