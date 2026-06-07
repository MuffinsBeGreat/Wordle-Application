import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const url = new URL(req.url);
        const parts = url.pathname.split("/");
        const id = parts[parts.indexOf("users") + 1];
        const sql = neon(process.env.DATABASE_URL);
        await sql`DELETE FROM users WHERE user_id = ${id}`;
        return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

// export const config = { path: "/api/admin/users/:id" };