import { admin, index, login, logout, signup, signupPage } from "./api";
import { Mux } from "./mux";

export const createApp = () => {
  return new Mux()
    .get("/signup", signupPage)
    .post("/signup", signup)
    .post("/login", login)
    .get("/admin", admin)
    .get("/logout", logout)
    .get("/", index);
};
