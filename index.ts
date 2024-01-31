import {
  signupPage,
  signup,
  login,
  admin,
  logout,
  index,
  createPost,
  deletePost,
} from "./api";
import { Mux } from "./mux";

const mux = new Mux()
  .get("/signup", signupPage)
  .post("/signup", signup)
  .post("/login", login)
  .post("/posts", createPost)
  .delete(/\/posts\/(?<id>\d+$)/, deletePost) // ideal: .delete("/posts/(id: )")
  .get("/admin", admin)
  .get("/logout", logout)
  .get("/", index);

const server = Bun.serve({
  async fetch(req) {
    console.log(`${req.method} ${req.url}`);
    return mux.handle(req);
  },
});

console.log(`listening at ${server.url}`);
