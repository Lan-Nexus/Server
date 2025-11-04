const roles: Record<string, string[]> = {
  guest: [
    'games:list',
    'games:read',
    'games:keys:release',
    'games:keys:reserve',
    'users:read:by-client-id',
    'users:update:by-client-id',
    'users:create',
    'users:update',
    'users:read',
    'game-sessions:start',
    'game-sessions:stop',
    'game-sessions:read',
    'game-sessions:create',
    'game-sessions:update',
    'game-sessions:delete',
  ],
  user: [
    'games:list',
    'games:read',
    'games:keys:release',
    'games:keys:reserve',
    'users:read:by-client-id',
    'users:update:by-client-id',
    'users:create',
    'users:authenticate',
    'game-sessions:start',
    'game-sessions:stop',
    'game-sessions:read',
    'game-sessions:create',
    'game-sessions:update',
    'game-sessions:delete',
  ],
  admin: [
    'games:list',
    'games:create',
    'games:read',
    'games:update',
    'games:delete',
    'games:search:list',
    'games:search:read',
    'games:search:create',
    'games:search:search',
    'steam:list',
    'steam:read',
    'steam:create',
    'steam:update',
    'steam:delete',
    'games:keys:list',
    'games:keys:create',
    'games:keys:delete',
    'games:keys:release',
    'games:keys:reserve',
    'events:list',
    'events:read',
    'events:create',
    'events:update',
    'events:delete',
    'users:list',
    'users:read',
    'users:delete',
    'users:create',
    'users:update',
    'users:password:set',
    'users:password:set:by-client-id',
    'users:authenticate',
    'game-sessions:start',
    'game-sessions:stop',
    'game-sessions:read',
    'game-sessions:create',
    'game-sessions:update',
    'game-sessions:delete',
  ],
}

export default roles

export function hasPermission(user: any, permission: string | string[]): boolean {
  let rolePermissions: string[] | undefined;

  if (!user || !user.role) {
    rolePermissions = roles.guest;
  } else {
    rolePermissions = roles[user.role];
  }

  if (!rolePermissions) return false;

  // Handle single permission string
  if (typeof permission === 'string') {
    return rolePermissions.includes(permission);
  }

  // Handle array of permissions - user must have ALL permissions (AND logic)
  return permission.every(perm => rolePermissions!.includes(perm));
}

export function hasAnyPermission(user: any, permissions: string[]): boolean {
  let rolePermissions: string[] | undefined;

  if (!user || !user.role) {
    rolePermissions = roles.guest;
  } else {
    rolePermissions = roles[user.role];
  }

  if (!rolePermissions) return false;

  // Handle array of permissions - user needs ANY permission (OR logic)
  return permissions.some(perm => rolePermissions!.includes(perm));
}
