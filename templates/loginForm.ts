export default {
  html: `
  <div class="header">
    <h1>trek</<h1>
  </div>
  <div class="form-container admin-form">
    <form id="login-form" hx-post="/login">
      <div class="input-container">
        <label for="username">user</label>
        <input name="username" type="text" autocomplete="off" required />
      </div>
      <div class="input-container">
        <label for="password">password</label>
        <input
          name="password"
          type="password"
          autocomplete="off"
          required
        />
      </div>
      <div class="errors"></div>
      <div class="actions">
        <a href="/signup">New user?</a>
        <button>Login</button>
      </div>
    </form>
  </div>`,
  css: `
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }`,
};
