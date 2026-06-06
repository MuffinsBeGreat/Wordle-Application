export const API_BASE = import.meta.env.VITE_API_BASE;

function cleanJoin(base, endpoint) {
  return `${base.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(cleanJoin(API_BASE, endpoint), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  // If any request comes back 401, token has expired — log out
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API request failed");
  return data;
}