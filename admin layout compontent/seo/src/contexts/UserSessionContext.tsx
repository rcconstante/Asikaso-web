import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { sessionLogger } from '@/lib/logger';

interface UserSessionContextType {
  userEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  activePortalId: string | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  plan: string | null;
  setSession: (email: string, sessionToken: string, portalId?: string) => void;
  clearSession: () => void;
  switchPortal: (portalId: string) => Promise<void>;
  refreshSession: () => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

const SESSION_TOKEN_KEY = 'hubspot_session_token';
const USER_DATA_KEY = 'tagbase_user_data';

// Heartbeat interval - 2 minutes
const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

interface StoredUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  portalId?: string;
  timestamp: number;
}

// 7 days validity for stored data
const DATA_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Get stored user data from localStorage
 */
function getStoredUserData(): StoredUserData | null {
  try {
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (!stored) return null;

    const data: StoredUserData = JSON.parse(stored);

    // Check if data is still valid
    if (Date.now() - data.timestamp > DATA_VALIDITY_MS) {
      localStorage.removeItem(USER_DATA_KEY);
      return null;
    }

    return data;
  } catch {
    localStorage.removeItem(USER_DATA_KEY);
    return null;
  }
}

/**
 * Store user data to localStorage
 */
function storeUserData(data: Omit<StoredUserData, 'timestamp'>): void {
  try {
    const storedData: StoredUserData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(storedData));
  } catch (e) {
    sessionLogger.error('Failed to store user data:', e);
  }
}

/**
 * Clear all stored user data
 */
