import axios from 'axios';

// Bas-URL till backend-API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Global variabel där access-token sparas efter inloggning
let globalAccessToken = null;

let globalRefreshToken = null;

// Anropas från App.jsx när man loggar in / ut
export function setAccessToken(token) {
  globalAccessToken = token;
}

export function setRefreshToken(token) {
  globalRefreshToken = token;
}

// Gemensam Axios-instans för alla HTTP-anrop från admin-frontenden
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Lägg till Authorization-header med Bearer-token på alla API-requests (om inloggad)
api.interceptors.request.use(config => {
  if (globalAccessToken) {
    config.headers.Authorization = `Bearer ${globalAccessToken}`;
  }
  return config;
});

// Auto-refresh vid 401 eller logout om refresh misslyckas
// api.interceptors.response.use(
//   res => res,
//   async error => {
//     if (
//       error.response?.status === 401 &&
//       !error.config._retry &&
//       !error.config.url.includes('/auth')
//     ) {
//       error.config._retry = true;

//       try {
//         const res = await axios.post(`${API_URL}/auth/refresh`, {
//           refresh_token: globalRefreshToken
//         });

//         const { access_token, refresh_token } = res.data;

//         setAccessToken(access_token);
//         setRefreshToken(refresh_token);

//         localStorage.setItem("adminToken", access_token);
//         localStorage.setItem("adminRefreshToken", refresh_token);

//         error.config.headers.Authorization = `Bearer ${access_token}`;
//         return api(error.config);
//       } catch {
//         setAccessToken(null);
//         setRefreshToken(null);
//         window.location.href = "/login";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export const httpGet = (path) => api.get(path);
export const httpPost = (path, body) => api.post(path, body);
