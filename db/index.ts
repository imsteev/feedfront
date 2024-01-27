import { Database } from "bun:sqlite";

export const db = new Database(process.env.SQLITE_DB || ":memory:", {
  create: true,
});

export type User = {
  id: number;
  username: string;
  password: string;
  created_at: string;

  session_expires_at: string;
  session_csrf: string;
};

/* MIGRATIONS */
db.run("PRAGMA foreign_keys = ON;");

// users table
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`
);

// sessions table
// multiple sessions per user is ok
db.run(
  `CREATE TABLE IF NOT EXISTS sessions (
    id STRING PRIMARY KEY,
    csrf STRING NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users
  );`
);

db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title TEXT,
    content TEXT
)`);
/* END MIGRATIONS */
