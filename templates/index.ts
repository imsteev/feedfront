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

        .page {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        ${props.css || ""}
      </style>
    </head>
    <body>
      <main>
        <div class="page">
          ${props.html}
        </div>
      </main>
    </body>
  </html>`;
}

export function escapeHTML(s: string): string {
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
