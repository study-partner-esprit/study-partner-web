// Permission definitions and utilities
export const PERMISSIONS = {
  // User management
  USER_CREATE: "user.create",
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  // Study management
  STUDY_CREATE: "study.create",
  STUDY_READ: "study.read",
  STUDY_UPDATE: "study.update",
  STUDY_DELETE: "study.delete",

  // Analytics
  ANALYTICS_READ: "analytics.read",

  // System admin
  SYSTEM_ADMIN: "system.admin",
};

// Role-based permission mappings
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.STUDY_CREATE,
    PERMISSIONS.STUDY_READ,
    PERMISSIONS.STUDY_UPDATE,
    PERMISSIONS.STUDY_DELETE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SYSTEM_ADMIN,
  ],
  teacher: [
    PERMISSIONS.STUDY_CREATE,
    PERMISSIONS.STUDY_READ,
    PERMISSIONS.STUDY_UPDATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  student: [
    PERMISSIONS.STUDY_READ,
    PERMISSIONS.STUDY_CREATE,
    PERMISSIONS.STUDY_UPDATE,
    PERMISSIONS.USER_READ,
  ],
};

// Permission checking utilities
export const checkPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const checkAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions || permissions.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some((permission) => userPermissions.includes(permission));
};

export const checkAllPermissions = (userRole, permissions) => {
  if (!userRole || !permissions || permissions.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

// Resource-based permission checking
export const canAccessResource = (userRole, resource, action = "read") => {
  return checkPermission(userRole, `${resource}.${action}`);
};

// Common permission checks
export const canManageUsers = (userRole) => {
  return checkAnyPermission(userRole, [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
  ]);
};

export const canViewAnalytics = (userRole) => {
  return checkPermission(userRole, PERMISSIONS.ANALYTICS_READ);
};

export const canManageStudyContent = (userRole) => {
  return checkAnyPermission(userRole, [
    PERMISSIONS.STUDY_CREATE,
    PERMISSIONS.STUDY_UPDATE,
    PERMISSIONS.STUDY_DELETE,
  ]);
};

export const isAdmin = (userRole) => {
  return userRole === "admin";
};

export const isTeacher = (userRole) => {
  return userRole === "teacher";
};

export const isStudent = (userRole) => {
  return userRole === "student";
};
