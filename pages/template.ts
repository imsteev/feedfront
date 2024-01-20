// TODO: escape variables
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
        /* reset */
        /*
    1. Use a more-intuitive box-sizing model.
  */
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        /*
    2. Remove default margin
  */
        * {
          margin: 0;
        }
        /*
    Typographic tweaks!
    3. Add accessible line-height
    4. Improve text rendering
  */
        body {
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }
        /*
    5. Improve media defaults
  */
        img,
        picture,
        video,
        canvas,
        svg {
          display: block;
          max-width: 100%;
        }
        /*
    6. Remove built-in form typography styles
  */
        input,
        button,
        textarea,
        select {
          font: inherit;
        }
        /*
    7. Avoid text overflows
  */
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          overflow-wrap: break-word;
        }
        /*
    8. Create a root stacking context
  */
        #root,
        #__next {
          isolation: isolate;
        }

        .page {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
