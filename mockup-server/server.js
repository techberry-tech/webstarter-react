import { serve } from '@hono/node-server';
import { Scalar } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { logger } from 'hono/logger';
import { jwtVerify, SignJWT } from 'jose';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const mockJWTSecret = 'mock-secret-key'
const cookieName = 'wst-runtime-session'

async function startServer() {
  const config = await loadConfig();
  const openAPI = convertToOpenAPI(config.services);
  const app = new Hono()
  app.use(logger())
  // Public routes
  app.get('/open-api-converted-raw', (c) => {
    return c.json(openAPI)
  })
  app.get('/docs', Scalar({ url: '/open-api-converted-raw', hiddenClients: true, hideClientButton: true, hideDownloadButton: true }))
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
 * @param {string} fileName - The name of the configuration file
 * @returns {Promise<Config>} - Returns a promise that resolves to the configuration object
 */
async function loadConfig(fileName = 'config.json') {
  try {
    const rawConfig = await readFile(path.join(import.meta.dirname, fileName), 'utf-8');
    return JSON.parse(rawConfig);
  } catch (error) {
    throw new Error('Failed to load configuration: ' + String(error));
  }
}

/**
 * Convert the original config object to an OpenAPI 3.1 JSON with inline examples.
 * @param {ServiceConfig} config - Your original config object.
 * @returns {any} OpenAPI JSON object.
 */
function convertToOpenAPI(config) {
  const paths = {};

  for (const [path, svc] of Object.entries(config || {})) {
    const method = (svc.method || "POST").toLowerCase();
    const mediaType = svc.request?.content_type || "application/json";

    // request example: default to {}
    const requestExample =
      svc.request && svc.request.body && "content" in svc.request.body
        ? svc.request.body.content
        : {};

    // response status + example
    const status = String(svc.response?.status || 200);
    const responseExample = svc.response?.body ?? {};

    // build operation
    const operation = {
      summary: svc.description || svc.name || "",
      requestBody: {
        required: true,
        content: {
          [mediaType]: {
            // IMPORTANT for Scalar to render: provide a schema
            schema: { type: "object" },
            example: requestExample
          }
        }
      },
      responses: {
        [status]: {
          description: `${svc.name || "Response"}`,
          content: {
            [mediaType]: {
              // IMPORTANT for Scalar to render: provide a schema
              schema: { type: "object" },
              // Named example tends to surface better in some UIs
              examples: {
                success: { value: responseExample }
              }
            }
          }
        }
      }
    };

    // attach to paths
    if (!paths[path]) paths[path] = {};
    paths[path][method] = operation;
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Project Services API",
      version: "1.0.0"
    },
    servers: [{ url: "/" }],
    paths
  };
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