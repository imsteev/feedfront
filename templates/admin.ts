import { escapeHTML } from ".";
import { Post } from "../db/posts";
import { User } from "../db/users";

export default {
  render({ user, csrf, posts }: { user: User; csrf: string; posts?: Post[] }) {
    return `
    <div class="header">
      <p style="text-transform: uppercase;">${escapeHTML(user.username)}</p>
    </div>
    <nav>
      <a href="#" hx-get="/logout">logout</a>
    </nav>
    <div class="main-content">
      <form
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
          <button type="submit">create</button>
        </div>
      </form>
      <div class="posts">
        ${
          posts
            ?.map(
              (p) => `
        <div class="post">
          ${p.title ? `<h3>${escapeHTML(p.title)}</h3>` : ""}
          ${escapeHTML(p.content)}
          <p class="date">${formatPostDate(p.updated_at)}</p>
        </div>`
            )
            ?.join("\n") || ""
        }
      </div>
    </div>
  `;
  },
  css: `
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
    justify-content: flex-end;
  }

  .posts > * {
    margin: 32px 0;
  }

  .post .date {
    color: gray;
    margin-top: 4px;
    font-size: 0.8em;
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
