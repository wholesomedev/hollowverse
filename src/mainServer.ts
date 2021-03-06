import * as express from 'express';
import * as httpProxy from 'http-proxy';

import { log } from './logger/logger';
import { logEndpoint } from './middleware/logEndpoint';
import { env } from './env';
import { redirectToHttps } from './middleware/redirectToHttps';
import { appServer } from './appServer';
import { securityMiddleware } from './middleware/security';
import { redirectionMap } from './redirectionMap';

const {
  // tslint:disable-next-line no-http-string
  OLD_SERVER_ADDRESS = 'http://dw5a6b9vjmt7w.cloudfront.net/',
  PORT = 8080,
} = process.env;

const server = express();

server.use(redirectToHttps);

server.use(...securityMiddleware);

// Add version details to custom header
server.use((_, res, next) => {
  res.setHeader(
    'X-Hollowverse-Actual-Environment',
    `${env.BRANCH}/${env.COMMIT_ID}`,
  );
  next();
});

const proxyServer = httpProxy.createProxyServer();

// Make sure all forwarded URLs end with / to avoid redirects
proxyServer.on('proxyReq', (proxyReq: any) => {
  if (
    !(proxyReq.path as string).endsWith('/') &&
    !(proxyReq.path as string).match(/\/.+\.[a-z]{2,4}$/gi)
  ) {
    proxyReq.path = `${proxyReq.path}/`;
  }
});

const newPaths = new Set(redirectionMap.values());

// Short-circuit the redirection proxy to expose the /log endpoint
server.use('/log', logEndpoint);

// As the proxy is placed in front of the old version, we need to allow
// requests to static assets to be directed to the new app.
// The new proxy will check if the request is for a static file, and redirect accordingly.
// Examples: /static/app.js, /static/vendor.js => new hollowverse
server.get('/static/*', appServer);

// Because ":/path" matches routes on both new and old servers, the new proxy also has
// to know the new app paths to avoid redirection loops.
server.get('/:path', (req, res, next) => {
  // '/:path' matches: /Tom_Hanks, /tom-hanks, /app.js, /michael-jackson, ashton-kutcher...
  const reqPath: string = req.params.path;

  log('PAGE_REQUESTED', { url: reqPath });

  const redirectionPath = redirectionMap.get(reqPath);
  if (redirectionPath !== undefined) {
    // /tom-hanks => redirect to Tom_Hanks
    res.redirect(`/${redirectionPath}`);
  } else if (newPaths.has(reqPath)) {
    // /Tom_Hanks => new hollowverse
    appServer(req, res, next);
  } else {
    // /michael-jackson, ashton-kutcher, / => old hollowverse
    next();
  }
});

// Fallback to old hollowverse
server.use((req, res) => {
  proxyServer.web(req, res, {
    target: OLD_SERVER_ADDRESS,
    changeOrigin: true,
  });
});

server.listen(PORT);
