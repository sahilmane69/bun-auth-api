// src/index.ts
import { signupHandler, loginHandler } from "./routes/auth";
import { protectedHandler } from "./routes/protected";

const server = Bun.serve({
    port: Number(process.env.PORT || 3000),
    fetch(req: Request) {
        const url = new URL(req.url);
        if (req.method === "GET" && url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
        }
        if (req.method === "POST" && url.pathname === "/signup") return signupHandler(req);
        if (req.method === "POST" && url.pathname === "/login") return loginHandler(req);
        if (req.method === "GET" && url.pathname === "/me") return protectedHandler(req);

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running on http://localhost:${server.port}`);
