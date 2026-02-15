import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const SessionManager = () => {
  const { isAuthenticated, shouldRefreshToken, refreshTokenAsync } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token status every minute
    const checkInterval = setInterval(async () => {
      console.log('[Session] Checking token status...');

      if (shouldRefreshToken()) {
        console.log('[Session] Token needs refresh, attempting...');
        const success = await refreshTokenAsync();
        if (!success) {
          console.log('[Session] Token refresh failed, user will be logged out');
        }
      } else {
        console.log('[Session] Token is still valid');
      }
    }, 60 * 1000); // Check every minute

    // Cleanup on unmount
    return () => clearInterval(checkInterval);
  }, [isAuthenticated, shouldRefreshToken, refreshTokenAsync]);

  // Check session validity on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Session] User authenticated, session manager active');
    } else {
      console.log('[Session] User not authenticated, session manager inactive');
    }
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;