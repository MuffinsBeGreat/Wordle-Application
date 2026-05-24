import { db } from "./db.js";
import jwt from "jsonwebtoken";

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

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "error", message: "Invalid credentials" })
      };
    }

    const valid = await Bun.password.verify(password, user.password_hash);

    if (!valid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "error", message: "Invalid credentials" })
      };
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "success", token })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Server error" })
    };
  }
}
