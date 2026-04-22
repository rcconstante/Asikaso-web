import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { buildOAuthAuthorizationUrl } from '@/config/hubspot';
import { useUserSession } from '@/contexts/UserSessionContext';

export function AccountSelector() {
  const { userEmail, activePortalId, switchPortal } = useUserSession();
  const userPortals = useQuery(
    api.users.getUserPortals,
    userEmail ? { email: userEmail } : 'skip'
  );

  const handleAddAccount = () => {
    // Redirect to HubSpot OAuth to add another account
    window.location.href = buildOAuthAuthorizationUrl();
  };

  const handleSwitchAccount = async (portalId: string) => {
    try {
      await switchPortal(portalId);
      // Reload to apply the new portal
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch portal:', error);
    }
  };

  if (!userEmail) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Your HubSpot Accounts
        </CardTitle>
        <CardDescription>
          Manage multiple HubSpot portals under your account ({userEmail})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userPortals && userPortals.length > 0 ? (
          <div className="space-y-2">
            {userPortals.map((portal) => (
              <div
                key={portal.portalId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {portal.domain || portal.portalName || `Portal ${portal.portalId}`}
                    </h3>
                    {activePortalId === portal.portalId && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {portal.companyName && (
                    <p className="text-sm text-muted-foreground">{portal.companyName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Portal ID: {portal.portalId}</p>
                </div>
                {activePortalId !== portal.portalId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSwitchAccount(portal.portalId)}
                  >
                    Switch
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No accounts connected yet.</p>
        )}

        <Button onClick={handleAddAccount} variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Another HubSpot Account
        </Button>
      </CardContent>
    </Card>
  );
}
