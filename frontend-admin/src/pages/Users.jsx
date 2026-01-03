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
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 65,
          }}
        >
          <h2 style={{ margin: 0 }}>Användare</h2>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök på ID eller e-post…"
            style={{
              marginLeft: "auto",
              padding: "8px 10px",
              borderRadius: 8,
              border: "5px solid #ddd",
              minWidth: 260,
            }}
          />
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "E-post", "Roll", "Skapad"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "5px solid #003b84ff",
                      fontSize: 35,
                      color: "#444",
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
                    <td style={{ padding: "20px 8px" }}>{u.id}</td>

                    <td style={{ padding: "20px 8px" }}>{u.email}</td>

                    <td style={{ padding: "20px 8px" }}>
                      <span
                        style={{
                          padding: "8px 15px",
                          fontSize: 35,
                        }}
                      >
                        {u.role === "user" ? "Kund" : u.role}
                      </span>
                    </td>

                    <td style={{ padding: "20px 8px" }}>
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
      </div>
    </div>
  );
}
