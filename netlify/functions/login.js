import jwt from "jsonwebtoken";
import { getDB } from "./db.js";

export async function handler(event, context) {
  // CORS
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
      body: JSON.stringify({ status: "error", message: "Missing fields" })
    };
  }

  try {
    const db = await getDB();
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

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

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        status: "success",
        token,
        user: {
          id: user.id,
          username: user.username
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: "Server error" })
    };
  }
}
