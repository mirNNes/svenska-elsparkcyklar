import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { httpPost } from "../api/http";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await httpPost("/auth/login", {
        email,
        password,
      });

      // Backend svarar med access_token, refresh_token och user
      const { access_token, refresh_token, user } = response.data;

      // Skicka vidare till App.jsx
      onLogin(access_token, refresh_token, user);

      // Gå till dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.log(err);
      const msg =
        err.response?.data?.error || "Felaktig e-post eller lösenord";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className='login-form'>
        <div className='logodiv'>
          <h3>Logga in</h3>
        </div>
        <form class="login_form" onSubmit={handleSubmit}>
            <label class="input-label" for="email">Email:</label>
          <input
              class="input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              />
          <label class="input-label" for="password">Lösenord:</label>
          <input
              class="input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
              />
          <button type="submit" className="green-button" disabled={loading}>
            {loading ? "Loggar in..." : "Logga in"}
          </button>
          <Link to="/create_account" class="blue-button">Skapa nytt konto</Link>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
  );
}
