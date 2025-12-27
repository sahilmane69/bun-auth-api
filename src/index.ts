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
        if (req.method === "GET" && url.pathname === "/") {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bun Auth API</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f0f0f0;
                            color: #333;
                        }
                        .container {
                            text-align: center;
                            padding: 2.5rem;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            max-width: 400px;
                            width: 90%;
                        }
                        h1 { color: #d03fae; margin-bottom: 1rem; }
                        p { line-height: 1.6; }
                        .uptime { font-size: 0.9em; color: #666; margin-top: 1.5rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Bun Auth API</h1>
                        <p>Welcome! The server is up and running.</p>
                        <p>Endpoints available: <code>/signup</code>, <code>/login</code>, <code>/me</code></p>
                    </div>
                </body>
                </html>
            `, { headers: { "Content-Type": "text/html" } });
        }
        if (req.method === "GET" && url.pathname === "/me") return protectedHandler(req);

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running on http://localhost:${server.port}`);
