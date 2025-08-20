import { readFile } from 'fs/promises';
import http from 'http';
import path from 'path';

async function startServer() {

  const config = await loadConfig();

  console.log(`Loaded configuration successfully ${Object.keys(config.services).length} service(s)`);

  const server = http.createServer((req, res) => {
    try {
      console.log(`Received request: ${req.method} ${req.url}`);
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Default authentication apis
      if (req.url === path.posix.join(config.baseURI, '/api/auth/login') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { username, password } = JSON.parse(body);
            if (username === 'user' && password === '1234') {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': 'wst-runtime-session=mockSessionId; HttpOnly; Path=/; Max-Age=86400'
              });
              res.end(JSON.stringify({ message: "Logged in successfully", access_token: "mockAccessToken" }));
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: "Invalid username or password" }));
            }
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Invalid request body" }));
          }
        });
        return;
      } else if (req.url === path.posix.join(config.baseURI, '/api/auth/logout') && req.method === 'POST') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': 'wst-runtime-session=; HttpOnly; Path=/; Max-Age=0'
        });
        // Clear the mockup cookie session
        res.end(JSON.stringify({ message: "Logged out successfully" }));
        return;
      } else if (req.url === path.posix.join(config.baseURI, '/api/auth/status') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Return a mockup session object
        res.end(JSON.stringify({
          "user": {
            "fullName": "Mock User",
            "role": "user",
            "username": "mockuser"
          }
        }));
        return;
      }
      // Here you would handle the request based on the config
      /**
       * @type {ServiceConfig} - The service configuration object
       */
      const sv = config.services[req.url];
      if (sv) {
        // Simulate a service response based on the configuration
        res.writeHead(sv.response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sv.response.body));
        return;
      } else {
        // If the service is not found, return a 404 error
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service not found' }));
        return;
      }
    } catch (error) {
      console.error('Error handling request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });

  const PORT = 3001;

  server.listen(PORT, () => {
    console.log(`Mock API server running at http://localhost:${PORT}`);
  });
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

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

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
 * @typedef {Object} Config
 * @property {string} baseURI - The base URI for the API
 * @property {Object<string, ServiceConfig>} services - The services available in the API
 */