// NOTE: make sure to escape untrusted user inputs!
export function page(props: { html: string; css?: string }) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <script
        src="https://unpkg.com/htmx.org@1.9.10"
        integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
        crossorigin="anonymous"
      ></script>
      <style>
        /* CSS reset from Josh Comeau  */

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        * {
          margin: 0;
        }

        body {
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }

        img,
        picture,
        video,
        canvas,
        svg {
          display: block;
          max-width: 100%;
        }

        input,
        button,
        textarea,
        select {
          font: inherit;
        }

        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          overflow-wrap: break-word;
        }

        #root {
          isolation: isolate;
        }

        /* shareable styles */
        html {
          font-size: 1.1rem;
          padding: 2rem;
          font-family: Helvetica, sans-serif;
          margin: auto;
          width: 80%;
        }

        a, button {
          font-size: 0.8rem;
        }

        button {
          font-size: 0.9rem;
          background: #F0F5FE;
          cursor: pointer;
          color: #1761E8;
          border: solid 1px #4580ED;
        }

        button:hover {
          opacity: 0.9;
        }

        /* app-specific */
        .header {
          display: flex;
          width: min(100%, 80ch);
          padding: 1rem 0.25rem;
          justify-content: center;
        }

        html, input {
          color: #4D0011;
        }

        a {
          color: #627E8B;
        }

        input {
          padding: 2px;
        }

        input, textarea {
          border-color: #4B443C;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .form-container {
          padding: 16px 32px;
        }

        .form-container.admin-form {
          width: min(100%, 40ch);
        }

        form .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
        }

        form .errors {
          color: red;
        }
        ${props.css || ""}
      </style>
    </head>
    <body hx-boost="true">
      <main>
        <div class="page">
          ${props.html}
        </div>
      </main>
    </body>
  </html>`;
}

export function escapeHTML(s?: string): string {
  if (!s) return "";
  // https://owasp.deteact.com/cheat/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-1---html-escape-before-inserting-untrusted-data-into-html-element-content
  // & --> &amp;
  // < --> &lt;
  // > --> &gt;
  // " --> &quot;
  // ' --> &#x27;
  // / --> &#x2F;
  return s
    .replaceAll("&", "&amp")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("/", "&#x2F;");
}
