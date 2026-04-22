import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";

interface DisconnectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLater: () => void;
    portalId: string;
    portalName?: string;
    isSingleAccount: boolean;
    disconnectedAt?: number;
}

export function DisconnectionModal({
    open,
    onOpenChange,
    onLater,
    portalName,
    disconnectedAt,
}: DisconnectionModalProps) {
    const [isReconnecting, setIsReconnecting] = useState(false);

    const handleReconnect = () => {
        setIsReconnecting(true);
        window.location.href = buildOAuthAuthorizationUrl();
    };

    const handleLater = () => {
        onLater();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[380px] p-5">
                <DialogHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">App Disconnected</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {portalName || "HubSpot"} - Sync paused
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {/* Quick info */}
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Your data is preserved. Reconnect anytime to restore sync.</span>
                    </div>

                    {disconnectedAt && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Disconnected {new Date(disconnectedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <DialogFooter className="flex-row gap-2 pt-2">
                    <Button variant="ghost" onClick={handleLater} size="sm" className="flex-1">
                        Later
                    </Button>
                    <Button onClick={handleReconnect} disabled={isReconnecting} size="sm" className="flex-1">
                        {isReconnecting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            "Reconnect"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
