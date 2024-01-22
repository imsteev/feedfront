import loginForm from "./templates/loginForm";
import signupForm from "./templates/signupForm";
import { escapeHTML, page } from "./templates";
import { db } from "./db";

// CHANGEME
const users: Record<string, string> = {};
const session: Record<string, string> = {}; // ID -> username

const SESSION_KEY = "id";

export const index = (req: Request) => {
  if (req.headers.get("cookie")) {
    return redirect(req, "/admin");
  }
  return new Response(page(loginForm), {
    headers: { "Content-Type": "text/html" },
  });
};

export const logout = (req: Request) => {
  return expireCookie(redirect(req, "/"));
};

export const admin = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (!cooki) {
    return redirect(req, "/");
  }
  const seshID = cooki.split("=")[1];
  if (!(seshID in session)) {
    return expireCookie(redirect(req, "/"));
  }

  return new Response(
    page({
      html: `<h1>Hello, ${escapeHTML(
        session[seshID]
      )}!</h1><button hx-get="/logout">Logout</a>`,
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

  // make sure user exists
  const username = form.get("username")?.toString() || "";
  if (!(username in users)) {
    return new Response("user doesn't exist", {
      headers: {
        "HX-Retarget": "form .errors",
        "HX-Reswap": "innerHTML",
      },
    });
  }

  // verify password
  const inputPw = form.get("password")?.toString() || "";
  const actualPw = users[username];
  if (!(await Bun.password.verify(inputPw, actualPw))) {
    return new Response("incorrect password", {
      headers: {
        "HX-Retarget": "form .errors",
        "HX-Reswap": "innerHTML",
      },
    });
  }

  const resp = redirect(req, "/admin");
  resp.headers.set("Set-Cookie", `${newSessionCookie(username)}`);
  return resp;
};

export const signupPage = () =>
  new Response(page(signupForm), {
    headers: { "Content-Type": "text/html" },
  });

export const signup = async (req: Request) => {
  const form = await req.formData();
  const pw1 = form.get("password1")?.toString() || "";
  const pw2 = form.get("password2")?.toString() || "";
  if (pw1.length < 3) {
    return new Response("password must be at least 3 characters long", {
      headers: {
        "HX-Retarget": "form .errors",
        "HX-Reswap": "innerHTML",
      },
    });
  }
  if (pw1 !== pw2) {
    return new Response("passwords don't match", {
      headers: {
        "HX-Retarget": "form .errors",
        "HX-Reswap": "innerHTML",
      },
    });
  }

  const username = `${form.get("username")}`;

  const hashed = await Bun.password.hash(pw1);
  db.prepare(`INSERT INTO users (username, password) VALUES ($u, $p)`).run({
    $u: username,
    $p: pw1,
  });

  users[username] = hashed;

  const resp = redirect(req, "/admin");
  resp.headers.set("Set-Cookie", `${newSessionCookie(username)}`);
  return resp;
};

// If the request is HTMX-aware, this will set the HX-Redirect header.
// Otherwise sets the standard Location header.
function redirect(req: Request, newLocation: string) {
  const isHtmx = req.headers.get("HX-Request") === "true";
  return new Response(null, {
    status: 302,
    headers: isHtmx
      ? { "HX-Redirect": newLocation }
      : { Location: newLocation },
  });
}

function expireCookie(res: Response): Response {
  res.headers.set("Set-Cookie", `${SESSION_KEY}=; Max-Age=0`);
  return res;
}

function newSessionCookie(username: string): string {
  const id = crypto.randomUUID();
  session[id] = username;
  return `${SESSION_KEY}=${id}; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`;
}
