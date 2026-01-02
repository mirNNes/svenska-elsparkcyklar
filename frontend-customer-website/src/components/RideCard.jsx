export default function RidesCard({ ride }) {

  function MakeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();

    return `${day}/${month+1}/${year}`

  }

  const startDate = MakeDateString(ride.startedAt);
  
  return (
    <div className="card">
      <h3>Resa #{ride.id}</h3>
      <p>Datum: {startDate}</p>
    </div>
  );
}
