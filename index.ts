import {
  signupPage,
  signup,
  login,
  admin,
  logout,
  index,
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "./api";
import { Mux } from "./mux";
import session from "./db/session";

function main() {
  setTimeout(() => session.deleteStaleSessions());

  const mux = new Mux()
    .get("/signup", signupPage)
    .post("/signup", signup)
    .post("/login", login)
    .post("/posts", createPost)
    .put(`/posts/(?<id>\\d+$)`, updatePost)
    .get(`/posts/(?<id>\\d+$)`, getPost) // ideal: .delete("/posts/(id: )")
    .delete(`/posts/(?<id>\\d+$)`, deletePost) // ideal: .delete("/posts/(id: )")
    .get("/admin", admin)
    .get("/logout", logout)
    .get("/", index);

  const server = Bun.serve({
    async fetch(req) {
      return mux.handle(req);
    },
  });
  console.log(`listening at ${server.url}`);
}

main();
