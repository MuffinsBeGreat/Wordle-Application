import jwt from "jsonwebtoken";

export async function handler(event, context) {
  // CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    };
  }

  const auth = event.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      body: JSON.stringify({ valid: false })
    };
  }

  const token = auth.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        valid: true,
        user: decoded
      })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ valid: false })
    };
  }
}
