import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiPost, apiGet } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Provides authentication state to the whole app.
 *
 * State shape:
 *   user        — { _id, email, name, role } | null
 *   accessToken — string | null  (kept in memory only, never localStorage)
 *   loading     — true while the initial /auth/refresh check is in-flight
 */
export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Ref so the refresh timer can be cancelled on logout / unmount
  const refreshTimerRef = useRef(null);

  // ── Token refresh ──────────────────────────────────────────────────────
  /**
   * Calls POST /api/auth/refresh to silently get a new access token from
   * the HttpOnly refresh-token cookie the server sets at login.
   * Schedules itself to run again 2 minutes before expiry (default 15 min).
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const data = await apiPost('/api/auth/refresh', {}, { withCredentials: true });
      setAccessToken(data.accessToken);
      setUser(data.user);

      // Re-schedule: refresh again 2 min before the 15-min window closes
      const msUntilRefresh = (data.expiresIn ?? 15 * 60) * 1000 - 2 * 60 * 1000;
      refreshTimerRef.current = setTimeout(refreshAccessToken, Math.max(msUntilRefresh, 30_000));
    } catch {
      // Refresh token missing, expired, or server error — treat as logged out
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // ── Bootstrap: check if the user is already logged in ─────────────────
  useEffect(() => {
    (async () => {
      await refreshAccessToken();
      setLoading(false);
    })();

    return () => clearTimeout(refreshTimerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await apiPost('/api/auth/login', { email, password }, { withCredentials: true });
    setAccessToken(data.accessToken);
    setUser(data.user);

    // Kick off the silent-refresh cycle
    const msUntilRefresh = (data.expiresIn ?? 15 * 60) * 1000 - 2 * 60 * 1000;
    refreshTimerRef.current = setTimeout(refreshAccessToken, Math.max(msUntilRefresh, 30_000));

    return data.user;
  }, [refreshAccessToken]);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    clearTimeout(refreshTimerRef.current);
    try {
      await apiPost('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // Server-side cleanup failure is non-fatal — clear local state anyway
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password }) => {
    const data = await apiPost('/api/auth/signup', { name, email, password }, { withCredentials: true });
    setAccessToken(data.accessToken);
    setUser(data.user);

    const msUntilRefresh = (data.expiresIn ?? 15 * 60) * 1000 - 2 * 60 * 1000;
    refreshTimerRef.current = setTimeout(refreshAccessToken, Math.max(msUntilRefresh, 30_000));

    return data.user;
  }, [refreshAccessToken]);

  // ── Derived helpers ────────────────────────────────────────────────────
  const isAuthenticated = Boolean(accessToken && user);
  const isAdmin         = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, isAuthenticated, isAdmin, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — throws if used outside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
