import { db } from ".";

export type Session = {
  id: string;
  csrf: string;
  user_id: number;
  expires_at: string;
};

export default {
  createSession(
    sid: string,
    csrf: string,
    userID: number,
    expiresAt: number | string // should be UTC
  ) {
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
        $expiresAt: expiresAt,
      });
  },
  deleteStaleSessions() {
    db.run(`DELETE FROM sessions WHERE expires_at < strftime('%s', 'now')`);
  },
};

// Math.round(new Date().getTime() / 1000) + SESSION_MAX_AGE_SECONDS, // seconds since UTC epoch
