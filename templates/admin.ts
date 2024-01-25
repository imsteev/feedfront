import { escapeHTML } from ".";
import { User } from "../db";

export default {
  render(user: User) {
    return `
    <div class="header">
      <p>home</p>
    </div>
    <nav>
      <button name="logout" hx-get="/logout">logout</button>
    </nav>
    <div class="main-content">
      <p>hello, ${escapeHTML(user.username)}!</p>
      <p>this is your space</p>
      <div class="playground">
        <button type="button">project 1</button>
        <button type="button">project 2</button>
        <button type="button">project 3</button>
        <button type="button">project 4</button>
        <button type="button">project 5</button>
        <img src="https://ih1.redbubble.net/image.2611729366.9977/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg" alt="frog-drawing"/>
      </div>
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


  .playground > * {
    margin: 8px 0;
  }

  button[name="logout"] {
    color: #F464FF;
    border-color: #F464FF;
  }


  `,
};
