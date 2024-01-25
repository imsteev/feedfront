import { Database } from "bun:sqlite";

// 1 day
export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

export const db = new Database(process.env.SQLITE_DB || ":memory:", {
  create: true,
});

export type User = {
  id: number;
  username: string;
  password: string;
  created_at: string;

  session_expires_at: string;
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
/* END MIGRATIONS */

export async function createUser(
  username: string,
  plaintextPw: string
): Promise<User | null> {
  const hashed = await Bun.password.hash(plaintextPw);
  return db
    .prepare<User, any>(
      `INSERT INTO users (username, password) VALUES ($u, $p) RETURNING *`
    )
    .get({
      $u: username,
      $p: hashed,
    });
}

/**
 * This will fetch a user from a session, and only return the user if the
 * session is valid (i.e, session is not expired yet).
 * @param sid session id
 * @returns
 */
export function accessUserFromSession(sid: string): User | null {
  const user = db
    .query<User, any>(
      `select users.*, sessions.expires_at as session_expires_at, sessions.id as session_id from users join sessions on sessions.user_id = users.id where sessions.id = $sid;`
    )
    .get({
      $sid: sid,
    });

  if (
    user &&
    new Date(parseInt(user.session_expires_at) * 1000).getTime() <
      new Date().getTime()
  ) {
    console.log("user session expired");
    db.prepare(`delete from users where id = $id`).run({ $id: user.id });
    return null;
  }

  return user;
}

export async function accessUser(
  username: string,
  plaintextPw: string
): Promise<User | null> {
  const user = db
    .query<User, any>(`SELECT * FROM users WHERE username = $u;`)
    .get({
      $u: username,
    });
  if (!user) {
    return null;
  }
  if (await Bun.password.verify(plaintextPw, user.password)) {
    return user;
  }
  return null;
}

type Session = {
  id: string;
  csrf: string;
  user_id: number;
  expires_at: string;
};

export function newSession(userID: number): Session | null {
  const sid = crypto.randomUUID();
  const csrf = crypto.randomUUID();
  return db
    .prepare<Session, any>(
      `
    INSERT INTO sessions (id, csrf, user_id, expires_at)
    VALUES ($id, $csrf, $userID, $expiresAt)
    RETURNING *;
  `
    )
    .get({
      $id: sid,
      $csrf: csrf,
      $userID: userID,
      $expiresAt:
        Math.round(new Date().getTime() / 1000) + SESSION_MAX_AGE_SECONDS, // seconds since UTC epoch
    });
}
