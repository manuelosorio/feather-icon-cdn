import express from 'express';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { api } from './api/api-index';
import * as variables from './config/variables';
import { environment } from './config/environment';
import { notFound } from './views/errors/404';
import { iconsView } from './views/icons/icons';

const apiLimiter = rateLimit({
  windowMs: variables.rateLimit.windowMs,
  max: variables.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any , _res) => {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress
  }
});
const app = express();
app.use(environment);
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
