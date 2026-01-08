export default function InvoicesCard({ invoice }) {

  function MakeDateString(date){
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth();
    const year = newDate.getFullYear();

    return `${day}/${month+1}/${year}`

  }

  const startDate = MakeDateString(invoice.createdAt);

  let endDate = "-";
  if (invoice.paidAt) {
    endDate = MakeDateString(invoice.paidAt);
  }

  return (
    <div className="card">
      <h3>Faktura #{invoice.id}</h3>
      <p>Pris: {invoice.amount} kr</p>
      <p>Status: {invoice.status == "unpaid" ? "Obetald" : "Betald"}</p>
      <p>Skapad: {startDate}</p>
      <p>Betalad: {endDate}</p>
    </div>
  );
}
