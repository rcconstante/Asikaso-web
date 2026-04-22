import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Users, AlertCircle, Key } from "lucide-react";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LinkedPortal {
  portalId: string;
  domain?: string;
  portalName?: string;
}

interface ReconnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
  onSwitchAccount?: (portalId: string) => void;
  portalId?: string;
  portalName?: string;
  linkedPortals?: LinkedPortal[];
  reason?: "token_expired" | "refresh_failed" | "unauthorized";
}

/**
 * ReconnectModal - Shows when HubSpot tokens expire but user is still logged into the website
 * 
 * This is separate from DisconnectionModal which handles app uninstall scenarios.
 * This modal allows users to:
 * 1. Reconnect to HubSpot with the same account
 * 2. Switch to a different linked account (if multiple accounts detected)
 * 3. Logout completely
 */
export function ReconnectModal({
  open,
  onOpenChange,
  onLogout,
  onSwitchAccount,
  portalId,
  portalName,
  linkedPortals = [],
  reason = "token_expired",
}: ReconnectModalProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = () => {
    setIsReconnecting(true);
    // Redirect to HubSpot OAuth to get fresh tokens
    window.location.href = buildOAuthAuthorizationUrl();
  };

  const handleSwitchAccount = (targetPortalId: string) => {
    if (onSwitchAccount) {
      onSwitchAccount(targetPortalId);
    }
    onOpenChange(false);
  };

  const handleLogout = () => {
    onLogout();
    onOpenChange(false);
  };

  const getReasonTitle = () => {
    switch (reason) {
      case "token_expired":
        return "Session Expired";
      case "refresh_failed":
        return "Authentication Failed";
      case "unauthorized":
        return "Authorization Required";
      default:
        return "Reconnection Required";
    }
  };

  const getReasonDescription = () => {
    switch (reason) {
      case "token_expired":
        return "Your HubSpot session has expired. Please reconnect to continue syncing.";
      case "refresh_failed":
        return "We couldn't refresh your HubSpot access. Please reconnect your account.";
      case "unauthorized":
        return "Your HubSpot authorization is no longer valid. Please reconnect to continue.";
      default:
        return "Please reconnect your HubSpot account to continue.";
    }
  };

  // Filter out current portal from linked portals
  const otherPortals = linkedPortals.filter((p) => p.portalId !== portalId);
  const hasMultipleAccounts = otherPortals.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        {/* Header with icon */}
        <div className="bg-orange-50 dark:bg-orange-950/30 px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 flex-shrink-0">
              <Key className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">{getReasonTitle()}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {portalName || `Portal ${portalId}`}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Reason explanation */}
          <div className="flex items-start gap-3 text-sm mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">{getReasonDescription()}</p>
          </div>

          {/* Quick note about data */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-4">
            Your data is safe. Reconnect anytime to resume syncing with HubSpot.
          </p>

          {/* Account switcher section - only show if multiple accounts */}
          {hasMultipleAccounts && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Switch to another account</span>
                </div>
                <ScrollArea className="max-h-[120px]">
                  <div className="space-y-2">
                    {otherPortals.map((portal) => (
                      <button
                        key={portal.portalId}
                        onClick={() => handleSwitchAccount(portal.portalId)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {(portal.domain || portal.portalName || portal.portalId)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {portal.domain || portal.portalName || `Portal ${portal.portalId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {portal.portalId}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
          <Button
            onClick={handleReconnect}
            disabled={isReconnecting}
            size="sm"
            className="flex-1"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
