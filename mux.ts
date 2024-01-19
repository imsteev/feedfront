class Mux {
  handlers!: [
    method: string,
    pattern: string,
    fn: (res: Request) => Response | Promise<Response>
  ][];

  constructor(
    handlers: [
      method: string,
      pattern: string,
      fn: (res: Request) => Response | Promise<Response>
    ][]
  ) {
    this.handlers = handlers;
  }

  serve(req: Request) {
    for (const handler of this.handlers) {
      if (req.method !== handler[0]) {
        continue;
      }
      const url = new URL(req.url);
      if (!url.pathname.startsWith(handler[1])) {
        continue;
      }
      return handler[2](req);
    }

    return new Response("bad request");
  }
}

export { Mux };
