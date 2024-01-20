import { createApp } from "./app";

const mux = createApp();
const server = Bun.serve({
  async fetch(req) {
    console.log(`${req.method} ${req.url}`);
    return mux.serve(req);
  },
});

console.log(`listening at ${server.url}`);

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
 * 2. From docs(https://htmx.org/docs/#history):
 *   NOTE: If you push a URL into the history, you must be able to navigate to
 *   that URL and get a full page back! A user could copy and paste the URL into
 *   an email, or new tab. Additionally, htmx will need the entire page when
 *   restoring history if the page is not in the history cache.
 *
 * 3. This is kind of hilarious, about "Cache-Control: no-cache"
 *
 *   Note that no-cache does not mean "don't cache". no-cache allows caches to
 *   store a response but requires them to revalidate it before reuse. If the
 *   sense of "don't cache" that you want is actually "don't store", then
 *   no-store is the directive to use.
 */
