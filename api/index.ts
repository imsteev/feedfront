import loginForm from "../templates/loginForm";
import signupForm from "../templates/signupForm";
import { escapeHTML } from "../templates";

import utils from "./utils";
import sessionMgr from "./sesh";

import posts from "../db/posts";
import users from "../db/users";

import adminView from "../templates/admin";
import { User, db } from "../db";

const HX_ERRORS_HEADERS = {
  "HX-Retarget": "form .errors",
  "HX-Reswap": "innerHTML",
};

export const index = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (cooki) {
    const sid = cooki.split("=")[1];
    const user = sessionMgr.accessUser(sid);
    if (user) {
      return utils.redirect(req, "/admin");
    }
  }
  return utils.newPage(loginForm);
};

export const logout = (req: Request) => {
  return utils.expireCookie(req, sessionMgr.SIDKEY);
};

export const admin = (req: Request) => {
  const cooki = req.headers.get("cookie");
  if (!cooki) {
    return utils.redirect(req, "/");
  }
  const sid = cooki.split("=")[1];
  const user = sessionMgr.accessUser(sid);
  if (!user) {
    return utils.expireCookie(req, sessionMgr.SIDKEY);
  }

  const ps = posts.getPosts(user.id);
  const res = utils.newPage({
    html: adminView.render({ user, posts: ps, csrf: user.session_csrf }),
    css: adminView.css,
  });

  // IMPORTANT: Set cache-control to ensure that clients don't use cached pages.
  res.headers.set("Cache-Control", "no-cache, no-store, max-age=0");

  return res;
};

export const createPost = async (req: Request) => {
  const cooki = req.headers.get("cookie") ?? "";
  if (!cooki) {
    return utils.expireCookie(req, sessionMgr.SIDKEY);
  }

  const sid = cooki.split("=")[1];
  const user = sessionMgr.accessUser(sid);
  if (!user) {
    return utils.expireCookie(req, sessionMgr.SIDKEY);
  }

  const form = await req.formData();
  const csrf = form.get("csrf")?.toString();
  const title = form.get("title")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";

  if (csrf !== user.session_csrf) {
    return new Response("invalid request", { headers: HX_ERRORS_HEADERS });
  }

  posts.createPost(user.id, content, title);
  const ps = posts.getPosts(user.id);
  return new Response(`<div class="post">
    <h3>${escapeHTML(title)}</h3>
    ${escapeHTML(content)}
  </div>`);
};

export const login = async (req: Request) => {
  const form = await req.formData();
  const username = form.get("username")?.toString() || "";
  const inputPw = form.get("password")?.toString() || "";
  const user = await accessUser(username, inputPw);
  if (!user) {
    return new Response("authentication failed", {
      headers: HX_ERRORS_HEADERS,
    });
  }
  const resp = utils.redirect(req, "/admin");
  const session = sessionMgr.establishSession(user!.id);
  console.log({ session });
  resp.headers.set("Set-Cookie", session.cookie);
  return resp;
};

export const signupPage = (_: Request) => utils.newPage(signupForm);

export const signup = async (req: Request) => {
  const form = await req.formData();
  const pw1 = form.get("password1")?.toString() || "";
  const pw2 = form.get("password2")?.toString() || "";
  const username = form.get("username")?.toString() ?? "";

  function _validate(): string | true {
    if (pw1.length < 3) {
      return "password must be at least 3 characters long";
    }
    if (pw1 !== pw2) {
      return "passwords don't match";
    }
    return true;
  }

  const passedOrError = _validate();

  if (passedOrError !== true) {
    return new Response(passedOrError, {
      headers: HX_ERRORS_HEADERS,
    });
  }

  try {
    const user = await users.createUser(username, pw1);
    if (user) {
      const resp = utils.redirect(req, "/admin");
      const session = sessionMgr.establishSession(user!.id);
      resp.headers.set("Set-Cookie", session.cookie);
      return resp;
    }
  } catch (e) {
    console.log(`ERROR CREATING USER: ${e}`);
  }

  return new Response("authentication failed", {
    headers: HX_ERRORS_HEADERS,
  });
};

async function accessUser(
  username: string,
  plaintextPw: string
): Promise<User | null> {
  const user = db
    .query<User, any>(`SELECT * FROM users WHERE username = $u;`)
    .get({
      $u: username,
    });
  if (!user) {
    return null;
  }
  if (await Bun.password.verify(plaintextPw, user.password)) {
    return user;
  }
  return null;
}
