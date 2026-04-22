import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  storeTokens,
  clearStoredTokens,
  clearHubSpotConfig,
  HUBSPOT_OAUTH_CONFIG,
  type OAuthTokenResponse,
} from '@/config/hubspot';
import { useHubSpotConnection } from '@/hooks/useHubSpot';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type CallbackStatus = 'processing' | 'success' | 'error';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { refreshConnection } = useHubSpotConnection();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessed = useRef(false);

  // Convex mutations
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const addPortalToUser = useMutation(api.users.addPortalToUser);
  const upsertTokens = useMutation(api.hubspotTokens.upsertTokens);
  const savePortalSettings = useMutation(api.portalSettings.savePortalSettings);
  const createSession = useMutation(api.userSessions.createSession);
  const markPortalReconnected = useMutation(api.cleanup.markPortalReconnected);

  useEffect(() => {
    // Prevent duplicate processing
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;

      // Get parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      // Check if we have the required parameters
      if (!code) {
        // No code - user might have landed here without proper OAuth flow
        clearAllAuthData();
        window.location.href = '/';
        return;
      }

      // Validate state (for CSRF protection)
      // Note: We're more lenient here - if no state stored, we proceed anyway
      // since session might have expired but the OAuth code is still valid
      const storedState = localStorage.getItem('hubspot_oauth_state');
      if (storedState && storedState !== state) {
        // Security validation failed
        setStatus('error');
        setErrorMessage('Security validation failed. Please try connecting again.');
        clearAllAuthData();
        return;
      }

      // Clear the stored state after validation
      localStorage.removeItem('hubspot_oauth_state');

      try {
        // Exchange authorization code for tokens
        const tokenResponse = await exchangeCodeForToken(code);

        if (tokenResponse) {
          // Store tokens in localStorage
          storeTokens(tokenResponse);

          // Save user info and tokens to Convex database
          if (tokenResponse.userInfo && tokenResponse.accountInfo) {
            const userEmail = tokenResponse.userInfo.user;
            const portalId = (tokenResponse.userInfo.hub_id || tokenResponse.accountInfo.portalId)?.toString();
            const domain = tokenResponse.accountInfo.domain || tokenResponse.userInfo.hub_domain;
            const firstName = tokenResponse.userInfo.firstName;
            const lastName = tokenResponse.userInfo.lastName;

            if (userEmail && portalId) {
              // Create or update user
              await getOrCreateUser({
                email: userEmail,
                name: firstName && lastName ? `${firstName} ${lastName}` : tokenResponse.userInfo.user,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                hubspotUserId: tokenResponse.userInfo.user_id?.toString(),
              });

              // Link portal to user
              await addPortalToUser({
                email: userEmail,
                portalId: portalId,
              });

              // Save tokens
              await upsertTokens({
                portalId: portalId,
                userEmail: userEmail,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresIn: tokenResponse.expires_in || 21600,
              });

              // Save portal settings
              await savePortalSettings({
                portalId: portalId,
                userEmail: userEmail,
                domain: domain,
                portalName: tokenResponse.accountInfo.portalId ? `app.hubspot.com` : undefined,
                companyName: tokenResponse.accountInfo.companyName,
                timezone: tokenResponse.accountInfo.timeZone,
                currency: tokenResponse.accountInfo.currency,
              });

              // Mark portal as reconnected
              await markPortalReconnected({ portalId: portalId });

              // Create user session
              const sessionData = await createSession({
                email: userEmail,
                activePortalId: portalId,
              });

              // Store session token
              sessionStorage.setItem('hubspot_session_token', sessionData.sessionToken);
              
              // Clear any stale connection status from localStorage
              // This ensures the dashboard will re-test connection on load
              localStorage.removeItem('tagbase_connection_status');
            }
          }

          // Await refresh to ensure connection state is updated
          await refreshConnection();
          setStatus('success');

          // Navigate to dashboard after brief delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          throw new Error('Failed to exchange authorization code');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to complete authorization. Please try again.'
        );
      }
    };

    handleCallback();
  }, []);

  // Clear all auth-related data
  function clearAllAuthData() {
    clearStoredTokens();
    clearHubSpotConfig();
    localStorage.removeItem('hubspot_oauth_state');
    localStorage.removeItem('tagbase_connection_status');
    sessionStorage.removeItem('hubspot_session_token');
  }

  // Exchange the authorization code for tokens
  async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse | null> {
    try {
      const response = await fetch('/.netlify/functions/hubspot-oauth-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: HUBSPOT_OAUTH_CONFIG.redirectUri,
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Handle going back to landing
  const handleGoHome = () => {
    clearAllAuthData();
    window.location.href = '/';
  };

  // Handle retry
  const handleRetry = () => {
    clearAllAuthData();
    // Redirect to HubSpot OAuth
    const scopes = [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'tickets',
      'crm.objects.owners.read',
      'crm.schemas.contacts.read',
      'crm.schemas.contacts.write',
      'crm.schemas.companies.read',
      'crm.schemas.companies.write',
      'crm.schemas.deals.read',
      'crm.schemas.deals.write',
      'oauth',
    ].join(' ');

    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('hubspot_oauth_state', state);

    const params = new URLSearchParams({
      client_id: HUBSPOT_OAUTH_CONFIG.clientId,
      redirect_uri: HUBSPOT_OAUTH_CONFIG.redirectUri,
      scope: scopes,
      state: state,
    });

    window.location.href = `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'processing' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Connecting to HubSpot
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Connected Successfully!
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Connection Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === 'processing' && 'Please wait while we complete the authorization...'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'There was a problem connecting to HubSpot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'processing' && (
            <div className="py-8">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-primary/20 rounded-full" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Your HubSpot account has been connected. You can now sync your contacts,
                companies, and deals.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handleRetry} variant="default">
                  Try Again
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
