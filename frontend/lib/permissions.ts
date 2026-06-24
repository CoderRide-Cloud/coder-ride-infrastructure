import { User, Permission, CustomRole, UserRole } from "./types";

export function calculateUserPosition(user: User): number {
  // ADMIN always has highest position
  if (user.role === "ADMIN") {
    const position = 999;
    return position;
  }

  // SUSPENDED and PENDING users have lowest positions
  if (user.role === "SUSPENDED" || user.role === "PENDING") {
    const position = -1;
    return position;
  }

  // For MEMBER users with custom roles
  if (user.customRole && user.customRole.position !== undefined) {
    return user.customRole.position;
  }

  // Regular MEMBER
  return 0;
}

export function canManageUser(currentUser: User, targetUser: User): boolean {
  // Users cannot manage themselves (except for certain actions)
  if (currentUser.id === targetUser.id) {
    return false;
  }

  // ADMIN can manage anyone
  if (currentUser.role === "ADMIN") {
    return true;
  }

  // Non-ADMIN users cannot manage ADMIN users
  if (targetUser.role === "ADMIN") {
    return false;
  }

  const currentPosition = calculateUserPosition(currentUser);
  const targetPosition = calculateUserPosition(targetUser);

  const result = targetPosition < currentPosition;
  return result;
}

export function canAssignRole(
  currentUser: User,
  targetUser: User,
  newRole?: UserRole
): boolean {
  // Only ADMINS can assign ADMIN role
  if (newRole === "ADMIN" && currentUser.role !== "ADMIN") {
    return false;
  }

  // ADMINS can assign any role to anyone
  if (currentUser.role === "ADMIN") {
    return true;
  }

  // For other roles, check if user can manage the target user AND has MANAGE_MEMBERS permission
  return (
    hasPermission(currentUser, Permission.MANAGE_MEMBERS) &&
    canManageUser(currentUser, targetUser)
  );
}

// Basic role assignment check (for showing the button)
export function canAssignRoleBasic(
  currentUser: User,
  targetUser: User
): boolean {
  return canAssignRole(currentUser, targetUser);
}

// Check if user can assign custom roles specifically
export function canAssignCustomRole(
  currentUser: User,
  targetUser: User
): boolean {
  // ADMINS can assign custom roles to anyone
  if (currentUser.role === "ADMIN") {
    return true;
  }

  // Users with MANAGE_MEMBERS can assign custom roles to users they can manage
  return (
    hasPermission(currentUser, Permission.MANAGE_MEMBERS) &&
    canManageUser(currentUser, targetUser)
  );
}

export function hasPermission(user: User, permission: Permission): boolean {
  // ADMIN has all permissions
  if (user.role === "ADMIN") {
    return true;
  }

  // SUSPENDED and PENDING users have no permissions
  if (user.role === "SUSPENDED" || user.role === "PENDING") {
    return false;
  }

  // MEMBER with custom role
  if (user.role === "MEMBER" && user.customRole) {
    return user.customRole.permissions.includes(permission);
  }

  // Regular MEMBER has no admin permissions
  return false;
}

export function hasAnyPermission(
  user: User,
  permissions: Permission[]
): boolean {
  // ADMIN has all permissions
  if (user.role === "ADMIN") {
    return true;
  }

  // SUSPENDED and PENDING users have no permissions
  if (user.role === "SUSPENDED" || user.role === "PENDING") {
    return false;
  }

  // MEMBER with custom role
  if (user.role === "MEMBER" && user.customRole) {
    return permissions.some((permission) =>
      user.customRole!.permissions.includes(permission)
    );
  }

  // Regular MEMBER has no admin permissions
  return false;
}

// New function to check if user can manage a specific custom role
export function canManageCustomRole(
  currentUser: User,
  targetRole: CustomRole
): boolean {
  const currentPosition = calculateUserPosition(currentUser);

  if (currentUser.role === "ADMIN") {
    return true;
  }

  return targetRole.position < currentPosition;
}

// Check if user can reorder roles
export function canReorderRoles(currentUser: User): boolean {
  const userPosition = calculateUserPosition(currentUser);
  // Allow anyone except suspended/pending users to reorder roles they can manage
  return userPosition > -1;
}
