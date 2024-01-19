const makeSignupForm = () => {
  return `<form id="signup" hx-post="/signup">
  <div class="input-container">
    <label for="username">u</label>
    <input name="username" type="text" autocomplete="off" required />
  </div>
  <div class="input-container">
    <label for="password1">p1</label>
    <input name="password1" type="password" autocomplete="off" required />
  </div>
  <div class="input-container">
    <label for="password2">p2</label>
    <input name="password2" type="password" autocomplete="off" required />
  </div>
  <div class="errors"></div>
  <div class="actions">
    <button type="submit">Signup</button>
  </div>
  </form>`;
};

export default {
  makeSignupForm,
};
