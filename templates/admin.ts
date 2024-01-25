import { escapeHTML } from ".";
import { User } from "../db";

export default {
  render(user: User) {
    return `
    <div class="header">
      <p>home</p>
    </div>
    <nav>
      <button hx-get="/logout">logout</button>
    </nav>
    <div class="main-content">
      <p>hello, ${escapeHTML(user.username)}!</p>
    </div>
    <div>
    </div>
  `;
  },
  css: `
  .main-content {
    margin: 24px 0;
    width: min(100%, 60ch);
  }

  `,
};
