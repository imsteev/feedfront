import signup from "./fragments/signup";
import { Mux } from "./mux";

const users: Record<string, string> = {};

const server = Bun.serve({
  async fetch(req, res) {
    const mux = new Mux([
      [
        "GET",
        "/signup",
        (req: Request) => new Response(signup.makeSignupForm()),
      ],
      [
        "POST",
        "/signup",
        async (req: Request) => {
          const form = await req.formData();
          const pw1 = form.get("password1");
          const pw2 = form.get("password2");
          if (pw1 !== pw2) {
            return new Response("passwords don't match", {
              headers: {
                "HX-Retarget": "form .errors",
                "HX-Reswap": "innerHTML",
              },
            });
          }

          const name = `${form.get("username")}`;
          if (`${form.get("username")}` in users) {
            return new Response("username already taken", {
              headers: { "HX-Retarget": "form .errors" },
            });
          }

          users[name] = `${pw1}`;

          return new Response("successfully logged in", {
            headers: { "HX-Location": "/admin", "Set-Cookie": `name=${name}` },
          });
        },
      ],
      ["GET", "/admin", () => new Response(Bun.file("./pages/admin.html"))],
      ["GET", "/", () => new Response(Bun.file("./pages/index.html"))],
    ]);

    return mux.serve(req);
  },
});

console.log(`listening at ${server.url}`);
