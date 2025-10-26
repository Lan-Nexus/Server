import express from 'express';
import { Request, Response } from 'express';
import gamesController from '../Controllers/api/GamesApiController.js';
import gamesSearchController from '../Controllers/api/GameSearchApiController.js';
import steamController from '../Controllers/api/SteamApiController.js';
import GameKeyPageController from '../Controllers/api/GameKeyApiController.js';
import gameEventsController from '../Controllers/api/GameEventsApiController.js';
import UsersController from '../Controllers/api/UsersApiController.js';
import Router from './Router.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { jwtAuth } from '../jwt.js';
import { hasPermission } from '../roles.js';

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Rate limiting middleware
const rateLimit = (req: Request, res: Response, next: express.NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean up expired entries
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }

  // Get or create rate limit data for this IP
  let limitData = rateLimitStore.get(clientIp);
  if (!limitData || now > limitData.resetTime) {
    limitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(clientIp, limitData);
  }

  // Check if limit exceeded
  if (limitData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
    });
  }

  // Increment counter
  limitData.count++;

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': (RATE_LIMIT_MAX_REQUESTS - limitData.count).toString(),
    'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString()
  });

  next();
};

const router = express.Router();
const authenticatedRouter = express.Router();
authenticatedRouter.use(jwtAuth as express.RequestHandler);

console.log(path.join(process.cwd(), 'public', 'games', 'archives', 'temp'));
const upload = multer({ dest: path.join(process.cwd(), 'public', 'games', 'temp') }); // for images

const fileUploadFields = [
  { name: 'icon', maxCount: 1 },
  { name: 'headerImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'imageCard', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'archives', maxCount: 1 }
];

const archiveFields = [
  ...fileUploadFields,
];


new Router<gamesController>(authenticatedRouter)
  .Permissions({
    list: 'games:list',
    read: 'games:read',
    create: 'games:create',
    update: 'games:update',
    delete: 'games:delete'
  })
  .get('/games', gamesController, 'list')
  .get('/games/:id', gamesController, 'read')
  .post('/games', gamesController, 'create', upload.fields(archiveFields))
  .put('/games/:id', gamesController, 'update', upload.fields(archiveFields))
  .delete('/games/:id', gamesController, 'delete')

new Router<gamesSearchController>(authenticatedRouter)
  .Permissions({
    list: 'games:search:list',
    read: 'games:search:read',
    create: 'games:search:create',
    search: 'games:search:search'
  })
  .get('/games/search/:id', gamesSearchController, 'read')
  .get('/games/search', gamesSearchController, 'list')
  .post('/games/search', gamesSearchController, 'search')
  .post('/search/create', gamesSearchController, 'create')

new Router<steamController>(authenticatedRouter)
  .Permissions({
    list: 'steam:list',
    read: 'steam:read',
    create: 'steam:create'
  })
  .get('/steam', steamController, 'list')
  .get('/steam/:id', steamController, 'read')
  .post('/steam', steamController, 'create')

new Router<GameKeyPageController>(authenticatedRouter)
  .Permissions({
    list: 'games:keys:list',
    create: 'games:keys:create',
    delete: 'games:keys:delete',
    release: 'games:keys:release',
    reserve: 'games:keys:reserve'
  })
  .get('/games/:gameId/keys', GameKeyPageController, 'list')
  .post('/games/:gameId/keys', GameKeyPageController, 'create')
  .delete('/games/:gameId/keys/:id', GameKeyPageController, 'delete')
  .post('/games/:gameId/keys/:id/release', GameKeyPageController, 'release')
  .post('/games/:gameId/keys/:id/reserve', GameKeyPageController, 'reserve')
  .post('/games/:gameId/keys/reserve', GameKeyPageController, 'reserve')

new Router<UsersController>(authenticatedRouter)
  .Permissions({
    list: 'users:list',
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
    findByClientId: 'users:read',
    updateByClientId: 'users:update',
    updateByClientIdOnly: 'users:update'
  })
  .get('/users', UsersController, 'list')
  .get('/users/by-client-id/:clientId', UsersController, 'findByClientId')
  .get('/users/:id', UsersController, 'read')
  .post('/users', UsersController, 'create')
  .put('/users/:id', UsersController, 'update')
  .put('/users/by-client-id/:clientId', UsersController, 'updateByClientId')
  .patch('/users/client-id/:clientId', UsersController, 'updateByClientId')
  .patch('/users/update-by-client-id/:clientId', UsersController, 'updateByClientIdOnly')
  .delete('/users/:id', UsersController, 'delete')





// Public events endpoints (no auth required)
new Router<gameEventsController>(router)
  .get('/events', gameEventsController, 'list')
  .get('/events/:id', gameEventsController, 'read');

// Protected events endpoints (auth required)
new Router<gameEventsController>(authenticatedRouter)
  .Permissions({
    create: 'events:create',
    update: 'events:update',
    delete: 'events:delete',
    updateStatus: 'events:update'
  })
  .post('/events', gameEventsController, 'create')
  .put('/events/:id', gameEventsController, 'update')
  .put('/events/:id/status', gameEventsController, 'updateStatus')
  .delete('/events/:id', gameEventsController, 'delete')

// Mount the authenticated router
router.use(authenticatedRouter);

export default router;
