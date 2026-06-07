import { db } from "./db.js";

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
  try {
    const q = (event.queryStringParameters?.q || "").trim();

    if (!q) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const result = await db`
      SELECT word, description
      FROM words
      WHERE word ILIKE ${q + '%'}
      ORDER BY
        CASE
          WHEN word = ${q} THEN 1
          WHEN word ILIKE ${q + '%'} THEN 2
          ELSE 3
        END
      LIMIT 10
    `;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result), // ✅ result is already the array
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}