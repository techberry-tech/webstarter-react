import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { html, raw } from 'hono/html';
import { logger } from 'hono/logger';
import { jwtVerify, SignJWT } from 'jose';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const mockJWTSecret = 'mock-secret-key'
const cookieName = 'wst-runtime-session'

async function startServer() {
  const config = await loadConfig();
  const app = new Hono()
  app.use(logger())
  // Public routes
  app.get('/docs', (c) => {
    return c.html(renderDocs(config))
  })
  app.post('/api/auth/login', async (c) => {
    const { username, password, return_token_in_response } = await c.req.json()
    const user = config.users.find(u => u.username === username && u.password === password)
    if (user) {
      const token = await createJWT({ username: user.username, full_name: user.fullName, role: user.role })
      if (return_token_in_response) {
        return c.json({ message: "Login successful", access_token: token })
      }
      // Set token to cookie
      setCookie(c, cookieName, token, { httpOnly: true, maxAge: 60 * 60 * 24 })
      return c.json({ message: "Login successful" })
    }
    return c.json({ error: "Invalid username or password" }, 401)
  })
  // Protected routes
  app.use(async (c, next) => {
    const authCookie = getCookie(c, cookieName)
    const authHeader = c.req.header('Authorization')
    const token = authCookie ? authCookie : authHeader?.split(' ')[1]
    if (token == null) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    try {
      const user = await jwtVerify(token, new TextEncoder().encode(mockJWTSecret))
      if (user == null) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      c.user = user
      return next()
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 401)
    }
  })
  app.get('/api/auth/status', (c) => {
    return c.json({
      user: {
        username: c.user?.payload?.username,
        fullName: c.user?.payload?.full_name,
        role: c.user?.payload?.role
      }
    })
  })
  app.post('/api/auth/logout', (c) => {
    deleteCookie(c, cookieName)
    return c.json({ message: "Logout successful" })
  })

  // Dynamic routes here
  app.all('*', async (c) => {
    const path = c.req.path
    const method = c.req.method
    /**
     * @type {ServiceConfig | undefined}
     */
    const service = config.services[path]
    if (service == null) {
      return c.json({ error: "Not Found" }, 404)
    }

    if (service.method.toUpperCase() !== method) {
      return c.json({ error: "Method Not Allowed" }, 405)
    }

    await new Promise(resolve => setTimeout(resolve,
      Math.floor(Math.random() * (config.responseTime.max - config.responseTime.min + 1)) + config.responseTime.min)
    ) // Simulate random delay

    return c.json(service.response.body, service.response.status)
  })

  const server = serve({
    fetch: app.fetch,
    port: 3001,
    hostname: 'localhost',
  })

  // graceful shutdown
  process.on('SIGINT', () => {
    server.close()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      process.exit(0)
    })
  })
}

startServer();

async function createJWT(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(new TextEncoder().encode(mockJWTSecret));
  return token;
}

/**
 * Loads the API configuration from the config.json file.
 * @returns {Promise<Config>} - Returns a promise that resolves to the configuration object
 */
async function loadConfig() {
  try {
    const rawConfig = await readFile(path.join(import.meta.dirname, 'config.json'), 'utf-8');
    return JSON.parse(rawConfig);
  } catch (error) {
    throw new Error('Failed to load configuration: ' + String(error));
  }
}

/**
 * Renders the API documentation.
 * @param {Config} config
 * @returns {string}
 */
