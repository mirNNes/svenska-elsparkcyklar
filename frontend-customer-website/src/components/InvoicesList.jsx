import InvoicesCard from "./InvoiceCard";

export default function InvoicesList({ invoices }) {
  return (
    <div>
      {invoices.map((invoice) => (
        <InvoicesCard key={invoice._id} invoice={invoice} />
      ))}
    </div>
  );
}
