import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    const res = await fetch("http://localhost/backend/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.status === "success") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      nav("/dashboard");
    } else {
      setError(data.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" onClick={handleLogin}>
          Sign In
        </Button>

        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
