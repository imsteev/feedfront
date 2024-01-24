import { escapeHTML } from ".";
import { User } from "../db";

export default {
  render(user: User) {
    return `<div id="admin-container">
      <h1>${escapeHTML(user.username)}</h1>
      <h2>Feedback</h2>
      <button hx-get="/logout">logout</button>
    </div>`;
  },
  css: `
  #admin-container {
    padding: 16px;
  }


  `,
};
