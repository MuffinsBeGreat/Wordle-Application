export const API_BASE = import.meta.env.VITE_API_BASE;

function cleanJoin(base, endpoint) {
  return `${base.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(cleanJoin(API_BASE, endpoint), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}