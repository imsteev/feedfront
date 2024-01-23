import loginForm from "./templates/loginForm";
import signupForm from "./templates/signupForm";
import { escapeHTML as xHTML, page } from "./templates";
import { createUser, db, getUserFromSession } from "./db";

// TODO: CSRF PROTECTION

const SESSION_KEY = "id";
const SESSION_MAX_AGE_SECONDS =
  1 /* day */ * 24 /* hours */ * 60 /* minutes */ * 60; /* seconds */

export const index = (req: Request) => {
  if (req.headers.get("cookie")) {
    return redirect(req, "/admin");
  }
  return new Response(page(loginForm), {
    headers: { "Content-Type": "text/html" },
  });
};

export const logout = (req: Request) => {
  return expireCookie(req);
};

export const admin = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (!cooki) {
    return redirect(req, "/");
  }
  const sid = cooki.split("=")[1];
  const user = getUserFromSession(sid);
  if (!user) {
    return expireCookie(req);
  }
  return new Response(
    page({
      html: `<h1>Hello, ${xHTML(
        user.username
      )}!</h1><p>Account created: ${xHTML(
        user.created_at
      )}</p><button hx-get="/logout">Logout</a>`,
    }),
    {
      headers: {
        // IMPORTANT: Set cache-control to ensure that clients don't
        // used cached pages after logging out.
        // TODO: middleware to generalize this to every authenticated page?
        "Cache-Control": "no-cache, no-store, max-age=0",
        "Content-Type": "text/html",
      },
    }
  );
};

export const login = async (req: Request) => {
  const form = await req.formData();
  const username = form.get("username")?.toString() || "";
  const inputPw = form.get("password")?.toString() || "";
  const user = await accessUser(username, inputPw);
  if (!user) {
    redirect(req, "/");
  }
  const resp = redirect(req, "/admin");
  resp.headers.set("Set-Cookie", `${newSessionCookie(user!.id)}`);
  return resp;
};

export const signupPage = (_: Request) =>
  new Response(page(signupForm), {
    headers: { "Content-Type": "text/html" },
  });

export const signup = async (req: Request) => {
  const form = await req.formData();
  const pw1 = form.get("password1")?.toString() || "";
  const pw2 = form.get("password2")?.toString() || "";
  const username = form.get("username")?.toString() ?? "";

  function validate(): string | true {
    if (pw1.length < 3) {
      return "password must be at least 3 characters long";
    }
    if (pw1 !== pw2) {
      return "passwords don't match";
    }
    return true;
  }

  const passedOrError = validate();
  const hxErrorsHeaders = {
    "HX-Retarget": "form .errors",
    "HX-Reswap": "innerHTML",
  };

  if (passedOrError !== true) {
    return new Response(passedOrError, {
      headers: hxErrorsHeaders,
    });
  }

  try {
    const hashed = await Bun.password.hash(pw1);
    createUser(username, hashed);
    const user = await accessUser(username, pw1);
    if (user) {
      const resp = redirect(req, "/admin");
      resp.headers.set("Set-Cookie", `${newSessionCookie(user.id)}`);
      return resp;
    }
  } catch (e) {
    console.log(`ERROR CREATING USER: ${e}`);
  }

  return new Response("authentication failed", {
    headers: hxErrorsHeaders,
  });
};

// response helpers

// HTMX-aware redirection. HTMX requests always have an identifying header
function redirect(req: Request, newLocation: string): Response {
  const isHtmx = req.headers.get("HX-Request") === "true";
  return new Response(null, {
    status: 302,
    headers: isHtmx
      ? { "HX-Redirect": newLocation }
      : { Location: newLocation },
  });
}

function expireCookie(req: Request): Response {
  const res = redirect(req, "/");
  res.headers.set("Set-Cookie", `${SESSION_KEY}=; Max-Age=0`);
  return res;
}

// db helpers
type user = { id: number; username: string; password: string };
async function accessUser(
  username: string,
  plaintextPw: string
): Promise<user | null> {
  const user = db
    .query<user, { $u: string }>(`SELECT * FROM users WHERE username = $u;`)
    .get({
      $u: username,
    });
  if (user && (await Bun.password.verify(plaintextPw, user.password))) {
    return user;
  }

  return null;
}

function newSessionCookie(userID: number): string {
  const sid = crypto.randomUUID();

  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($id, $userID, $expiresAt)
    ON CONFLICT(user_id)
    DO UPDATE SET id = excluded.id, expires_at = excluded.expires_at`
  ).run({
    $id: sid,
    $userID: userID,
    $expiresAt:
      Math.round(new Date().getTime() / 1000) + SESSION_MAX_AGE_SECONDS, // seconds since UTC epoch
  });

  return `${SESSION_KEY}=${sid}; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}
