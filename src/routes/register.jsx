import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

export default function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!isValidPassword(password)) {
      setError(
        "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.status === "success") {
      nav("/");
    } else {
      setError(data.message || "Registration failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

        <Input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters and include:
          <br />
          • Uppercase letter
          <br />
          • Lowercase letter
          <br />
          • Number
          <br />
          • Special character
        </p>
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" onClick={handleRegister}>
          Create Account
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/" className="underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
