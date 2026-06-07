import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const url = new URL(req.url);
        const word = url.pathname.split("/").pop();
        const sql = neon(process.env.DATABASE_URL);

        if (req.method === "DELETE") {
            await sql`DELETE FROM words WHERE word = ${word}`;
            return new Response(JSON.stringify({ status: "success" }), { status: 200 });
        }

        if (req.method === "PUT") {
            const { description } = await req.json();
            await sql`UPDATE words SET description = ${description} WHERE word = ${word}`;
            return new Response(JSON.stringify({ status: "success" }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

// export const config = { path: "/api/words/:word" };