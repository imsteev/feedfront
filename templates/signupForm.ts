export default {
  html: `
  <div class="header">
    <p>signup</p>
  </div>
  <div class="form-container admin-form">
    <form id="signup" hx-post="/signup">
      <div class="input-container">
        <label for="username">user</label>
        <input name="username" type="text" autocomplete="off" required />
      </div>
      <div class="input-container">
        <label for="password1">password</label>
        <input name="password1" type="password" autocomplete="off" required />
      </div>
      <div class="input-container">
        <label for="password2">verify</label>
        <input name="password2" type="password" autocomplete="off" required />
      </div>
      <div class="errors"></div>
      <div class="actions">
        <button type="submit">Create account</button>
      </div>
    </form>
  </div>`,
  css: `
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  form .actions {
    justify-content: flex-end;
  }
  `,
};
