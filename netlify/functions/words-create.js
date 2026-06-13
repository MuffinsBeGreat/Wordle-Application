import { requireAdmin } from "./_adminGuard.js";
import { validateWord, validateDescription } from "./validation.js";
import { neon } from "@neondatabase/serverless";

export default async (req) => {
    try {
        requireAdmin(req);
        const { word, description } = await req.json();

        // validate word input
        const wordValidation = validateWord(word);
        if (!wordValidation.valid) {
            return new Response(JSON.stringify({ error: wordValidation.message }), { status: 400 });
        }

        // validate description input
        const descValidation = validateDescription(description);
        if (!descValidation.valid) {
            return new Response(JSON.stringify({ error: descValidation.message }), { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`INSERT INTO words (word, length, description)
              VALUES (${word.toUpperCase()}, ${word.length}, ${description})`;
        return new Response(JSON.stringify({ status: "success" }), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
};

// export const config = { path: "/api/words" };