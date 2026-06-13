import { db } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validateUsername, validatePassword } from "./validation.js";

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

    // validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: usernameValidation.message })
        };
    }

    // validate password format
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: passwordValidation.message })
        };
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        // create new user with security fields initialized
        await db`INSERT INTO users (username, password_hash, role, password_changed_by_admin) VALUES (${username}, ${hash}, ${2}, ${false})`;

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
