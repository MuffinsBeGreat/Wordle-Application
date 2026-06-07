import { db } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                status: "error",
                message: "Missing fields"
            })
        };
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                status: "error",
                message:
                    "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character."
            })
        };
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        await db`INSERT INTO users (username, password_hash, role) VALUES (${username}, ${hash}, ${2})`;

        const token = jwt.sign({ username, role: 2 }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                status: "success",
                token,
                user: { username, role: 2 }
            })
        };
    } catch (err) {
        console.error("REGISTER ERROR:", err);

        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                status: "error",
                message: err.message
            })
        };
    }

}
