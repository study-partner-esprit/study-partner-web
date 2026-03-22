import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const SessionManager = () => {
  const { isAuthenticated, shouldRefreshToken, refreshTokenAsync } =
    useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token status every minute
    const checkInterval = setInterval(async () => {
      if (shouldRefreshToken()) {
        await refreshTokenAsync();
      }
    }, 60 * 1000); // Check every minute

    // Cleanup on unmount
    return () => clearInterval(checkInterval);
  }, [isAuthenticated, shouldRefreshToken, refreshTokenAsync]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;
