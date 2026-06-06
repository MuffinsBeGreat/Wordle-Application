import jwt from "jsonwebtoken";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type" }
    };
  }

  const auth = event.headers["authorization"] ?? "";
  const token = auth.replace("Bearer ", "");

  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "No token" }) };

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };
  }
}