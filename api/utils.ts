import { page } from "../templates";

// response helpers
export function html(
  body: ConstructorParameters<typeof Response>[0]
): Response {
  return new Response(body, {
    headers: { "Content-Type": "text/html" },
  });
}

// HTMX-aware redirection. HTMX requests always have an identifying header
export function redirect(req: Request, newLocation: string): Response {
  const isHtmx = req.headers.get("HX-Request") === "true";
  return new Response(null, {
    status: 302,
    headers: isHtmx
      ? { "HX-Redirect": newLocation }
      : { Location: newLocation },
  });
}

export function expireCookie(req: Request, name: string): Response {
  const res = redirect(req, "/");
  res.headers.set("Set-Cookie", `${name}=; Max-Age=0`);
  return res;
}

export function getCookie(req: Request, key: string): string | null {
  const cooki = req.headers.get("cookie") ?? "";
  console.log(cooki, req.url);
  const kvs = cooki.split(";");
  console.log({ kvs });
  for (const kv of kvs) {
    const [k, v] = kv.trim().split("=");
    if (k === key) {
      return v;
    }
  }
  return null;
}
