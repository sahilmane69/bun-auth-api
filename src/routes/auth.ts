
import type { User } from "../db/client";
import { findUserByEmail, createUser } from "../db/client";
import { hashPassword, comparePassword } from "../utils/hash";
import { sign } from "../utils/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export async function signupHandler(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body || {};
        if (!email || !password) return new Response(JSON.stringify({ error: "email & password required" }), { status: 400 });

        const existing = findUserByEmail(email);
        if (existing) return new Response(JSON.stringify({ error: "user exists" }), { status: 409 });

        const password_hash = await hashPassword(password);
        const user = createUser(email, password_hash);
        return new Response(JSON.stringify({ ok: true, user }), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
    }
}

export async function loginHandler(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body || {};
        if (!email || !password) return new Response(JSON.stringify({ error: "email & password required" }), { status: 400 });

        const user = findUserByEmail(email);
        if (!user) return new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401 });

        const ok = await comparePassword(password, user.password_hash);
        if (!ok) return new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401 });

        const token = await sign({ sub: user.id, email: user.email }, JWT_SECRET, { expSec: 60 * 60 * 24 }); // 1 day
        return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json" } });
    } catch {
        return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
    }
}
