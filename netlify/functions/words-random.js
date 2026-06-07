import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        const url = new URL(req.url);
        const length = parseInt(url.searchParams.get("length"));

        if (!length || length < 3 || length > 7) {
            return new Response(JSON.stringify({ error: "Invalid length" }), { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`
            SELECT word FROM words
            WHERE length = ${length}
            ORDER BY RANDOM()
            LIMIT 1
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: "No words found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ word: result[0].word }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};