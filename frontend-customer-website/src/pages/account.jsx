import { useEffect, useState } from "react";
import { getUser } from "../api/user";
import { getAllCities } from "../api/cities";

export default function Account() {
  const [user, setUser] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getUser();
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
      <table class="account_table">
        <tr>
          <th>Namn:</th>
          <td>{user.name}</td>          
        </tr>
        <tr>
          <th>Email:</th>
          <td>{user.email}</td>
        </tr>
        <tr>
          <th>Användarnamn:</th>
          <td>{user.username}</td>
        </tr>
        <tr>
          <th>Saldo:</th>
          <td>{user.balance} kr</td>
        </tr>
      </table>
    </div>
  );
}