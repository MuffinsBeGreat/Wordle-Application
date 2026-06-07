import { db } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }

  const { username, password } = JSON.parse(event.body || "{}");

  if (!username || !password) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: "Missing fields" })
    };
  }

  try {
    const result = await db`SELECT * FROM users WHERE username = ${username}`;
    const user = result[0];

    if (!user) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ status: "error", message: "Invalid credentials" })
      };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ status: "error", message: "Invalid credentials" })
      };
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        status: "success",
        token,
        user: { username: user.username, role: user.role }
      })
    };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: "Server error" })
    };
  }
}