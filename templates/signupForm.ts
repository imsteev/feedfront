const html = `<div class="form-container">
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
    <button type="submit">Signup</button>
  </div>
  </form>
  </div>`;

const css = `
    .form-container {
      margin-top: 24px;
      width: min(100%, 60ch);
      padding: 16px 32px;
    }

    .input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    form .actions {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    form .errors {
      color: red;
    }`;

export default { html, css };
