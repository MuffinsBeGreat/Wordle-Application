import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const url = new URL(req.url);
        const word = url.pathname.split("/").pop();
        const sql = neon(process.env.DATABASE_URL);
        await sql`DELETE FROM words WHERE word = ${word}`;
        return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

export const config = { path: "/api/words/:word" };