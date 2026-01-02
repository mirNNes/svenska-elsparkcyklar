import { useEffect, useState } from "react";
import { getAllInvoices } from "../api/invoices"
import InvoicesList from "../components/InvoicesList";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllInvoices();
        if (!cancelled) setInvoices(res || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta fakturor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Laddar fakturor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Fakturor</h2>
      <br />
      {invoices.length === 0 ? (
        <p>Inga fakturor hittades ännu.</p>
      ) : (
        <InvoicesList invoices={invoices} />
      )}
    </div>
  );
}
