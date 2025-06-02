import { createId } from '@paralleldrive/cuid2';
import express from 'express';
import rateLimit from 'express-rate-limit';
import http from 'http';
import helmet from 'helmet';
import { PostHog } from 'posthog-node';
import { api } from './api/api-index';
import * as variables from './config/variables';
import { environment } from './config/environment';
import { notFound } from './views/errors/404';
import { iconsView } from './views/icons/icons';
import { posthog } from './config/variables';

const apiLimiter = rateLimit({
  windowMs: variables.rateLimit.windowMs,
  max: variables.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any, _res) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
});
const app = express();
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://us-assets.i.posthog.com',
      'https://us.i.posthog.com',
    ],
    connectSrc: ["'self'", 'https://us.i.posthog.com'],
  },
};

app.use((req, _res, next) => {
if (!posthog.publicKey) {
    console.warn('PostHog public key is not set. PostHog tracking will be disabled.');
    return next();
  }
  const client = new PostHog(variables.posthog.publicKey, {
    host: 'https://us.i.posthog.com',
  });

  client.capture({
    distinctId: createId(),
    event: '$server_event',
    properties: {
      $current_url: req.originalUrl,
      $referrer: req.headers.referer,
    },
  });

  client.shutdown();
  next();
});

app.use(environment);
app.use(helmet.contentSecurityPolicy(cspOptions));

app.use('/assets', express.static('public/assets'));
app.use(apiLimiter);
const server = new http.Server(app);
app.use('/api', api);
app.use('/icons', iconsView);
app.use(notFound);
app.set('port', variables.Server.httpPort || 3000);

server.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`);
});