function renderDocs(config) {
  return html`
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Documentation</title>
    <style>
      /* Simplified color scheme forced to light mode */
      :root {
        --bg: #fcfcfd;
        --panel: #ffffff;
        --muted: #667085;
        --fg: #0b1220;
        --ink: #111827;
        --brand: #3566ff;
        --border: #e5e7eb;
        --accent: #0ea5e9;

        --c-get: #39d353;
        --c-post: #2f81f7;
        --c-put: #d29922;
        --c-patch: #a371f7;
        --c-delete: #f85149;

        --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        --sans: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial;
      }

      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        color: var(--fg);
        background: var(--bg);
        font-family: var(--sans);
        line-height: 1.6;
      }

      .layout {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 1rem;
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }
      /* Make left and right sections scroll independently */
      aside.nav {
        height: calc(100vh - 100px);
        overflow-y: auto;
        position: sticky;
        top: 1rem;
      }
      main.doc {
        height: calc(100vh - 100px);
        overflow-y: auto;
      }
      html {
        scroll-behavior: smooth;
      }
      header.top {
        grid-column: 1 / -1;
      }
      header h1 {
        padding: 0;
        margin: 0;
      }

      aside.nav {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.75rem;
      }
      .nav h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: var(--muted);
      }
      .nav a {
        display: block;
        padding: 0.3rem 0.5rem;
        border-radius: 6px;
        color: var(--fg);
      }
      .nav a:hover {
        background: #f5f5f5;
      }

      main.doc {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .panel {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1rem;
        background: var(--panel);
      }

      .endpoint {
        border: 1px solid var(--border);
        border-radius: 8px;
      }
      .endpoint summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--border);
        background-color: white;

        position: sticky;
        top: 0px;
        z-index: 10;
      }
      .endpoint summary .title {
        font-weight: bold;
        font-size: 16px;
      }
      .endpoint summary::-webkit-details-marker {
        display: none;
      }

      .endpoint.get summary {
        border-left: 4px solid var(--c-get);
      }
      .endpoint.post summary {
        border-left: 4px solid var(--c-post);
      }
      .endpoint.put summary {
        border-left: 4px solid var(--c-put);
      }
      .endpoint.patch summary {
        border-left: 4px solid var(--c-patch);
      }
      .endpoint.delete summary {
        border-left: 4px solid var(--c-delete);
      }

      .badge {
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        font-weight: 600;
        color: #fff;
      }
      .method {
        border: none;
      }

      .get {
        background: var(--c-get);
      }
      .post {
        background: var(--c-post);
      }
      .put {
        background: var(--c-put);
      }
      .patch {
        background: var(--c-patch);
      }
      .delete {
        background: var(--c-delete);
      }

      .path {
        font-family: var(--mono);
        font-size: 0.8rem;
        background-color: #f5f6f7;
        padding: 0.2rem 0.3rem;
        border-radius: 8px;
      }
      .ep-body {
        padding: 0.75rem;
        display: grid;
        gap: 1rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }
      th,
      td {
        text-align: left;
        padding: 0.4rem;
        border-bottom: 1px solid var(--border);
      }
      th {
        color: var(--muted);
        font-weight: 600;
      }

      pre {
        margin: 0;
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: #f5f5f5;
        color: #111;
        max-height: 300px;
        overflow: auto;
      }

      h4 { margin: 0px; }

      @media (max-width: 960px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      /* Toast container */
      .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: #fff;
        padding: 8px 14px;
        border-radius: 4px;
        font-size: 14px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 9999;
      }

      /* Visible state */
      .toast.show {
        opacity: 1;
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <header class="top">
        <h1>API Documentation</h1>
      </header>

      <aside class="nav">
        <h3>API List</h3>
        <nav>
          ${raw(Object.values(config.services).map((service) => {
    return `<a href="#${service.name}" class="nav-link">${service.name}</a>`;
  }).join("\n"))}
        </nav>
      </aside>

      <main class="doc">
        ${raw(Object.entries(config.services).map(([path, service]) => {
    return `<section id="${service.name}" class="endpoint">
            <summary>
            <span class="badge method ${service.method.toLowerCase()}">${service.method}</span>
              <div class="title">${service.name}</div>
              <span class="path" data-path="${path}">${path}</span>
            </summary>
            <div class="ep-body">
              <h4>Request Body</h4>
              <pre><code>${JSON.stringify(service.request?.body ?? {}, null, 2)}</code></pre>
              <h4>Response Body</h4>
              <pre><code>${JSON.stringify(service.response.body, null, 2)}</code></pre>
            </div>
          </details>
        </section>`
  }).join("\n"))}

      </main>
    </div>
    <script>
      // Smooth scroll the right section when clicking left nav
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href").slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            // Scroll only the right section
            const docPanel = document.querySelector("main.doc");
            const top = target.offsetTop - docPanel.offsetTop;
            docPanel.scrollTo({ top, behavior: "smooth" });
          }
        });
      });
    </script>

    <script>
      let toastEl, hideTimer;

      function showToast(message, duration = 2000) {
        // Create element if not exists
        if (!toastEl) {
          toastEl = document.createElement("div");
          toastEl.className = "toast";
          document.body.appendChild(toastEl);
        }

        // Update message
        toastEl.textContent = message;
        toastEl.classList.add("show");

        // Reset hide timer
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          toastEl.classList.remove("show");
        }, duration);
      }
      // Wait until DOM is fully loaded
      document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".path").forEach((el) => {
          el.addEventListener("click", () => {
            const textToCopy = el.getAttribute("data-path");
            navigator.clipboard.writeText(textToCopy)
              .then(() => {
                // Optional: feedback to user
                showToast("Copied to clipboard: " + textToCopy);
              })
              .catch((err) => console.error("Copy failed:", err));
          });
        });
      });
    </script>
  </body>
</html>

  `
}


/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - The name of the service
 * @property {string} description - A brief description of the service
 * @property {string} method - The HTTP method used by the service (e.g., GET, POST)
 * @property {ResponseConfig} response
 */

/**
 * @typedef {Object} ResponseConfig
 * @property {number} status - The HTTP status code for the response
 * @property {Object<string, any>} body - The body of the response, typically in JSON format
 */

/**
 * @typedef {Object} User
 * @property {string} username - The username of the user
 * @property {string} password - The password of the user
 * @property {string} fullName - The full name of the user
 * @property {string} role - The role of the user
 */

/**
 * @typedef {Object} ResponseTime
 * @property {number} min - The minimum response time in ms
 * @property {number} max - The maximum response time in ms
 */

/**
 * @typedef {Object} Config
 * @property {ResponseTime} responseTime - The response time for the API
 * @property {string} baseURI - The base URI for the API
 * @property {Array<User>} users - The list of users for authentication
 * @property {Object<string, ServiceConfig>} services - The services available in the API
 */