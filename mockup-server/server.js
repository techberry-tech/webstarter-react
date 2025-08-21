import { serve } from '@hono/node-server';
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
  const app = new Hono()
  app.use(logger())
  // Public routes
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
  app.all('*', (c) => {
    const path = c.req.path
    /**
     * @type {ServiceConfig | undefined}
     */
    const service = config.services[path]
    if (service == null) {
      return c.json({ error: "Not Found" }, 404)
    }

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
 * @typedef {Object} ServiceConfig
 * @property {string} name - The name of the service
 * @property {string} description - A brief description of the service
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
 * @typedef {Object} Config
 * @property {string} baseURI - The base URI for the API
 * @property {Array<User>} users - The list of users for authentication
 * @property {Object<string, ServiceConfig>} services - The services available in the API
 */