
import { Database } from "bun:sqlite";

const DB_FILE = process.env.DB_FILE || "auth.db";
export type User = {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
};

export const db = new Database(DB_FILE);

// Create users table if not exists
db.exec(
    `CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TEXT DEFAULT (datetime('now'))
   );`
);

export function findUserByEmail(email: string): User | null {
    return db
        .prepare(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = ?"
        )
        .get(email) as User | null;
}

export function createUser(email: string, password_hash: string) {
    const stmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    const result = stmt.run(email, password_hash);
    return { id: result.lastInsertRowid, email };
}
