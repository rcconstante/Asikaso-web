// HubSpot Configuration
// Store API configuration settings

import { authLogger } from '@/lib/logger';

export interface HubSpotConfig {
  accessToken: string;
  refreshToken?: string;
  portalId?: string;
  apiBaseUrl: string;
  expiresAt?: number;
}

// OAuth Configuration - Project Build App (not legacy)
// App ID: 26267110 (new project-based app)
// Uses standard OAuth flow for public installation
export const HUBSPOT_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_HUBSPOT_CLIENT_ID || '49fff5b4-d4de-4292-babc-830e8600c390',
  redirectUri: import.meta.env.VITE_HUBSPOT_REDIRECT_URI || 'https://tagbase.co/auth/callback',
  authUrl: 'https://app.hubspot.com/oauth/authorize',
  appId: '26267110',
  // Legacy app ID (deprecated): 26238625
};

// Environment variable keys
export const HUBSPOT_ACCESS_TOKEN_KEY = 'VITE_HUBSPOT_ACCESS_TOKEN';
export const HUBSPOT_PORTAL_ID_KEY = 'VITE_HUBSPOT_PORTAL_ID';

// Default configuration
export const defaultHubSpotConfig: HubSpotConfig = {
  accessToken: import.meta.env.VITE_HUBSPOT_ACCESS_TOKEN || '',
  portalId: import.meta.env.VITE_HUBSPOT_PORTAL_ID || '',
  apiBaseUrl: 'https://api.hubapi.com',
};

// Local storage key for storing config (for runtime configuration)
export const HUBSPOT_CONFIG_STORAGE_KEY = 'hubspot_config';

// Get stored configuration from localStorage
export function getStoredHubSpotConfig(): Partial<HubSpotConfig> {
  try {
    const stored = localStorage.getItem(HUBSPOT_CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    authLogger.error('Failed to parse stored HubSpot config:', error);
  }
  return {};
}

// Save configuration to localStorage
export function saveHubSpotConfig(config: Partial<HubSpotConfig>): void {
  try {
    localStorage.setItem(HUBSPOT_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    authLogger.error('Failed to save HubSpot config:', error);
  }
}

// Clear stored configuration
export function clearHubSpotConfig(): void {
  try {
    localStorage.removeItem(HUBSPOT_CONFIG_STORAGE_KEY);
  } catch (error) {
    authLogger.error('Failed to clear HubSpot config:', error);
  }
}

// Get merged configuration (env + stored)
export function getHubSpotConfig(): HubSpotConfig {
  const stored = getStoredHubSpotConfig();
  return {
    ...defaultHubSpotConfig,
    ...stored,
  };
}

// Tag property configuration
export const TAG_PROPERTY_NAME = 'tagbase_tags_select';
export const TAG_PROPERTY_GROUP = 'tagbase_integration';

// HubSpot API rate limit configuration
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerSecond: 10,
  maxRequestsPerDay: 250000,
  retryDelayMs: 1000,
  maxRetries: 3,
};

// Scopes required for the integration
// Full list for Public App with all features
export const REQUIRED_SCOPES = [
  // CRM Objects - Read/Write
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.companies.read',
  'crm.objects.companies.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  // Tickets support
  'tickets',
  // Owners - For getting user names
  'crm.objects.owners.read',
  // CRM Schemas - Property management
  'crm.schemas.contacts.read',
  'crm.schemas.contacts.write',
  'crm.schemas.companies.read',
  'crm.schemas.companies.write',
  'crm.schemas.deals.read',
  'crm.schemas.deals.write',
  // Account info
  'oauth',
];

// OAuth flow helpers
const OAUTH_STATE_KEY = 'hubspot_oauth_state';

// Generate a random state for CSRF protection
export function generateOAuthState(): string {
  const state = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  try {
    localStorage.setItem(OAUTH_STATE_KEY, state);
  } catch (error) {
    authLogger.error('Failed to store OAuth state:', error);
  }
  return state;
}

// Validate the state returned from OAuth
export function validateOAuthState(returnedState: string): boolean {
  try {
    const storedState = localStorage.getItem(OAUTH_STATE_KEY);
    localStorage.removeItem(OAUTH_STATE_KEY);
    return storedState === returnedState;
  } catch (error) {
    authLogger.error('Failed to validate OAuth state:', error);
    return false;
  }
}

// Build the HubSpot OAuth authorization URL
// Uses standard OAuth flow for the project-based app
export function buildOAuthAuthorizationUrl(): string {
  const state = generateOAuthState();
  const scopes = REQUIRED_SCOPES.join(' ');

  const params = new URLSearchParams({
    client_id: HUBSPOT_OAUTH_CONFIG.clientId,
    redirect_uri: HUBSPOT_OAUTH_CONFIG.redirectUri,
    scope: scopes,
    state: state,
  });

  return `${HUBSPOT_OAUTH_CONFIG.authUrl}?${params.toString()}`;
}

// Exchange authorization code for access token (server-side recommended)
// This function is for development/demo purposes
// In production, token exchange should happen on a secure backend
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  hub_id?: number;
  hub_domain?: string;
  userInfo?: {
    user?: string; // User email
    user_id?: string | number; // HubSpot user ID (can be number)
    hub_id?: number; // Portal ID
    hub_domain?: string;
    scopes?: string[];
    firstName?: string; // First name from Owners API
    lastName?: string; // Last name from Owners API
  };
  accountInfo?: {
    portalId?: number;
    domain?: string; // Primary domain like "insycle.com" or "logomaker-ai.com" (from CMS or hub_domain)
    uiDomain?: string; // HubSpot UI domain like "app-na2.hubspot.com"
    hubDomain?: string; // Hub domain from OAuth
    additionalDomains?: string[]; // Additional registered domains
    companyName?: string;
    timeZone?: string;
    currency?: string;
    dataHostingLocation?: string;
  };
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
  portalId?: string;
  portalName?: string;
  userEmail?: string;
  domain?: string;
}

