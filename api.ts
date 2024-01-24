import loginForm from "./templates/loginForm";
import signupForm from "./templates/signupForm";
import { escapeHTML as xHTML, page } from "./templates";
import {
  SESSION_MAX_AGE_SECONDS,
  accessUser,
  createUser,
  accessUserFromSession,
  newSession,
} from "./db";

const SESSION_KEY = "id";

const HX_ERRORS_HEADERS = {
  "HX-Retarget": "form .errors",
  "HX-Reswap": "innerHTML",
};

export const index = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (cooki) {
    const sid = cooki.split("=")[1];
    const user = accessUserFromSession(sid);
    if (user) {
      return redirect(req, "/admin");
    }
  }
  return newPage(loginForm);
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
  const user = accessUserFromSession(sid);
  if (!user) {
    return expireCookie(req);
  }

  const res = newPage({
    html: `<h1>Hello, ${xHTML(user.username)}!</h1><p>Account created: ${xHTML(
      user.created_at
    )}</p><button hx-get="/logout">Logout</a>`,
  });

  // IMPORTANT: Set cache-control to ensure that clients don't use cached pages.
  res.headers.set("Cache-Control", "no-cache, no-store, max-age=0");

  return res;
};

export const login = async (req: Request) => {
  const form = await req.formData();
  const username = form.get("username")?.toString() || "";
  const inputPw = form.get("password")?.toString() || "";
  const user = await accessUser(username, inputPw);
  if (!user) {
    return new Response("authentication failed", {
      headers: HX_ERRORS_HEADERS,
    });
  }
  const resp = redirect(req, "/admin");
  const session = establishSession(user!.id);
  console.log({ session });
  resp.headers.set("Set-Cookie", session.cookie);
  return resp;
};

export const signupPage = (_: Request) => newPage(signupForm);

export const signup = async (req: Request) => {
  const form = await req.formData();
  const pw1 = form.get("password1")?.toString() || "";
  const pw2 = form.get("password2")?.toString() || "";
  const username = form.get("username")?.toString() ?? "";

  function _validate(): string | true {
    if (pw1.length < 3) {
      return "password must be at least 3 characters long";
    }
    if (pw1 !== pw2) {
      return "passwords don't match";
    }
    return true;
  }

  const passedOrError = _validate();

  if (passedOrError !== true) {
    return new Response(passedOrError, {
      headers: HX_ERRORS_HEADERS,
    });
  }

  try {
    const user = await createUser(username, pw1);
    if (user) {
      const resp = redirect(req, "/admin");
      const session = establishSession(user!.id);
      resp.headers.set("Set-Cookie", session.cookie);
      return resp;
    }
  } catch (e) {
    console.log(`ERROR CREATING USER: ${e}`);
  }

  return new Response("authentication failed", {
    headers: HX_ERRORS_HEADERS,
  });
};

// response helpers
function newPage(content: { html: string; css?: string }): Response {
  return new Response(page(content), {
    headers: { "Content-Type": "text/html" },
  });
}

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

function establishSession(userID: number): {
  cookie: string;
  csrf: string;
} {
  const session = newSession(userID);
  return {
    cookie: `${SESSION_KEY}=${session?.id}; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    csrf: session?.csrf ?? "",
  };
}
