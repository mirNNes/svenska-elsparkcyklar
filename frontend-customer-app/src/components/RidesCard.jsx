export default function RidesCard({ ride }) {

  function MakeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();
    const hour = newDate.getHours();
    const minute = newDate.getMinutes();

    return `${day}/${month+1}/${year} ${hour}:${minute}`

  }

  const startDate = MakeDateString(ride.startedAt);
  const endDate = MakeDateString(ride.endedAt);
  
  return (
    <div className="card">
      <h3>Ride #{ride.id}</h3>
      <p>Starttid: {startDate}</p>
      <p>Sluttid: {endDate}</p>
    </div>
  );
}