function clearStoredData(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  // Get token from storage on mount
  const getStoredToken = () => {
    return localStorage.getItem(SESSION_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
  };

  const [sessionToken, setSessionToken] = useState<string | null>(getStoredToken);
  const [userData, setUserData] = useState<StoredUserData | null>(() => getStoredUserData());
  const [isInitialized, setIsInitialized] = useState(false);

  // Track last successful data to prevent flickering
  const lastValidData = useRef<StoredUserData | null>(userData);

  // Heartbeat timer ref - DISABLED to prevent auto-renewal
  // Session validity is now determined by database state only
  // const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // Convex queries - these maintain real-time subscriptions
  const sessionQuery = useQuery(
    api.userSessions.getSession,
    sessionToken ? { sessionToken } : 'skip'
  );

  // Use email from session or stored data
  const emailForUserQuery = sessionQuery?.email || userData?.email;
  const userQuery = useQuery(
    api.users.getUserByEmail,
    emailForUserQuery ? { email: emailForUserQuery } : 'skip'
  );

  // Mutations
  const updateSessionActivity = useMutation(api.userSessions.updateSessionActivity);
  const updateSessionPortal = useMutation(api.userSessions.updateSessionPortal);
  const deleteSessionMutation = useMutation(api.userSessions.deleteSession);
  const setActivePortalMutation = useMutation(api.users.setActivePortal);

  /**
   * Send heartbeat - DISABLED
   * Session is now managed by database state, not client-side heartbeats
   * This prevents unnecessary network calls and lets sessions persist based on DB
   */
  const sendHeartbeat = useCallback(async () => {
    // DISABLED: No longer auto-renewing sessions
    // Sessions remain valid based on database state
  }, []);

  // Heartbeat timer DISABLED - sessions now persist based on database state
  // Users are not auto-logged out; they stay logged in until they manually disconnect
  // or their tokens become invalid in the database

  /**
   * Sync data from Convex to local state
   * Only update when we get VALID data (not undefined/loading)
   */
  useEffect(() => {
    // Skip if sessionQuery is still loading (undefined)
    if (sessionToken && sessionQuery === undefined) {
      return; // Still loading, keep showing cached data
    }

    // Handle session expired/invalid - but DON'T auto-clear
    // Just update state to reflect the session is gone
    if (sessionQuery === null && sessionToken) {
      // Don't auto-clear - let user stay on page
      // They will see disconnection UI and can reconnect when ready
      setIsInitialized(true);
      return;
    }

    // Build user data from Convex responses
    if (sessionQuery) {
      const newData: StoredUserData = {
        email: sessionQuery.email,
        firstName: userQuery?.firstName || lastValidData.current?.firstName,
        lastName: userQuery?.lastName || lastValidData.current?.lastName,
        plan: userQuery?.plan || lastValidData.current?.plan,
        portalId: sessionQuery.activePortalId || lastValidData.current?.portalId,
        timestamp: Date.now(),
      };

      // Update only if there's a real change
      const hasChange =
        newData.email !== lastValidData.current?.email ||
        newData.firstName !== lastValidData.current?.firstName ||
        newData.lastName !== lastValidData.current?.lastName ||
        newData.plan !== lastValidData.current?.plan ||
        newData.portalId !== lastValidData.current?.portalId;

      if (hasChange) {
        setUserData(newData);
        storeUserData(newData);
        lastValidData.current = newData;
      }
    }

    setIsInitialized(true);
  }, [sessionQuery, userQuery, sessionToken]);

  /**
   * Set session after OAuth
   */
  const setSession = useCallback((email: string, token: string, portalId?: string) => {
    // Store token
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    setSessionToken(token);

    // Set user data immediately
    const newData: StoredUserData = {
      email,
      portalId,
      timestamp: Date.now(),
    };
    setUserData(newData);
    storeUserData(newData);
    lastValidData.current = newData;
  }, []);

  /**
   * Clear session on logout
   */
  const clearSession = useCallback(async () => {
    if (sessionToken) {
      try {
        await deleteSessionMutation({ sessionToken });
      } catch (e) {
        sessionLogger.error('Failed to delete session:', e);
      }
    }

    // Heartbeat timer disabled - no need to clear
    clearStoredData();
    setSessionToken(null);
    setUserData(null);
    lastValidData.current = null;
  }, [sessionToken, deleteSessionMutation]);

  /**
   * Switch portal
   */
  const switchPortal = useCallback(async (portalId: string) => {
    if (!sessionToken || !userData?.email) {
      throw new Error('No active session');
    }

    await updateSessionPortal({ sessionToken, activePortalId: portalId });
    await setActivePortalMutation({ email: userData.email, portalId });

    const updatedData: StoredUserData = {
      ...userData,
      portalId,
      timestamp: Date.now(),
    };
    setUserData(updatedData);
    storeUserData(updatedData);
    lastValidData.current = updatedData;
  }, [sessionToken, userData, updateSessionPortal, setActivePortalMutation]);

  /**
   * Manual refresh trigger
   */
  const refreshSession = useCallback(() => {
    if (sessionToken) {
      sendHeartbeat();
    }
  }, [sessionToken, sendHeartbeat]);

  /**
   * Compute context value
   * Priority: Convex realtime data > Cached data > null
   */
  const value = useMemo<UserSessionContextType>(() => {
    // Use the most current valid data available
    const currentData = lastValidData.current || userData;

    // Build values from Convex (if available) or cached data
    const email = sessionQuery?.email || currentData?.email || null;
    const firstName = userQuery?.firstName || currentData?.firstName || null;
    const lastName = userQuery?.lastName || currentData?.lastName || null;
    const plan = userQuery?.plan || currentData?.plan || null;
    const portalId = sessionQuery?.activePortalId || currentData?.portalId || null;

    // Authenticated if we have token and either Convex or cached data
    const isAuthenticated = !!(sessionToken && (sessionQuery || currentData));

    // Loading if we have token but no data yet
    const isLoading = !!(sessionToken && !isInitialized);

    return {
      userEmail: email,
      firstName,
      lastName,
      activePortalId: portalId,
      plan,
      sessionToken,
      isAuthenticated,
      isLoading,
      setSession,
      clearSession,
      switchPortal,
      refreshSession,
    };
  }, [
    sessionQuery,
    userQuery,
    userData,
    sessionToken,
    isInitialized,
    setSession,
    clearSession,
    switchPortal,
    refreshSession,
  ]);

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}
