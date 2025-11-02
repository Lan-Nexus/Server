import { Router as ExpressRouter } from 'express';
import { PageController } from '../Controllers/PageController.js';
import { jwtAuth } from '../jwt.js';
import roles, { hasPermission, hasAnyPermission } from '../roles.js';
import { Request, Response } from 'express';

// Extract method names from controller that match the expected signature
type ExtractMethods<T> = {
  [K in keyof T]: T[K] extends (req: Request, res: Response) => any ? K : never;
}[keyof T];

// Dynamic handler types based on the controller
type ControllerMethods<T extends PageController> = ExtractMethods<T> & string;

// Permission type - can be a single permission or array of permissions (OR logic)
type Permission = string | string[];

// Permission options for routes
type PermissionOptions = {
  require?: Permission;  // AND logic - user must have ALL permissions
  requireAny?: string[]; // OR logic - user needs ANY of these permissions (same as array Permission)
};

export const info: Router<any>[] = [];

export default class Router<T extends PageController> {
  #router: ExpressRouter;
  #objects: Record<string, T>;
  _permissions: Record<string, Permission | PermissionOptions>;
  // -  permission: "users:read"` - needs that specific permission
  // - `permission: ["users:read", "users:admin"]` - needs ANY of those permissions (OR logic)
  // - `permissions: { require: ["users:read", "users:admin"] }` - needs ALL permissions (AND logic)
  // - `permissions: { requireAny: ["users:read", "users:admin"] }` - needs ANY permissions (OR logic, same as array)
  routes: { method: string; path: string, name: string }[];
  #prefix: string;
  #controller: new () => T;

  constructor(options: {
    router: ExpressRouter;
    controller: new () => T;
    prefix?: string;
  }) {
    this.#router = options.router;
    this.#controller = options.controller;
    this.#prefix = options.prefix || '';
    this.#objects = {};
    this._permissions = {};
    this.routes = [];

    info.push(this);
  }

  #makeOrFindObject(ObjectClass: new () => T) {
    if (!(ObjectClass.prototype instanceof PageController)) {
      throw new Error(`ObjectClass must be a subclass of ResourceController or PageController`);
    }

    const objName = ObjectClass?.name;

    if (!this.#objects[objName]) {
      this.#objects[objName] = new ObjectClass() as T;
    }

