import { useEffect, useState } from "react";
import { getUSer } from "../api/user"
import InvoicesList from "../components/InvoicesList";

export default function Account() {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getUSer();
        if (!cancelled) setUser(res || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Kunde inte hämta användare");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Laddar detaljer...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Konto detaljer</h2>
      <ul>
        <li>
          Namn: {user.name}
        </li>
        <li>
          Email: {user.email}
        </li>
        <li>
          Användarnamn: {user.username}
        </li>
        <li>
          Saldo: {user.balance}
        </li>
      </ul>
    </div>
  );
}