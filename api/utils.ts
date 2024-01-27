import { page } from "../templates";

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

function expireCookie(req: Request, name: string): Response {
  const res = redirect(req, "/");
  res.headers.set("Set-Cookie", `${name}=; Max-Age=0`);
  return res;
}

export default {
  newPage,
  redirect,
  expireCookie,
};
