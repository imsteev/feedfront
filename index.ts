import { page } from "./pages/template";
import { signupFormHTML, signupFormCSS } from "./pages/signup";
import { loginFormHTML, loginFormCSS } from "./pages/login";
import { Mux } from "./mux";

const users: Record<string, string> = {};
const mux = new Mux()
  .get(
    "/signup",
    () =>
      new Response(page({ html: signupFormHTML, css: signupFormCSS }), {
        headers: { "Content-Type": "text/html" },
      })
  )
  .post("/signup", async (req) => {
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
  })
  .post("/login", async (req) => {
    const form = await req.formData();
    const username = form.get("username")?.toString() || "";
    const pw = form.get("password")?.toString() || "";
    if (!(username in users)) {
      return new Response("user doesn't exist", {
        headers: {
          "HX-Retarget": "form .errors",
          "HX-Reswap": "innerHTML",
        },
      });
    }

    if (!(await Bun.password.verify(pw, users[username]))) {
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
  })
  .get("/admin", (req) => {
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
        html: `<h1>Hello, ${username}!</h1>
        <a href="/logout">logout</a>`,
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  })
  .get("/logout", (req) => {
    const cookieless = redirect(req, "/");
    cookieless.headers.set("Set-Cookie", "username=; Max-Age=0");
    return cookieless;
  })
  .get("/", (req) => {
    if (req.headers.get("cookie")) {
      return redirect(req, "/admin");
    }

    return new Response(page({ html: loginFormHTML, css: loginFormCSS }), {
      headers: { "Content-Type": "text/html" },
    });
  });

const server = Bun.serve({
  async fetch(req) {
    console.log(`${req.method} ${req.url}`);
    return mux.serve(req);
  },
});

console.log(`listening at ${server.url}`);

function redirect(req: Request, newLocation: string) {
  const isHtmx = req.headers.get("HX-Request") === "true";
  return new Response(null, {
    status: 302,
    headers: isHtmx
      ? { "HX-Redirect": newLocation }
      : { Location: newLocation },
  });
}

/** LEARNINGS
 *
 * 1. There are situations where you need to handle behavior based on
 * whether or not the request is an HTMX request. For example, redirections
 * through HTMX requires "HX-Redirect". Things could get weird if HTMX redirect-
 * and native redirect- headers are included at the same time.
 *
 * <form action="/login" method="post">
 *
 * <form hx-post"/login">
 *
 */
