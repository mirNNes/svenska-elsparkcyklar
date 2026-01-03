import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "../api/users";
import { getRidesByUser } from "../api/rides";
import { getInvoicesByUser } from "../api/invoices";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("sv-SE") : "-";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const numericUserId = Number(userId);
    if (!Number.isInteger(numericUserId)) {
      setError("Ogiltigt användar-ID");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [userRes, ridesRes, invoicesRes] = await Promise.allSettled([
          getUserById(numericUserId),
          getRidesByUser(numericUserId),
          getInvoicesByUser(numericUserId),
        ]);

        if (cancelled) return;

        if (userRes.status === "rejected") {
          setError("Kunde inte hämta användardata");
          return;
        }

        setUser(userRes.value);
        setRides(ridesRes.status === "fulfilled" ? ridesRes.value : []);
        setInvoices(
          invoicesRes.status === "fulfilled" ? invoicesRes.value : []
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <div className="loading-state">Laddar användare…</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!user) {
    return <div className="no-data">Användare hittades inte.</div>;
  }

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized?.includes("betald") || normalized === "paid")
      return "status-paid";
    if (normalized?.includes("väntar") || normalized === "pending")
      return "status-pending";
    if (normalized?.includes("obetald") || normalized === "unpaid")
      return "status-unpaid";
    if (normalized === "aktiv") return "status-aktiv";
    return "";
  };

  const isBalanceNegative = user.balance < 0;

  return (
    <div className="user-details">
      <button onClick={() => navigate("/users")} className="back-button">
        ← Tillbaka till användare
      </button>

      <div className="user-header">
        <h2>Användare #{user.id}</h2>
      </div>

      {/* === Info === */}
      <div className="user-info">
        <div>
          <strong>Namn:</strong> {user.name}
        </div>
        <div>
          <strong>E-post:</strong> {user.email}
        </div>
        <div>
          <strong>Skapad:</strong> {formatDate(user.createdAt)}
        </div>
        <div className={isBalanceNegative ? "balance-negative" : ""}>
          <strong>Saldo:</strong>{" "}
          {Number.isFinite(user.balance)
            ? `${user.balance.toFixed(2)} kr`
            : "-"}
        </div>
      </div>

      {/* === Resor === */}
      <div className="user-section">
        <h3>Resor</h3>

        {rides.length === 0 ? (
          <div className="no-data">Inga resor hittades.</div>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  {["ID", "Start", "Slut", "Distans (m)", "Pris"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rides.map((r) => (
                  <tr key={r._id}>
                    <td>{r.id}</td>
                    <td>{formatDate(r.startedAt)}</td>
                    <td>
                      {r.endedAt ? formatDate(r.endedAt) : "Pågår"}
                    </td>
                    <td>{r.distance ?? "-"}</td>
                    <td className="price-highlight">
                      {Number.isFinite(r.price) ? `${r.price} kr` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === Fakturor === */}
      <div className="user-section">
        <h3>Fakturor</h3>

        {invoices.length === 0 ? (
          <div className="no-data">Inga fakturor hittades.</div>
        ) : (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  {["ID", "Belopp", "Status", "Skapad"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i._id}>
                    <td>{i.id}</td>
                    <td className="price-highlight">{i.amount} kr</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(i.status)}`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td>{formatDate(i.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
