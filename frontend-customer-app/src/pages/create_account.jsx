import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpPost } from "../api/http";
import logo from '../assets/logo.png'

export default function CreateAccount({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await httpPost("/auth/signup", {
        name,
        email,
        password,
        username,
      });

      // Backend svarar med access_token, refresh_token och user
      const { access_token, refresh_token, user } = response.data;

      // Skicka vidare till App.jsx
      onLogin(access_token, refresh_token, user);

      // Gå till dashboard
      navigate("/", { replace: true });
    } catch (err) {
      const msg = 
        err.response?.data?.error || "Någonting gick fel!";
      setError(msg);
    } finally {
      setLoading(false);
    }

  }
  

  return (
    
      <div className='login-form'>
        <div className='logodiv'>
          <img src={logo} height='50px' alt="Logo" />
          <p class='small-container'>Logga in</p>
        </div>
        <form class="login_form" onSubmit={handleSubmit}>
          <label class="input-label" for="username">Användarnamn:</label>
          <input
              class="input"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              />
          <label class="input-label" for="name">Namn:</label>
          <input
              class="input"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoComplete="name"
              />
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
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
  );
}
