export const loginFormHTML = `<div class="form-container">
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
    <button>Login</button>
    <a href="/signup">New user?</a
    >
  </div>
</form>
</div>`;

export const loginFormCSS = `.form-container {
  padding: 16px 32px;
  border-radius: 5px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

form .actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

form .errors {
  color: red;
}`;
