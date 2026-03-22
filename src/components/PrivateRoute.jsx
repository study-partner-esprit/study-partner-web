import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, token, sessionExpiry, user } = useAuthStore();

  // Consider session valid if persisted token exists and hasn't expired yet.
  const now = Date.now();
  const persistedSessionValid = token && sessionExpiry && sessionExpiry > now;

  if (!isAuthenticated && !persistedSessionValid) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "admin" && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
