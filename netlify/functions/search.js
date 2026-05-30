import { db } from "./db.js";

export async function handler(event) {
  try {
    const q = (event.queryStringParameters?.q || "").trim();

    if (!q) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const result = await db.query(
      `
      SELECT word, description
      FROM words
      WHERE word ILIKE $1
      ORDER BY
        CASE
          WHEN word = $2 THEN 1
          WHEN word ILIKE $3 THEN 2
          ELSE 3
        END
      LIMIT 10
      `,
      [`${q}%`, q, `${q}%`]
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}