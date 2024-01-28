import sessionMgr from "./sesh";
import { expireCookie, getCookie, html, redirect } from "./utils";

import { escapeHTML, page } from "../templates";
import adminView from "../templates/admin";
import loginForm from "../templates/loginForm";
import signupForm from "../templates/signupForm";

import { db } from "../db";
import posts from "../db/posts";
import users, { User } from "../db/users";

const HX_ERRORS_HEADERS = {
  "HX-Retarget": "form .errors",
  "HX-Reswap": "innerHTML",
};

export const index = (req: Request) => {
  const sid = getCookie(req, sessionMgr.SIDKEY);
  if (sid) {
    const user = sessionMgr.accessUser(sid);
    if (user) {
      return redirect(req, "/admin");
    }
  }
  return html(page(loginForm));
};

export const logout = (req: Request) => {
  return expireCookie(req, sessionMgr.SIDKEY);
};

export const admin = (req: Request) => {
  const sid = getCookie(req, sessionMgr.SIDKEY);
  if (!sid) {
    return expireCookie(req, sessionMgr.SIDKEY);
  }
  const user = sessionMgr.accessUser(sid);
  if (!user) {
    return expireCookie(req, sessionMgr.SIDKEY);
  }

  const ps = posts.getPosts(user.id);
  const res = html(
    page({
      html: adminView.render({ user, posts: ps, csrf: user.session_csrf }),
      css: adminView.css,
    })
  );

  // IMPORTANT: Set cache-control to ensure that clients don't use cached pages.
  res.headers.set("Cache-Control", "no-cache, no-store, max-age=0");

  return res;
};

export const createPost = async (req: Request) => {
  const sid = getCookie(req, sessionMgr.SIDKEY);
  if (!sid) {
    return expireCookie(req, sessionMgr.SIDKEY);
  }
  const user = sessionMgr.accessUser(sid);
  if (!user) {
    return expireCookie(req, sessionMgr.SIDKEY);
  }

  const form = await req.formData();
  const csrf = form.get("csrf")?.toString();
  const title = form.get("title")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";

  if (csrf !== user.session_csrf) {
    return new Response("invalid request", { headers: HX_ERRORS_HEADERS });
  }

  const post = posts.createPost(user.id, content, title);
  return new Response(`<div class="post">
    <h3>${escapeHTML(post?.title)}</h3>
    ${escapeHTML(post?.content)}
    <p class="date">${escapeHTML(
      adminView.formatPostDate(post?.updated_at ?? "")
    )}</p>
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
  const resp = redirect(req, "/admin");
  const session = sessionMgr.establishSession(user!.id);
  resp.headers.set("Set-Cookie", session.cookie);
  return resp;
};

export const signupPage = (_: Request) => html(page(signupForm));

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
      const resp = redirect(req, "/admin");
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
