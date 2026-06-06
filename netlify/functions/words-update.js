import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const url = new URL(req.url);
        const word = url.pathname.split("/").pop();
        const { description } = await req.json();
        const sql = neon(process.env.DATABASE_URL);
        await sql`UPDATE words SET description = ${description} WHERE word = ${word}`;
        return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

export const config = { path: "/api/words/:word" };