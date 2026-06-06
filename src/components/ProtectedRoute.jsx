import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "invalid"

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatus("invalid"); return; }

    apiFetch("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => setStatus("ok"))
      .catch(() => {
        localStorage.removeItem("token"); // clear bad token
        setStatus("invalid");
      });
  }, []);

  if (status === "checking") return null; // or a spinner
  if (status === "invalid") return <Navigate to="/" replace />;
  return children;
}
