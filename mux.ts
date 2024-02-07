type Handler = [
  method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE",
  pattern: string | RegExp,
  fn: (
    req: Request,
    params?: Record<string, any>
  ) => Response | Promise<Response>
];

// TODO: nested mux?
// TODO: MuxRequest? could be helpful to provide some useful responding capabilities
class Mux {
  handlers!: Handler[];

  constructor() {
    this.handlers = [];
  }

  get(pattern: Handler[1], fn: Handler[2]) {
    this.handlers.push(["GET", pattern, fn]);
    return this;
  }

  post(pattern: Handler[1], fn: Handler[2]) {
    this.handlers.push(["POST", pattern, fn]);
    return this;
  }

  patch(pattern: Handler[1], fn: Handler[2]) {
    this.handlers.push(["PATCH", pattern, fn]);
    return this;
  }

  delete(pattern: Handler[1], fn: Handler[2]) {
    this.handlers.push(["DELETE", pattern, fn]);
    return this;
  }

  put(pattern: Handler[1], fn: Handler[2]) {
    this.handlers.push(["PUT", pattern, fn]);
    return this;
  }

  handle(req: Request) {
    for (const handler of this.handlers) {
      if (req.method !== handler[0]) {
        continue;
      }
      const url = new URL(req.url);
      const match = url.pathname.match(handler[1]);

      if (!match) {
        continue;
      }
      return handler[2](req, match.groups);
    }

    return new Response("bad request", { status: 400 });
  }
}

export { Mux };
