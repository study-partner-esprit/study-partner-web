import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { characterAPI } from "../services/api";

const PrivateRoute = ({
  children,
  requireAdmin = false,
  requireStudent = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, token, sessionExpiry, user } = useAuthStore();
  const [characterCheckStatus, setCharacterCheckStatus] = useState("idle");

  // Consider session valid if persisted token exists and hasn't expired yet.
  const now = Date.now();
  const persistedSessionValid = token && sessionExpiry && sessionExpiry > now;

  const shouldCheckCharacter = useMemo(() => {
    const isAdmin = user?.role === "admin" || user?.isAdmin;
    const isCharacterSelectionRoute = location.pathname === "/character-selection";

    return (
      requireStudent &&
      !isAdmin &&
      isAuthenticated &&
      !isCharacterSelectionRoute
    );
  }, [requireStudent, user?.role, user?.isAdmin, isAuthenticated, location.pathname]);

  useEffect(() => {
    let isCancelled = false;

    const checkCharacterAssignment = async () => {
      if (!shouldCheckCharacter) {
        setCharacterCheckStatus("idle");
        return;
      }

      setCharacterCheckStatus("checking");

      try {
        const response = await characterAPI.getUserCharacter();
        const hasCharacter = Boolean(response?.success && response?.data?.character_id);

        if (!isCancelled) {
          setCharacterCheckStatus(hasCharacter ? "assigned" : "missing");
        }
      } catch (error) {
        const errorMessage = String(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            ""
        ).toLowerCase();
        const noCharacterAssigned =
          errorMessage.includes("no character") ||
          errorMessage.includes("character not found");

        if (!isCancelled) {
          // Fail open on unknown network/server errors to avoid blocking access.
          setCharacterCheckStatus(noCharacterAssigned ? "missing" : "assigned");
        }
      }
    };

    checkCharacterAssignment();

    return () => {
      isCancelled = true;
    };
  }, [shouldCheckCharacter]);

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

  if (shouldCheckCharacter && characterCheckStatus === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Checking character setup...
      </div>
    );
  }

  if (shouldCheckCharacter && characterCheckStatus === "missing") {
    return <Navigate to="/character-selection" replace />;
  }

  return children;
};

export default PrivateRoute;
