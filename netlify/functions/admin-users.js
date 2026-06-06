import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const sql = neon(process.env.DATABASE_URL);
        const users = await sql`SELECT user_id, username, role, created_at FROM users ORDER BY created_at DESC`;
        return new Response(JSON.stringify({ users }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

export const config = { path: "/api/admin/users" };