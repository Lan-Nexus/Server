import express from "express";
import { Request, Response } from "express";
import gamesController from "../Controllers/api/GamesApiController.js";
import gamesSearchController from "../Controllers/api/GameSearchApiController.js";
import steamController from "../Controllers/api/SteamApiController.js";
import GameKeyPageController from "../Controllers/api/GameKeyApiController.js";
import gameEventsController from "../Controllers/api/GameEventsApiController.js";
import UsersController from "../Controllers/api/UsersApiController.js";
import Router from "./Router.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { jwtAuth } from "../jwt.js";
import { hasPermission } from "../roles.js";

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Rate limiting middleware
const rateLimit = (req: Request, res: Response, next: express.NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";
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
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((limitData.resetTime - now) / 1000),
    });
  }

  // Increment counter
  limitData.count++;

  // Add rate limit headers
  res.set({
    "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": (
      RATE_LIMIT_MAX_REQUESTS - limitData.count
    ).toString(),
    "X-RateLimit-Reset": new Date(limitData.resetTime).toISOString(),
  });

  next();
};

const router = express.Router();
const authenticatedRouter = express.Router();
authenticatedRouter.use(jwtAuth as express.RequestHandler);

console.log(path.join(process.cwd(), "public", "games", "archives", "temp"));
const upload = multer({
  dest: path.join(process.cwd(), "public", "games", "temp"),
}); // for images

const fileUploadFields = [
  { name: "icon", maxCount: 1 },
  { name: "headerImage", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "imageCard", maxCount: 1 },
  { name: "heroImage", maxCount: 1 },
  { name: "archives", maxCount: 1 },
];

const archiveFields = [...fileUploadFields];

new Router<gamesController>({
  router: authenticatedRouter,
  controller: gamesController,
  prefix: "/games",
})
  .get({ handler: "list", permission: "games:list" })
  .get({ path: "/:id", handler: "read", permission: "games:read" })
  .post({
    handler: "create",
    middleware: upload.fields(archiveFields),
    permission: "games:create",
  })
  .put({
    path: "/:id",
    handler: "update",
    middleware: upload.fields(archiveFields),
    permission: "games:update",
  })
  .delete({ path: "/:id", handler: "delete", permission: "games:delete" });

new Router<gamesSearchController>({
  router: authenticatedRouter,
  controller: gamesSearchController,
})
  .get({
    path: "/games/search/:id",
    handler: "read",
    permission: "games:search:read",
  })
  .get({
    path: "/games/search",
    handler: "list",
    permission: "games:search:list",
  })
  .post({
    path: "/games/search",
    handler: "search",
    permission: "games:search:search",
  })
  .post({
    path: "/search/create",
    handler: "create",
    permission: "games:search:create",
  });

new Router<steamController>({
  router: authenticatedRouter,
  controller: steamController,
  prefix: "/steam",
})
  .get({ handler: "list", permission: "steam:list" })
  .get({ path: "/:id", handler: "read", permission: "steam:read" })
  .post({ handler: "create", permission: "steam:create" });

new Router<GameKeyPageController>({
  router: authenticatedRouter,
  controller: GameKeyPageController,
  prefix: "/games/:gameId/keys",
})
  .get({ handler: "list", permission: "games:keys:list" })
  .post({ handler: "create", permission: "games:keys:create" })
  .delete({ path: "/:id", handler: "delete", permission: "games:keys:delete" })
  .post({
    path: "/:id/release",
    handler: "release",
    permission: "games:keys:release",
  })
  .post({
    path: "/:id/reserve",
    handler: "reserve",
    permission: "games:keys:reserve",
  })
  .post({
    path: "/reserve",
    handler: "reserve",
    permission: "games:keys:reserve",
  });

new Router<UsersController>({
  router: authenticatedRouter,
  controller: UsersController,
  prefix: "/users",
})
  .get({ handler: "list", permission: "users:list" })
  .get({
    path: "/by-client-id/:clientId",
    handler: "findByClientId",
    permission: ["users:read","users:read:by-client-id"],
  })
  .get({ path: "/:id", handler: "read", permission: "users:read" })
  .post({ handler: "create", permission: "users:create" })
  .put({ path: "/:id", handler: "update", permission: "users:update" })
  .put({
    path: "/by-client-id/:clientId",
    handler: "updateByClientId",
    permission: ["users:update","users:read:by-client-id"],
  })
  .patch({
    path: "/client-id/:clientId",
    handler: "updateByClientId",
    permission: "users:update",
  })
  .patch({
    path: "/update-by-client-id/:clientId",
    handler: "updateByClientIdOnly",
    permission: ["users:update","users:update:by-client-id"],
  })
  .delete({ path: "/:id", handler: "delete", permission: "users:delete" });

new Router<gameEventsController>({
  router: router,
  controller: gameEventsController,
  prefix: "/events",
})
  .get({ handler: "list" })
  .get({ path: "/:id", handler: "read" });

new Router<gameEventsController>({
  router: authenticatedRouter,
  controller: gameEventsController,
  prefix: "/events",
})
  .post({ handler: "create", permission: "events:create" })
  .put({ path: "/:id", handler: "update", permission: "events:update" })
  .put({
    path: "/:id/status",
    handler: "updateStatus",
    permission: "events:update",
  })
  .delete({ path: "/:id", handler: "delete", permission: "events:delete" });

router.use(authenticatedRouter);

export default router;
