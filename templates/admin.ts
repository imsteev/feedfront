import { escapeHTML } from ".";
import { Post } from "../db/posts";
import { User } from "../db/users";

export default {
  render({
    user,
    csrf,
    posts,
    post,
  }: {
    user: User;
    csrf: string;
    posts?: Post[];
    post?: Post | null;
  }) {
    return `
    <div class="header">
      <h2>trek</h2>
    </div>
    <nav>
      <a href="#" hx-get="/logout">logout</a>
    </nav>
    <div class="main-content">
      ${(posts && formMarkup(csrf)) || ""}
      <div class="posts">
        ${(posts && posts.map((p) => postMarkup(p)).join("\n")) || ""}
        ${(post && `${postMarkup(post)}${deletePostButton(post)}`) || ""}
      </div>
    </div>
  `;
  },
  css: `
  .header h2:hover {
    cursor: pointer;
  }


  .main-content {
    margin: 24px 0;
    width: min(100%, 60ch);
  }

  .playground > * {
    margin: 8px 0;
  }

  button[name="logout"] {
    color: #F464FF;
    border-color: #F464FF;
  }

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 24px 0 8px;
  }

  form .actions {
    justify-content: space-between;
  }

  .posts {
    margin-top: 32px;
  }
  .post {
    margin-top: 40px;
  }

  .post .date {
    color: gray;
    font-size: 0.9em;
    margin-top: 8px;
  }

  pre {
    white-space: pre-wrap;
  }

  .post.htmx-swapping {
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  label[for="content"] {
    color: lightgray;
    cursor: pointer;
  }

  input[name="title"] {
    border: 0;
    outline-width: 0;
  }

  textarea {
    margin: 6px 0;
    padding: 6px;
    resize: none;
    border-radius: 5px;
  }
  `,
  formatPostDate,
  postMarkup,
  deletePostButton,
};

function formatPostDate(datetime: string) {
  const date = new Date(datetime);

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const pm = m.toString().padStart(2, "0");
  const pd = d.toString().padStart(2, "0");

  return `${y}-${pm}-${pd}`;
}

function postMarkup(post: Post) {
  return `<div class="post">
<h2>${escapeHTML(post?.title)}</h2>
<pre>${escapeHTML(post?.content)}</pre>
<p class="date"><a href="/posts/${post.id}">${escapeHTML(
    formatPostDate(post?.updated_at ?? "")
  )}</a></p>
</div>`;
}

function deletePostButton(post: Post) {
  return `<button href="#"
  hx-delete="/posts/${post?.id}"
  hx-swap="swap:1s"
>
  delete
</button>`;
}

function formMarkup(csrf: string) {
  return `<form
  id="new-post"
  hx-post="/posts"
  hx-target=".posts"
  hx-swap="afterbegin"
  hx-on::after-request="this.reset()"
>
  <input type="hidden" name="csrf" value="${csrf}">
  <input type="text" name="title" placeholder="Title">
  <textarea name="content" rows="4"></textarea>
  <div class="actions">
    <div class="errors"></div>
    <button type="submit">create</button>
  </div>
</form>`;
}
