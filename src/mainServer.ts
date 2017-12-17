import * as express from 'express';

import { log } from './logger/logger';
import { logEndpoint } from './middleware/logEndpoint';
import { env } from './env';
import { redirectToHttps } from './middleware/redirectToHttps';
import { appServer } from './appServer';
import { securityMiddleware } from './middleware/security';

const { PORT = 8080 } = process.env;

const server = express();

server.use(redirectToHttps);

server.use(...securityMiddleware);

server.use((req, res, next) => {
  // Add version details to custom header
  log('PAGE_REQUESTED', { url: req.url });
  res.setHeader(
    'X-Hollowverse-Actual-Environment',
    `${env.BRANCH}/${env.COMMIT_ID}`,
  );
  next();
});

server.use('/log', logEndpoint);

server.use(appServer);

server.listen(PORT);
