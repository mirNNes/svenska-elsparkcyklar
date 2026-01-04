import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../api/users";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      setError("Kunde inte hämta användare");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim();

    return users.filter((u) => {
      if (!q) return true;
      return (
        String(u.id).includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  if (loading) {
    return <div style={{ padding: 16 }}>Laddar användare…</div>;
  }

  return (
    <div className="users-page">
      <div style={{ padding: "clamp(0.75rem, 2vw, 1rem)" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
          className="users-header"
        >
          <h2 style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
            Användare
          </h2>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök på ID eller e-post…"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "2px solid #ddd",
              maxWidth: "400px",
              fontSize: "1rem",
            }}
            className="users-search-input"
          />
        </div>

        {error && <div style={{ color: "crimson", marginBottom: "1rem" }}>{error}</div>}

        {/* Desktop table view */}
        <div style={{ overflowX: "auto" }} className="desktop-table">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "E-post", "Roll", "Skapad"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "3px solid #003b84",
                      fontSize: "0.875rem",
                      color: "#444",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 14, color: "#666" }}>
                    Inga användare hittades.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u._id ?? u.id}
                    onClick={() => navigate(`/users/${u.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ padding: "12px 8px" }}>{u.id}</td>
                    <td style={{ padding: "12px 8px" }}>{u.email}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          fontSize: "0.875rem",
                          background: "#f0f0f0",
                          borderRadius: 4,
                        }}
                      >
                        {u.role === "user" ? "Kund" : u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString("sv-SE")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="mobile-cards">
          {filteredUsers.length === 0 ? (
            <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
              Inga användare hittades.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id ?? u.id}
                onClick={() => navigate(`/users/${u.id}`)}
                style={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "1.1rem" }}>ID: {u.id}</strong>
                  <span
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      background: "#f0f0f0",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {u.role === "user" ? "Kund" : u.role}
                  </span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.25rem" }}>
                  {u.email}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#999" }}>
                  Skapad: {u.createdAt ? new Date(u.createdAt).toLocaleString("sv-SE") : "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-table {
            display: none;
          }

          .mobile-cards {
            display: block;
          }

          .users-header {
            align-items: stretch;
          }

          .users-header input {
            max-width: none;
          }
        }

        .users-page tbody tr:hover td {
          background: rgb(245, 245, 245);
        }

        .mobile-cards > div:active {
          background: rgb(245, 245, 245);
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}