import mysql from "mysql2/promise";

export async function handler(event, context) {
  // Allow CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
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
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    const hash = await Bun.password.hash(password);

    await conn.execute(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hash]
    );

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "success" })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        status: "error",
        message: "Username already taken"
      })
    };
  }
}
