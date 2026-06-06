import jwt from "jsonwebtoken";

export function requireAdmin(req) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) throw { status: 401, message: "Unauthorised" };

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 1) throw { status: 403, message: "Admins only" };

    return payload;
}