export default function InvoicesCard({ invoice }) {
  return (
    <div className="card">
      <h3>Invoice #{invoice.id}</h3>
      <p>Pris:{invoice.amount}</p>
      <p>Status:{invoice.status}</p>
      <p>Skapad:{invoice.createdAt}</p>
      <p>Betalad:{invoice.paidAt}</p>
    </div>
  );
}
