import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

export default function ChangePassword() {
  const nav = useNavigate();
  const forced = localStorage.getItem("forcePasswordChange") === "true";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!forced) {
      const token = localStorage.getItem("token");
      if (!token) nav("/");
    }
  }, [forced, nav]);

  async function handleSubmit() {
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and special character");
      return;
    }

    try {
      const body = forced
        ? { newPassword }
        : { currentPassword, newPassword };

      await apiFetch("/change-password", {
        method: "POST",
        body: JSON.stringify(body),
      });

      localStorage.removeItem("forcePasswordChange");
      nav("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          {forced ? "Change Your Password" : "Change Password"}
        </h1>

        {forced && (
          <p className="text-sm text-amber-600">
            An admin changed your password. Please set a new one to continue.
          </p>
        )}

        {!forced && (
          <Input
            placeholder="Current Password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
        )}

        <Input
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters and include:
          <br />
          {"\u2022"} Uppercase letter
          <br />
          {"\u2022"} Lowercase letter
          <br />
          {"\u2022"} Number
          <br />
          {"\u2022"} Special character
        </p>
        <Input
          placeholder="Confirm New Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" onClick={handleSubmit}>
          {forced ? "Set Password" : "Change Password"}
        </Button>
      </Card>
    </div>
  );
}
