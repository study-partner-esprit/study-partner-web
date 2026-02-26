import { useAuthStore } from "../store/authStore";

// Component that renders children only if user has required permission
export const PermissionGuard = ({
  permission,
  permissions,
  fallback = null,
  children,
}) => {
  const { user, hasPermission, hasAnyRole } = useAuthStore();

  if (!user) return fallback;

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Check multiple permissions (any of them)
  if (permissions && permissions.length > 0 && !hasAnyRole(permissions)) {
    return fallback;
  }

  return children;
};

// Component that renders children only if user has required role
export const RoleGuard = ({ roles, fallback = null, children }) => {
  const { hasAnyRole } = useAuthStore();

  if (!hasAnyRole(roles)) {
    return fallback;
  }

  return children;
};

// Hook for permission checking in components
export const usePermissions = () => {
  const { user, hasPermission, hasRole, hasAnyRole } = useAuthStore();

  return {
    user,
    hasPermission: (permission) => hasPermission(permission),
    hasRole: (role) => hasRole(role),
    hasAnyRole: (roles) => hasAnyRole(roles),
    canAccess: (resource, action) => hasPermission(`${resource}.${action}`),
    isAdmin: () => hasRole("admin"),
    isTeacher: () => hasRole("teacher"),
    isStudent: () => hasRole("student"),
  };
};
