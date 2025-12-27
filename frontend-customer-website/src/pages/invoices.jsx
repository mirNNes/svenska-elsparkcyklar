import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { getInvoiceMe } from '../api/invoice';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getInvoiceMe();
        if (!cancelled) setInvoices(res.data || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta fakturor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    if (Object.keys(invoices).lenght == 0) {
      setError("Inga fakturor");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Laddar fakturor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>Fakturor</h1>
      <ul>
        {invoices.map((invoice) => (
          <li key={invoice._id}>
            ID: {invoice.id}, Kostnad: {invoice.proce}, Status:{invoice.status}
          </li>
        ))}
      </ul>
    </div>
  );
}


export default Invoices