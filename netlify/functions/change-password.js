import { db } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validatePassword } from "./validation.js";

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

    const auth = event.headers?.authorization ?? "";
    const token = auth.replace("Bearer ", "");
    if (!token) {
        return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: "No token" })
        };
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: "Invalid token" })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: "Invalid JSON" })
        };
    }

    const { newPassword, currentPassword } = body;

    if (!newPassword) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: "Missing new password" })
        };
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: passwordValidation.message })
        };
    }

    try {
        const userResult = await db`SELECT password_hash, password_changed_by_admin FROM users WHERE user_id = ${payload.user_id}`;
        const user = userResult[0];

        if (!user) {
            return {
                statusCode: 404,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ status: "error", message: "User not found" })
            };
        }

        if (!user.password_changed_by_admin) {
            if (!currentPassword) {
                return {
                    statusCode: 400,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ status: "error", message: "Current password is required" })
                };
            }
            const valid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!valid) {
                return {
                    statusCode: 401,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ status: "error", message: "Current password is incorrect" })
                };
            }
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db`UPDATE users SET password_hash = ${hash}, password_changed_by_admin = FALSE WHERE user_id = ${payload.user_id}`;

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "success", message: "Password changed" })
        };
    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "error", message: "Server error" })
        };
    }
}
