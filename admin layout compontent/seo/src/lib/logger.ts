/**
 * Production-safe logger utility
 * Suppresses sensitive logs in production while keeping them for development
 */

const isDevelopment = import.meta.env.DEV;
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Whether to show in production (default: false) */
  showInProduction?: boolean;
  /** Category tag for filtering */
  category?: string;
}

/**
 * Create a namespaced logger
 */
export function createLogger(namespace: string) {
  const prefix = `[${namespace}]`;

  return {
    /** Debug logs - only in development */
    debug: (message: string, ...args: unknown[]) => {
      if (isDevelopment || isDebugMode) {
        console.log(prefix, message, ...args);
      }
    },

    /** Info logs - only in development */
    info: (message: string, ...args: unknown[]) => {
      if (isDevelopment || isDebugMode) {
        console.info(prefix, message, ...args);
      }
    },

    /** Warning logs - shown in production */
    warn: (message: string, ...args: unknown[]) => {
      console.warn(prefix, message, ...args);
    },

    /** Error logs - always shown */
    error: (message: string, ...args: unknown[]) => {
      console.error(prefix, message, ...args);
    },

    /** Log sensitive data only in development (tokens, credentials, etc) */
    sensitive: (message: string, ...args: unknown[]) => {
      if (isDevelopment && isDebugMode) {
        console.log(prefix, '[SENSITIVE]', message, ...args);
      }
    },
  };
}

/**
 * Generic log function with options
 */
export function log(
  level: LogLevel,
  message: string,
  data?: unknown,
  options?: LoggerOptions
) {
  const shouldLog = options?.showInProduction || isDevelopment || isDebugMode;
  
  if (!shouldLog && level !== 'error') {
    return;
  }

  const prefix = options?.category ? `[${options.category}]` : '';
  const fullMessage = prefix ? `${prefix} ${message}` : message;

  switch (level) {
    case 'debug':
      if (isDevelopment || isDebugMode) {
        console.log(fullMessage, data);
      }
      break;
    case 'info':
      if (isDevelopment || isDebugMode) {
        console.info(fullMessage, data);
      }
      break;
    case 'warn':
      console.warn(fullMessage, data);
      break;
    case 'error':
      console.error(fullMessage, data);
      break;
  }
}

// Pre-configured loggers for common modules
export const hubspotLogger = createLogger('HubSpot');
export const authLogger = createLogger('Auth');
export const sessionLogger = createLogger('Session');
export const syncLogger = createLogger('PropertySync');

/**
 * Clear all session and auth data from localStorage and sessionStorage
 * Use this when logging out to ensure complete cleanup
 */
export function clearAllStorageData(): void {
  // Connection & auth tokens
  localStorage.removeItem('tagbase_connection_status');
  localStorage.removeItem('hubspot_oauth_tokens');
  localStorage.removeItem('hubspot_config');
  localStorage.removeItem('hubspot_session_token');
  localStorage.removeItem('hubspot_oauth_state');
  
  // User data
  localStorage.removeItem('tagbase_user_data');
  
  // App data
  localStorage.removeItem('tagbase_notifications');
  localStorage.removeItem('tagbase_tags');
  localStorage.removeItem('tagbase_previous_stats');
  
  // Session storage
  sessionStorage.removeItem('hubspot_session_token');
}
