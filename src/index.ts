// src/index.ts
import { signupHandler, loginHandler } from "./routes/auth";
import { protectedHandler } from "./routes/protected";

const commonCss = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background-color: #f0f2f5;
        color: #333;
    }
    .container {
        text-align: center;
        padding: 2.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 380px;
    }
    h1 { color: #000; margin: 0 0 1.5rem 0; font-size: 1.8rem; }
    .input-group { margin-bottom: 1rem; text-align: left; }
    label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; font-weight: 500; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
    input:focus { border-color: #000; outline: none; }
    button { 
        width: 100%; padding: 0.75rem; background-color: #000; color: white; border: none; 
        border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    .links { margin-top: 1.5rem; }
    a { color: #000; text-decoration: none; font-size: 0.9rem; }
    a:hover { text-decoration: underline; }
    .message { margin-top: 1rem; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; display: none; }
    .success { background-color: #e6fffa; color: #2c7a7b; display: block; }
    .error { background-color: #fff5f5; color: #c05621; display: block; }
`;

const server = Bun.serve({
    port: Number(process.env.PORT || 3000),
    fetch(req: Request) {
        const url = new URL(req.url);
        if (req.method === "GET" && url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
        }

        // API Endpoints
        if (req.method === "POST" && url.pathname === "/signup") return signupHandler(req);
        if (req.method === "POST" && url.pathname === "/login") return loginHandler(req);
        if (req.method === "GET" && url.pathname === "/me") return protectedHandler(req);

        // Frontend Routes

        // GET /signup - Serve HTML form
        if (req.method === "GET" && url.pathname === "/signup") {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Sign Up - Bun Auth API</title>
                    <style>
                        ${commonCss}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Sign Up</h1>
                        <form id="signupForm">
                            <div class="input-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="input-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            <button type="submit">Create Account</button>
                        </form>
                        <div id="message" class="message"></div>
                        <p class="links"><a href="/login">Already have an account? Login</a></p>
                        <p class="links"><a href="/">Back to Home</a></p>
                    </div>
                    <script>
                        document.getElementById('signupForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const email = document.getElementById('email').value;
                            const password = document.getElementById('password').value;
                            const msgDiv = document.getElementById('message');
                            
                            try {
                                const res = await fetch('/signup', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email, password })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    msgDiv.className = 'message success';
                                    msgDiv.textContent = 'Account created! Redirecting to login...';
                                    setTimeout(() => window.location.href = '/login', 1500);
                                } else {
                                    msgDiv.className = 'message error';
                                    msgDiv.textContent = data.error || 'Signup failed';
                                }
                            } catch (err) {
                                msgDiv.className = 'message error';
                                msgDiv.textContent = 'An error occurred';
                            }
                        });
                    </script>
                </body>
                </html>
            `, { headers: { "Content-Type": "text/html" } });
        }

        // GET /login - Serve HTML form
        if (req.method === "GET" && url.pathname === "/login") {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login - Bun Auth API</title>
                    <style>
                        ${commonCss}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Login</h1>
                        <form id="loginForm">
                            <div class="input-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="input-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            <button type="submit">Login</button>
                        </form>
                        <div id="message" class="message"></div>
                        <p class="links"><a href="/signup">Need an account? Sign up</a></p>
                        <p class="links"><a href="/">Back to Home</a></p>
                    </div>
                    <script>
                        document.getElementById('loginForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const email = document.getElementById('email').value;
                            const password = document.getElementById('password').value;
                            const msgDiv = document.getElementById('message');
                            
                            try {
                                const res = await fetch('/login', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email, password })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    localStorage.setItem('token', data.token);
                                    msgDiv.className = 'message success';
                                    msgDiv.textContent = 'Login successful! Redirecting...';
                                    setTimeout(() => window.location.href = '/me-view', 1000);
                                } else {
                                    msgDiv.className = 'message error';
                                    msgDiv.textContent = data.error || 'Login failed';
                                }
                            } catch (err) {
                                msgDiv.className = 'message error';
                                msgDiv.textContent = 'An error occurred';
                            }
                        });
                    </script>
                </body>
                </html>
            `, { headers: { "Content-Type": "text/html" } });
        }

        // GET /me-view - Check token and show protected data
        if (req.method === "GET" && url.pathname === "/me-view") {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>My Profile - Bun Auth API</title>
                    <style>
                        ${commonCss}
                        pre { text-align: left; background: #eee; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.9rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>My Profile</h1>
                        <div id="content">Loading...</div>
                        <button id="logoutBtn" style="background-color: #666; margin-top: 1rem;">Logout</button>
                        <p class="links"><a href="/">Back to Home</a></p>
                    </div>
                    <script>
                        const token = localStorage.getItem('token');
                        if (!token) {
                            window.location.href = '/login';
                        } else {
                            fetch('/me', {
                                headers: { 'Authorization': 'Bearer ' + token }
                            })
                            .then(async res => {
                                if (res.ok) {
                                    const data = await res.json();
                                    document.getElementById('content').innerHTML = '<p style="color: green; margin-bottom: 1rem;">Access Granted</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                                } else {
                                    document.getElementById('content').textContent = 'Session expired or invalid.';
                                    localStorage.removeItem('token');
                                }
                            })
                            .catch(err => {
                                document.getElementById('content').textContent = 'Error fetching profile.';
                            });
                        }
                        document.getElementById('logoutBtn').addEventListener('click', () => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        });
                    </script>
                </body>
                </html>
             `, { headers: { "Content-Type": "text/html" } });
        }

        if (req.method === "GET" && url.pathname === "/") {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bun Auth API</title>
                    <style>
                        ${commonCss}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Bun Auth API</h1>
                        <p>Welcome! The server is up and running.</p>
                        <div style="margin: 2rem 0; display: flex; flex-direction: column; gap: 10px;">
                            <a href="/login" style="text-decoration: none;"><button>Login</button></a>
                            <a href="/signup" style="text-decoration: none;"><button style="background-color: white; color: #000; border: 2px solid #000;">Sign Up</button></a>
                        </div>
                        <p class="uptime">API Endpoints: <code>/signup</code>, <code>/login</code>, <code>/me</code></p>
                    </div>
                </body>
                </html>
            `, { headers: { "Content-Type": "text/html" } });
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running on http://localhost:${server.port}`);