const TOKEN_STORAGE_KEY = 'hubspot_oauth_tokens';

export function storeTokens(tokens: OAuthTokenResponse): void {
  const storedTokens: StoredTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    portalId: tokens.hub_id ? String(tokens.hub_id) : undefined,
    portalName: tokens.hub_domain,
  };

  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(storedTokens));
    // Also update the main config
    saveHubSpotConfig({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: storedTokens.expiresAt,
      portalId: storedTokens.portalId,
    });

    // Store tokens in Convex for backend access (Netlify functions)
    if (storedTokens.portalId) {
      storeTokensInConvex(storedTokens.portalId, tokens);
    }
  } catch (error) {
    authLogger.error('Failed to store tokens:', error);
  }
}

// Store tokens in Convex database for backend access
async function storeTokensInConvex(portalId: string, tokens: OAuthTokenResponse): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'hubspotTokens:upsertTokens',
        args: {
          portalId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
        },
        format: 'json'
      })
    });

    if (response.ok) {
      // Token storage successful
    } else {
      authLogger.warn('Failed to store tokens in Convex');
    }
  } catch (error) {
    authLogger.warn('Could not store tokens in Convex:', error);
  }
}

export function getStoredTokens(): StoredTokens | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredTokens;
    }
  } catch (error) {
    authLogger.error('Failed to retrieve tokens:', error);
  }
  return null;
}

export function clearStoredTokens(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(OAUTH_STATE_KEY);
  } catch (error) {
    authLogger.error('Failed to clear tokens:', error);
  }
}

export function isTokenExpired(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return true;
  // Add 5 minute buffer before expiration
  return Date.now() >= tokens.expiresAt - 5 * 60 * 1000;
}

// Check if we're on the OAuth callback URL
export function isOAuthCallback(): boolean {
  // Only check if on root path or callback path with params
  const path = window.location.pathname;
  if (path !== '/' && path !== '/auth/callback') {
    return false;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const hasCode = urlParams.has('code');
  const hasState = urlParams.has('state');

  // Must have both code and state parameters
  return hasCode && hasState;
}

// Extract OAuth callback parameters
export function getOAuthCallbackParams(): { code: string; state: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (code && state) {
    return { code, state };
  }
  return null;
}

// Refresh the access token using refresh token
export async function refreshAccessToken(): Promise<OAuthTokenResponse | null> {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.refreshToken) {
    authLogger.error('No refresh token available');
    return null;
  }

  try {
    const response = await fetch('/api/hubspot/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      }),
    });

    if (response.ok) {
      const newTokens = await response.json() as OAuthTokenResponse;
      storeTokens(newTokens);
      return newTokens;
    } else {
      const errorData = await response.json().catch(() => ({}));
      authLogger.error('Token refresh failed:', errorData);
      // Clear invalid tokens
      clearStoredTokens();
      return null;
    }
  } catch (error) {
    authLogger.error('Token refresh error:', error);
    return null;
  }
}

// Check if token needs refresh (5 minutes before expiry)
export function shouldRefreshToken(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;

  // Refresh if less than 5 minutes until expiry
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= tokens.expiresAt - fiveMinutes;
}
