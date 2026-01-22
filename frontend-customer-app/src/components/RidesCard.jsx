export default function RidesCard({ ride }) {

  function MakeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();
    const hour = newDate.getHours();
    let minute = newDate.getMinutes();

    if (minute.toString().length == 1) {
      minute = `${minute.toString()}0`
    }

    return `${day}/${month+1}/${year} ${hour}:${minute}`

  }

  const startDate = MakeDateString(ride.startedAt);
  const endDate = MakeDateString(ride.endedAt);
  
  return (
    <div className="card">
      <h3>Resa #{ride.id}</h3>
      <p>Starttid: {startDate}</p>
      <p>Sluttid: {endDate}</p>
      <p>Distans: {ride.distance} meter</p>
      <p>Pris: {ride.price} kr</p>
    </div>
  );
}
