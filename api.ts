import loginForm from "./templates/loginForm";
import signupForm from "./templates/signupForm";
import { escapeHTML, page } from "./templates";

// CHANGEME: query something more durable
const users: Record<string, string> = {};

export const index = (req: Request) => {
  if (req.headers.get("cookie")) {
    return redirect(req, "/admin");
  }
  return new Response(page(loginForm), {
    headers: { "Content-Type": "text/html" },
  });
};

export const logout = (req: Request) => {
  const cookieless = redirect(req, "/");
  cookieless.headers.set("Set-Cookie", "username=; Max-Age=0");
  return cookieless;
};

export const admin = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (!cooki) {
    return redirect(req, "/");
  }
  const username = cooki.split("=")[1];
  if (!(username in users)) {
    const cookieless = redirect(req, "/");
    cookieless.headers.set("Set-Cookie", "username=; Max-Age=0");
    return cookieless;
  }
  return new Response(
    page({
      html: `<h1>Hello, ${escapeHTML(
        username
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
  resp.headers.set("Set-Cookie", `username=${username}`);
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
  if (`${form.get("username")}` in users) {
    return new Response("username already taken", {
      headers: {
        "HX-Retarget": "form .errors",
        "HX-Reswap": "innerHTML",
      },
    });
  }

  const hashed = await Bun.password.hash(pw1);
  users[username] = hashed;

  const resp = redirect(req, "/admin");
  resp.headers.set("Set-Cookie", `username=${username}`);
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
