import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const { word, description } = await req.json();
        const sql = neon(process.env.DATABASE_URL);
        await sql`INSERT INTO words (word, length, description)
              VALUES (${word.toUpperCase()}, ${word.length}, ${description})`;
        return new Response(JSON.stringify({ status: "success" }), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

export const config = { path: "/api/words" };