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
  /**
   * @type {Config}
   */
  const config = await loadJSON('config.json');
  const openAPI = await loadJSON('openapi.json')
  if (config.openapi) {
    openAPI.tags.unshift({ name: "Authentication", description: "You must authentication before access other APIs" })
    openAPI.paths = { ...config.openapi.paths, ...openAPI.paths, }
  }
  const app = new Hono()
  app.use(logger())
  // Public routes
  app.get('/openapi-json', (c) => {
    return c.json(openAPI)
  })
  app.get('/openapi', Scalar({
    url: '/openapi-json',
    hiddenClients: true,
    hideClientButton: true,
    hideDownloadButton: true,
    expandAllResponses: true,
    defaultOpenAllTags: true,
  }))
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
    const prefer = c.req.header('Prefer')
    let preferStatus = "200";
    let preferContentType = "application/json"
    if (prefer) {
      const statusMatch = prefer.match(/status=(\d+)/)
      if (statusMatch) {
        preferStatus = statusMatch[1]
      }

      const contentTypeMatch = prefer.match(/type=(\w+)/)
      if (contentTypeMatch) {
        preferContentType = contentTypeMatch[1]
      }
    }

    const service = openAPI.paths[path]?.[method.toLowerCase()]
    if (service == null) {
      return c.json({ error: "Not Found" }, 404)
    }

    await new Promise(resolve => setTimeout(resolve,
      Math.floor(Math.random() * (config.responseTime.max - config.responseTime.min + 1)) + config.responseTime.min)
    ) // Simulate random delay

    const returnStatus = parseInt(preferStatus, 10)
    return c.json(service.responses?.[preferStatus]?.content?.[preferContentType]?.example || {}, isNaN(returnStatus) ? 503 : returnStatus)

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
 * @template T
 * @param {string} fileName - The name of the configuration file
 * @returns {Promise<T>} - Returns a promise that resolves to the configuration object
 */
async function loadJSON(fileName) {
  try {
    const rawConfig = await readFile(path.join(import.meta.dirname, fileName), 'utf-8');
    return JSON.parse(rawConfig);
  } catch (error) {
    throw new Error('Failed to load configuration: ' + String(error));
  }
}


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
 * @property {any} openapi - The OpenAPI specification
 */