    return this.#objects[objName];
  }

  #getObject() {
    return this.#makeOrFindObject(this.#controller);
  }

  #getFullPath(path: string): string {
    return this.#prefix + path;
  }

  /**
   * Creates a generic handler for all HTTP methods, with permission check.
   */
  #makeHandler(obj: T, requestHandler: string) {
    return (req: any, res: any) => {
      const permissions = this._permissions?.[requestHandler];
      console.log(`Checking permissions for ${requestHandler} on ${req.method} ${req.path}`);

      if (permissions) {
        let hasAccess = false;

        if (typeof permissions === 'string') {
          // Single permission check
          hasAccess = hasPermission(req.user, permissions);
        } else if (Array.isArray(permissions)) {
          // Array permission check (OR logic)
          hasAccess = hasAnyPermission(req.user, permissions);
        } else if (permissions.require) {
          // AND logic - user must have ALL permissions
          hasAccess = hasPermission(req.user, permissions.require);
        } else if (permissions.requireAny) {
          // OR logic - user needs ANY of these permissions
          hasAccess = hasAnyPermission(req.user, permissions.requireAny);
        }

        if (!hasAccess) {
          const response: any = { error: 'Forbidden' };

          // Add debugging information in development mode
          if (process.env.NODE_ENV !== 'production') {
            let requiredPermissions: string[] = [];
            let userPermissions: string[] = [];

            // Get required permissions
            if (typeof permissions === 'string') {
              requiredPermissions = [permissions];
            } else if (Array.isArray(permissions)) {
              requiredPermissions = permissions;
            } else if (permissions.require) {
              if (typeof permissions.require === 'string') {
                requiredPermissions = [permissions.require];
              } else {
                requiredPermissions = permissions.require;
              }
            } else if (permissions.requireAny) {
              requiredPermissions = permissions.requireAny;
            }

            // Get user permissions
            if (req.user && req.user.role) {
              const rolePermissions = roles[req.user.role];
              if (rolePermissions) {
                userPermissions = rolePermissions;
              }
            } else {
              const guestPermissions = roles.guest;
              if (guestPermissions) {
                userPermissions = guestPermissions;
              }
            }

            response.debug = {
              needPermissions: requiredPermissions,
              userPermissions: userPermissions,
              userRole: req.user?.role || 'guest'
            };
          }

          return res.status(403).json(response);
        }
      }

      console.log(`Handling ${req.method} request for ${req.path} with handler ${requestHandler}`);
      // @ts-ignore
      obj[requestHandler](req, res);
    };
  }

  public get(options: {
    path?: string;
    handler: ControllerMethods<T>;
    middleware?: any;
    permission?: Permission;
    permissions?: PermissionOptions;
  }) {
    const obj = this.#getObject();
    const fullPath = this.#getFullPath(options.path || '');

    if (options.permission) {
      this._permissions[options.handler] = options.permission;
    } else if (options.permissions) {
      this._permissions[options.handler] = options.permissions;
    }

    const handler = this.#makeHandler(obj, options.handler);
    if (options.middleware) {
      this.#router.get(fullPath, options.middleware, handler);
    } else {
      this.#router.get(fullPath, handler);
    }
    this.routes.push({ method: 'GET', path: fullPath, name: options.handler });
    return this;
  }

  public post(options: {
    path?: string;
    handler: ControllerMethods<T>;
    middleware?: any;
    permission?: Permission;
    permissions?: PermissionOptions;
  }) {
    const obj = this.#getObject();
    const fullPath = this.#getFullPath(options.path || '');

    if (options.permission) {
      this._permissions[options.handler] = options.permission;
    } else if (options.permissions) {
      this._permissions[options.handler] = options.permissions;
    }

    const handler = this.#makeHandler(obj, options.handler);
    if (options.middleware) {
      this.#router.post(fullPath, options.middleware, handler);
    } else {
      this.#router.post(fullPath, handler);
    }
    this.routes.push({ method: 'POST', path: fullPath, name: options.handler });
    return this;
  }

  public put(options: {
    path?: string;
    handler: ControllerMethods<T>;
    middleware?: any;
    permission?: Permission;
    permissions?: PermissionOptions;
  }) {
    const obj = this.#getObject();
    const fullPath = this.#getFullPath(options.path || '');

    if (options.permission) {
      this._permissions[options.handler] = options.permission;
    } else if (options.permissions) {
      this._permissions[options.handler] = options.permissions;
    }

    const handler = this.#makeHandler(obj, options.handler);
    if (options.middleware) {
      this.#router.put(fullPath, options.middleware, handler);
    } else {
      this.#router.put(fullPath, handler);
    }
    this.routes.push({ method: 'PUT', path: fullPath, name: options.handler });
    return this;
  }

  public delete(options: {
    path?: string;
    handler: ControllerMethods<T>;
    middleware?: any;
    permission?: Permission;
    permissions?: PermissionOptions;
  }) {
    const obj = this.#getObject();
    const fullPath = this.#getFullPath(options.path || '');

    if (options.permission) {
      this._permissions[options.handler] = options.permission;
    } else if (options.permissions) {
      this._permissions[options.handler] = options.permissions;
    }

    const handler = this.#makeHandler(obj, options.handler);
    if (options.middleware) {
      this.#router.delete(fullPath, options.middleware, handler);
    } else {
      this.#router.delete(fullPath, handler);
    }
    this.routes.push({ method: 'DELETE', path: fullPath, name: options.handler });
    return this;
  }

  public patch(options: {
    path?: string;
    handler: ControllerMethods<T>;
    middleware?: any;
    permission?: Permission;
    permissions?: PermissionOptions;
  }) {
    const obj = this.#getObject();
    const fullPath = this.#getFullPath(options.path || '');

    if (options.permission) {
      this._permissions[options.handler] = options.permission;
    } else if (options.permissions) {
      this._permissions[options.handler] = options.permissions;
    }

    const handler = this.#makeHandler(obj, options.handler);
    if (options.middleware) {
      this.#router.patch(fullPath, options.middleware, handler);
    } else {
      this.#router.patch(fullPath, handler);
    }
    this.routes.push({ method: 'PATCH', path: fullPath, name: options.handler });
    return this;
  }

  public addMiddleware(path: string, middleware: any) {
    this.#router.use(path, middleware);
    return this;
  }

  public Permissions(permissions: Record<string, string>) {
    this._permissions = permissions;
    return this;
  }
}
