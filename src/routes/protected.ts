// src/routes/protected.ts
import { verify } from "../utils/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export async function protectedHandler(req: Request) {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return new Response(JSON.stringify({ error: "no token" }), { status: 401 });

    const payload = await verify(token, JWT_SECRET);
    if (!payload) return new Response(JSON.stringify({ error: "invalid or expired token" }), { status: 401 });
    return new Response(JSON.stringify({ ok: true, payload }), { headers: { "Content-Type": "application/json" } });
}
