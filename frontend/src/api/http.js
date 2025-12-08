const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function httpGet(path) {
  const res = await fetch(`${API_URL}${path}`);

  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`);
  }

  return res.json();
}
