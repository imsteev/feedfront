import { Database } from "bun:sqlite";

export const db = new Database(":memory:");

// run migrations

db.query(
  `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
).run();

console.log("done");
