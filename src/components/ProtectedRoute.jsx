import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatus("invalid"); return; }

    fetch("/.netlify/functions/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setStatus("ok");
        else {
          localStorage.removeItem("token");
          setStatus("invalid");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setStatus("invalid");
      });
  }, []);

  if (status === "checking") return null;
  if (status === "invalid") return <Navigate to="/" replace />;
  return children;
}