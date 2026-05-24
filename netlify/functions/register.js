import { db } from "./db.js";
import jwt from "jsonwebtoken";

export async function handler(event) {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        };
    }

    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ status: "error", message: "Missing fields" })
        };
    }

    try {
        const hash = await Bun.password.hash(password);

        await db.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
            [username, hash]
        );

        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "success", token })
        };
    } catch (err) {
        console.error("REGISTER ERROR:", err);

        return {
            statusCode: 400,
            body: JSON.stringify({
                status: "error",
                message: err.message
            })
        };
    }

}
