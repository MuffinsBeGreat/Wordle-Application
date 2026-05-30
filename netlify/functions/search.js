const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

exports.handler = async (event) => {
  try {
    const q = (event.queryStringParameters?.q || "").trim();

    if (!q) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const sql = `
      SELECT word, description
      FROM words
      WHERE word LIKE CONCAT(?, '%')
      ORDER BY 
        CASE 
          WHEN word = ? THEN 1
          WHEN word LIKE CONCAT(?, '%') THEN 2
          ELSE 3
        END
      LIMIT 10
    `;

    const [rows] = await pool.execute(sql, [q, q, q]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: err.message,
      }),
    };
  }
};