import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../api/users";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Användare</h2>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på ID, e-post eller roll…"
          style={{
            marginLeft: "auto",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            minWidth: 260,
          }}
        />
      </div>

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "E-post", "Roll", "Saldo", "Skapad"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    borderBottom: "1px solid #eee",
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
                <td colSpan={5} style={{ padding: 14, color: "#666" }}>
                  Inga användare hittades.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id ?? u.id}>
                  <td style={{ padding: "10px 8px" }}>{u.id}</td>

                  <td style={{ padding: "10px 8px" }}>{u.email}</td>

                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        padding: "8px 15px",
                        borderRadius: 999,
                        fontSize: 35,
                        border: "1px solid #ddd",
                      }}
                    >
                      {u.role === "user" ? "Kund" : u.role}
                    </span>
                  </td>

                  <td style={{ padding: "10px 8px" }}>
                    {Number.isFinite(u.balance)
                      ? `${u.balance.toFixed(2)} kr`
                      : "–"}
                  </td>

                  <td style={{ padding: "10px 8px" }}>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString("sv-SE")
                      : "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
