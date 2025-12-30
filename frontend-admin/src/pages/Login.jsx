import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpPost } from "../api/http";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const githubLoginUrl = `${apiUrl}/auth/github`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const errorParam = params.get("error");

    if (errorParam && !accessToken) {
      setError(decodeURIComponent(errorParam));
      navigate("/login", { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      const user = {
        id: params.get("id"),
        email: params.get("email"),
        role: params.get("role"),
        username: params.get("username"),
        name: params.get("name"),
      };

      onLogin(accessToken, refreshToken, user);
      navigate("/", { replace: true });
    }
  }, [navigate, onLogin]);

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
      const msg =
        err.response?.data?.error || "Felaktig e-post eller lösenord";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Admin login</h1>
        <p className="login-subtitle">Logga in för att hantera elsparkcyklar.</p>

        <div className="login-field">
          <label className="login-label">E-post</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@elspark.com"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <label className="login-label">Lösenord</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        <div className="login-divider">
          <span>eller</span>
        </div>

        <button
          type="button"
          className="login-button login-button--github"
          onClick={() => {
            window.location.href = githubLoginUrl;
          }}
          disabled={loading}
        >
          Logga in med GitHub
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
