import express from 'express';
import gamesController from '../Controllers/api/GamesApiController.js';
import gamesSearchController from '../Controllers/api/GameSearchApiController.js';
import steamController from '../Controllers/api/SteamApiController.js';
import GameKeyPageController from '../Controllers/api/GameKeyApiController.js';
import gameEventsController from '../Controllers/api/GameEventsApiController.js';
import Router from './Router.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { jwtAuth } from '../jwt.js';
import { hasPermission } from '../roles.js';

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

// Public events endpoints (no auth required)
const gameEventsControllerInstance = new gameEventsController();
router.get('/events', (req, res) => gameEventsControllerInstance.list(req, res));
router.get('/events/:id', (req, res) => gameEventsControllerInstance.read(req, res));

// Protected events endpoints (auth required)
new Router<gameEventsController>(authenticatedRouter)
  .Permissions({
    create: 'events:create',
    update: 'events:update',
    delete: 'events:delete'
  })
  .post('/events', gameEventsController, 'create')
  .put('/events/:id', gameEventsController, 'update')
  .delete('/events/:id', gameEventsController, 'delete')

// Mount the authenticated router
router.use(authenticatedRouter);

export default router;
