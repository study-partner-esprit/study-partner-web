import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PrivateRoute = ({
  children,
  requireAdmin = false,
  requireStudent = false,
}) => {
  const { isAuthenticated, token, sessionExpiry, user } = useAuthStore();

  // Consider session valid if persisted token exists and hasn't expired yet.
  const now = Date.now();
  const persistedSessionValid = token && sessionExpiry && sessionExpiry > now;

  if (!isAuthenticated && !persistedSessionValid) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.isVerified === false) {
    const email = user.email ? encodeURIComponent(user.email) : "";
    return (
      <Navigate to={`/verify-email${email ? `?email=${email}` : ""}`} replace />
    );
  }

  if (requireAdmin && user?.role !== "admin" && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin users should not access student-only pages
  if (requireStudent && (user?.role === "admin" || user?.isAdmin)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
