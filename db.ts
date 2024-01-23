import { Database } from "bun:sqlite";

export const db = new Database(process.env.SQLITE_DB || ":memory:", {
  create: true,
});

// run migrations

db.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
).run();

//
db.query(
  `CREATE TABLE IF NOT EXISTS sessions (
    id STRING PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
).run();

export function createUser(username: string, hashedPw: string) {
  db.prepare(`INSERT INTO users (username, password) VALUES ($u, $p)`).run({
    $u: username,
    $p: hashedPw,
  });
}

export function getUserFromSession(sid: string) {
  const user = db
    .query(
      `select users.*, sessions.expires_at as session_expires_at, sessions.id as session_id from users join sessions on sessions.user_id = users.id where sessions.id = $sid;`
    )
    .get({
      $sid: sid,
    });
  return user as {
    id: number;
    username: string;
    created_at: string;
  };
}
