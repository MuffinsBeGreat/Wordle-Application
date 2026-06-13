import { requireAdmin } from "./_adminGuard.js";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { validatePassword } from "./validation.js";

export default async (req) => {
    try {
        requireAdmin(req);
        const url = new URL(req.url);
        const parts = url.pathname.split("/");
        const id = parts[parts.indexOf("users") + 1];

        const { newPassword } = await req.json();

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return new Response(JSON.stringify({ error: passwordValidation.message }), { status: 400 });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`UPDATE users SET password_hash = ${hash}, password_changed_by_admin = TRUE WHERE user_id = ${id} RETURNING user_id`;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};
