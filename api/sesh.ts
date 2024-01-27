import { User, db } from "../db";
import session, { Session } from "../db/session";

const SIDKEY = "id";
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 1 day

function establishSession(userID: number): {
  cookie: string;
  csrf: string;
} {
  const sid = crypto.randomUUID();
  const csrf = crypto.randomUUID();
  session.createSession(
    sid,
    csrf,
    userID,
    Math.round(new Date().getTime() / 1000) + SESSION_MAX_AGE_SECONDS
  );
  return {
    cookie: `${SIDKEY}=${sid}; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    csrf: csrf ?? "",
  };
}

/**
 * This will fetch a user from a session, and only return the user if the
 * session is valid (i.e, session is not expired yet).
 * @param sid session id
 * @returns
 */
function accessUser(sid: string): User | null {
  const user = db
    .query<User, any>(
      `select users.*, sessions.expires_at as session_expires_at, sessions.csrf as session_csrf from users join sessions on sessions.user_id = users.id where sessions.id = $sid;`
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

export default {
  SIDKEY,
  establishSession,
  accessUser,
};
