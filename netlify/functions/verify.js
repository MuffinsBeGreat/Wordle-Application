import jwt from "jsonwebtoken";

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  const auth = event.headers["authorization"] ?? "";
  const token = auth.replace("Bearer ", "");

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "No token" })
    };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true })
    };
  } catch {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Invalid token" })
    };
  }
}