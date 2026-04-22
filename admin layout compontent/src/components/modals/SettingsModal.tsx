import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useUserSession } from "@/contexts/UserSessionContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { hubspotPropertySyncService } from "@/services/hubspotPropertySync";
import {
    User,
    Database,
    Shield,
    CreditCard,
    Link2,
    Link2Off,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    Eye,
    EyeOff,
    LogIn,
    ExternalLink,
    Check,
    Plus,
    Building2,
    CheckCircle2,
    Mail,
    AlertTriangle,
    Trash2,
    Gift,
    Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingModal } from "./PricingModal";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type SettingsTab = "accounts" | "properties" | "permissions" | "subscription";

const tabs = [
    { id: "accounts" as const, label: "Accounts", icon: User },
    { id: "properties" as const, label: "HubSpot Properties", icon: Database },
    { id: "permissions" as const, label: "Required Permissions", icon: Shield },
    { id: "subscription" as const, label: "Subscription Plan", icon: CreditCard },
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { toast } = useToast();
    const {
        connectionStatus,
        isConnecting,
        connect,
        disconnect,
        testConnection,
        setupHubSpotProperties,
        syncStatus,
        tags,
        disconnectionStatus,
    } = useHubSpot();

    // Determine if effectively connected (connected AND not disconnected)
    const isEffectivelyConnected = connectionStatus.isConnected && !disconnectionStatus.isDisconnected;

    // Get user session data
    const { userEmail, firstName, lastName, activePortalId, switchPortal } = useUserSession();

    // Get user's connected portals from Convex
    const userPortals = useQuery(
        api.users.getUserPortals,
        userEmail ? { email: userEmail } : "skip"
    );

    // Get current portal settings
    const portalSettings = useQuery(
        api.portalSettings.getPortalSettings,
        activePortalId ? { portalId: activePortalId } : "skip"
    );

    // Get user subscription
    const userSubscription = useQuery(
        api.subscriptions.getUserSubscription,
        userEmail ? { email: userEmail } : "skip"
    );

    const [activeTab, setActiveTab] = useState<SettingsTab>("accounts");
    const [accessToken, setAccessToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [isSwitchingPortal, setIsSwitchingPortal] = useState<string | null>(null);

    // Redeem code states
    const [redeemCode, setRedeemCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState("");
    const [redeemSuccess, setRedeemSuccess] = useState("");

    // Redeem code mutation
    const redeemCodeMutation = useMutation(api.redeemCodes.redeemCode);

    const handleSwitchPortal = async (portalId: string) => {
        setIsSwitchingPortal(portalId);
        try {
            await switchPortal(portalId);
            toast({
                title: "Account switched",
                description: "Successfully switched to the selected account.",
            });
            // Reload to apply the new portal
            window.location.reload();
        } catch (error) {
            toast({
                title: "Switch failed",
                description: "Failed to switch account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSwitchingPortal(null);
        }
    };

    const handleAddAccount = () => {
        window.location.href = buildOAuthAuthorizationUrl();
    };

    const handleConnect = async () => {
        if (!accessToken.trim()) {
            toast({
                title: "Access token required",
                description: "Please enter your HubSpot access token.",
                variant: "destructive",
            });
            return;
        }

        const success = await connect(accessToken);
        if (success) {
            toast({
                title: "Connected to HubSpot",
                description: "Your HubSpot account is now connected.",
            });
            setAccessToken("");
        } else {
            toast({
                title: "Connection failed",
                description: connectionStatus.error || "Failed to connect to HubSpot.",
                variant: "destructive",
            });
        }
    };

    const handleDisconnect = () => {
        disconnect();
        toast({
            title: "Disconnected",
            description: "Your HubSpot account has been disconnected.",
        });
    };

    const handleTestConnection = async () => {
        const status = await testConnection();
        if (status.isConnected) {
            toast({
                title: "Connection successful",
                description: `Connected to ${status.portalName || status.portalId}`,
            });
        } else {
            toast({
                title: "Connection failed",
                description: status.error || "Unable to connect to HubSpot.",
                variant: "destructive",
            });
        }
    };

    const handleSetupProperties = async () => {
        setIsSettingUp(true);
        try {
            const result = await setupHubSpotProperties();
            if (result.success) {
                toast({
                    title: "Setup complete",
                    description: "TagBase properties have been created in HubSpot.",
                });
            } else {
                toast({
                    title: "Setup completed with errors",
                    description: result.errors.join(", "),
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Setup failed",
                description: "Failed to setup HubSpot properties.",
                variant: "destructive",
            });
        } finally {
            setIsSettingUp(false);
        }
    };

    const handleCleanupOrphanedTags = async () => {
        setIsCleaningUp(true);
        try {
            const result = await hubspotPropertySyncService.cleanupOrphanedTags();
            if (result.success) {
                // Count total cleaned records
                const resultsData = (result.results?.results || {}) as Record<string, { recordsCleaned?: number }>;
                let totalCleaned = 0;
                for (const key of Object.keys(resultsData)) {
                    totalCleaned += resultsData[key].recordsCleaned || 0;
                }

                toast({
                    title: "Cleanup complete",
                    description: totalCleaned > 0
                        ? `Cleaned orphaned tag IDs from ${totalCleaned} records.`
                        : "No orphaned tag IDs found.",
                });
            } else {
                toast({
                    title: "Cleanup failed",
                    description: "Failed to clean up orphaned tags.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Cleanup failed",
                description: "An error occurred during cleanup.",
                variant: "destructive",
            });
        } finally {
            setIsCleaningUp(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "accounts":
                return (
                    <div className="space-y-6">
                        {/* User Profile Section */}
                        {userEmail && (
                            <div className="p-4 rounded-xl bg-muted/50 border">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        {(firstName || lastName) && (
                                            <p className="font-semibold text-lg">
                                                {firstName} {lastName}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Connected Accounts Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Connected HubSpot Accounts
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Manage your connected HubSpot portals. You can connect multiple accounts.
                            </p>
                        </div>

                        {/* Accounts List */}
                        {userPortals && userPortals.length > 0 ? (
                            <div className="space-y-3">
                                {userPortals.map((portal) => {
                                    const isActive = activePortalId === portal.portalId;
                                    const isSwitching = isSwitchingPortal === portal.portalId;
                                    const isPortalDisconnected = isActive && disconnectionStatus.isDisconnected;

                                    return (
                                        <div
                                            key={portal.portalId}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all",
                                                isPortalDisconnected
                                                    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                                                    : isActive
                                                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                                                        : "bg-muted/30 hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {isPortalDisconnected ? (
                                                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                                    ) : isActive && (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className={cn(
                                                                "font-medium",
                                                                isPortalDisconnected
                                                                    ? "text-orange-700 dark:text-orange-300"
                                                                    : isActive && "text-emerald-700 dark:text-emerald-300"
                                                            )}>
                                                                {portal.domain || portal.portalName || `Portal ${portal.portalId}`}
                                                            </p>
                                                            {isPortalDisconnected ? (
                                                                <Badge className="bg-orange-500 text-white text-xs">Disconnected</Badge>
                                                            ) : isActive && (
                                                                <Badge className="bg-emerald-500 text-white text-xs">Active</Badge>
                                                            )}
                                                        </div>
                                                        {portal.companyName && (
                                                            <p className="text-sm text-muted-foreground">{portal.companyName}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Portal ID: {portal.portalId}
                                                        </p>
                                                        {isPortalDisconnected && (
                                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                                App was uninstalled from HubSpot. Changes won't sync until reconnected.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {isPortalDisconnected ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAddAccount}
                                                        className="rounded-lg border-orange-300 text-orange-600 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
                                                    >
                                                        Reconnect
                                                    </Button>
                                                ) : !isActive && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSwitchPortal(portal.portalId)}
                                                        disabled={isSwitching}
                                                        className="rounded-lg"
                                                    >
                                                        {isSwitching ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            "Switch"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : connectionStatus.isConnected ? (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <div className="flex-1">
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300">Connected</p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                        {portalSettings?.domain || connectionStatus.domain || connectionStatus.portalId}
                                    </p>
                                </div>
                                <Badge variant="secondary">Active</Badge>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
                                <Link2Off className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No accounts connected yet</p>
                            </div>
                        )}

                        {/* Add Account Button */}
                        <Separator />

                        <Button
                            onClick={handleAddAccount}
                            variant="outline"
                            className="w-full rounded-xl gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Another HubSpot Account
                        </Button>

                        {/* Actions for connected account */}
                        {connectionStatus.isConnected && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleTestConnection}
                                    disabled={isConnecting}
                                    className="rounded-xl flex-1"
                                >
                                    {isConnecting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Test Connection
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDisconnect}
                                    className="rounded-xl"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        )}
                    </div>
                );

            case "properties":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">HubSpot Properties</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Setup custom properties to store tags in HubSpot
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                            <p className="text-sm">
                                TagBase creates a custom property called <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono text-xs">tagbase_tags_select</code> on
                                Contacts, Companies, Deals, and Tickets to store tag data.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This property is created automatically when you connect, but you can manually trigger the setup if needed.
                            </p>
                        </div>

                        {syncStatus.lastSyncedAt && (
                            <p className="text-sm text-muted-foreground">
                                Last setup: {syncStatus.lastSyncedAt.toLocaleString()}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSetupProperties}
                                disabled={isSettingUp || !connectionStatus.isConnected}
                                className="rounded-xl"
                            >
                                {isSettingUp ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Database className="h-4 w-4 mr-2" />
                                )}
                                Setup Properties
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleCleanupOrphanedTags}
                                disabled={isCleaningUp || !connectionStatus.isConnected}
                                className="rounded-xl"
                            >
                                {isCleaningUp ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Cleanup Orphaned Tags
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Use "Cleanup Orphaned Tags" if you see errors when adding tags. This removes deleted tag IDs from HubSpot records.
                        </p>

                        {!connectionStatus.isConnected && (
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                Connect to HubSpot first to setup properties.
                            </p>
                        )}
                    </div>
                );

            case "permissions":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Required Permissions</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your HubSpot private app needs these scopes
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-muted/50">
                                <h4 className="font-medium text-sm mb-2">CRM Objects</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        "crm.objects.contacts.read",
                                        "crm.objects.contacts.write",
                                        "crm.objects.companies.read",
                                        "crm.objects.companies.write",
                                        "crm.objects.deals.read",
                                        "crm.objects.deals.write",
                                        "crm.objects.tickets.read",
                                        "crm.objects.tickets.write",
                                    ].map((scope) => (
                                        <Badge key={scope} variant="outline" className="text-xs">
                                            {scope}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/50">
                                <h4 className="font-medium text-sm mb-2">CRM Schemas (Properties)</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        "crm.schemas.contacts.read",
                                        "crm.schemas.contacts.write",
                                        "crm.schemas.companies.read",
                                        "crm.schemas.companies.write",
                                        "crm.schemas.deals.read",
                                        "crm.schemas.deals.write",
                                        "crm.schemas.tickets.read",
                                        "crm.schemas.tickets.write",
                                    ].map((scope) => (
                                        <Badge key={scope} variant="outline" className="text-xs">
                                            {scope}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/50">
                                <h4 className="font-medium text-sm mb-2">Other</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="text-xs">cms.domains.read</Badge>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://developers.hubspot.com/docs/api/private-apps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Learn more about HubSpot private apps
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                );

            case "subscription": {
                const currentPlan = userSubscription?.plan || "free";
                const isSubscribed = currentPlan !== "free";

                const planDetails = {
                    free: {
                        name: "Free",
                        features: ["Up to 10 tags", "Basic tagging", "Tag Board view", "Email support"],
                    },
                    basic: {
                        name: "Basic",
                        features: ["Unlimited tags", "All object types", "Categories & organization", "Tag Board with export", "Real-time HubSpot sync"],
                    },
                    pro: {
                        name: "Pro",
                        features: ["Everything in Basic", "Journey visualizations", "Sankey diagrams", "Advanced analytics", "Priority support", "AI Assistant"],
                    },
                };

                const plan = planDetails[currentPlan as keyof typeof planDetails] || planDetails.free;

                const handleManageOrUpgrade = async () => {
                    if (isSubscribed) {
                        // Redirect to Stripe Customer Portal
                        try {
                            const response = await fetch("/api/stripe/customer-portal", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    email: userEmail,
                                    returnUrl: `${window.location.origin}/dashboard`,
                                }),
                            });
                            const data = await response.json();
                            if (data.url) {
                                window.location.href = data.url;
                            }
                        } catch (error) {
                            console.error("Portal error:", error);
                        }
                    } else {
                        // Show pricing modal for free users
                        setShowPricingModal(true);
                    }
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Subscription Plan</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Manage your TagBase subscription
                            </p>
                        </div>

                        {/* Disconnection Warning */}
                        {disconnectionStatus.isDisconnected && (
                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-orange-700 dark:text-orange-300">HubSpot Disconnected</p>
                                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                            Your subscription is still active, but changes won't sync to HubSpot until you reconnect the app.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddAccount}
                                            className="mt-3 rounded-lg border-orange-300 text-orange-600 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Reconnect to HubSpot
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "p-4 rounded-xl border",
                            disconnectionStatus.isDisconnected
                                ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                                : isSubscribed
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        disconnectionStatus.isDisconnected
                                            ? "bg-orange-500"
                                            : isSubscribed
                                                ? "bg-primary"
                                                : "bg-emerald-500"
                                    )}>
                                        {disconnectionStatus.isDisconnected ? (
                                            <AlertTriangle className="h-5 w-5 text-white" />
                                        ) : (
                                            <Check className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{plan.name} Plan</p>
                                        <p className="text-sm text-muted-foreground">
                                            {disconnectionStatus.isDisconnected
                                                ? "Sync paused - HubSpot app disconnected"
                                                : isSubscribed
                                                    ? `Your subscription is ${userSubscription?.subscriptionStatus || 'active'}`
                                                    : "You are currently on the free plan"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <Badge className={
                                    disconnectionStatus.isDisconnected
                                        ? "bg-orange-500"
                                        : isSubscribed
                                            ? "bg-primary"
                                            : "bg-emerald-500"
                                }>
                                    {disconnectionStatus.isDisconnected
                                        ? 'Disconnected'
                                        : userSubscription?.cancelAtPeriodEnd
                                            ? 'Canceling'
                                            : userSubscription?.subscriptionStatus === 'active'
                                                ? 'Active'
                                                : 'Active'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                            <h4 className="font-medium text-sm">Plan Features</h4>
                            <ul className="space-y-1.5">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            onClick={handleManageOrUpgrade}
                            className="w-full rounded-xl"
                            variant={isSubscribed ? "outline" : "default"}
                            size="lg"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {isSubscribed ? "Manage Subscription" : "Upgrade Plan"}
                        </Button>

                        {!isSubscribed && (
                            <Button
                                onClick={() => setShowPricingModal(true)}
                                variant="ghost"
                                className="w-full rounded-xl"
                            >
                                View All Plans
                            </Button>
                        )}

                        {/* Redeem Code Section */}
                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-primary" />
                                    Have a Promo Code?
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enter a promotional code to upgrade your account
                                </p>
                            </div>

                            {redeemError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                                    {redeemError}
                                </div>
                            )}

                            {redeemSuccess && (
                                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {redeemSuccess}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter promo code (e.g., XXXX-XXXX-XXXX)"
                                    value={redeemCode}
                                    onChange={(e) => {
                                        setRedeemCode(e.target.value.toUpperCase());
                                        setRedeemError("");
                                        setRedeemSuccess("");
                                    }}
                                    className="font-mono rounded-xl"
                                    disabled={isRedeeming}
                                />
                                <Button
                                    onClick={async () => {
                                        if (!redeemCode.trim() || !userEmail) return;

                                        setIsRedeeming(true);
                                        setRedeemError("");
                                        setRedeemSuccess("");

                                        try {
                                            const result = await redeemCodeMutation({
                                                email: userEmail,
                                                code: redeemCode.trim(),
                                            });

                                            setRedeemSuccess(result.message);
                                            setRedeemCode("");

                                            toast({
                                                title: "Code Redeemed!",
                                                description: result.message,
                                            });

                                            // Reload to refresh subscription status
                                            setTimeout(() => window.location.reload(), 1500);
                                        } catch (err: any) {
                                            setRedeemError(err.message || "Failed to redeem code");
                                        } finally {
                                            setIsRedeeming(false);
                                        }
                                    }}
                                    disabled={isRedeeming || !redeemCode.trim()}
                                    className="rounded-xl px-6 gap-2"
                                >
                                    {isRedeeming ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Gift className="h-4 w-4" />
                                            Redeem
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] p-0 gap-0 max-h-[85vh]">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle className="text-xl">Settings</DialogTitle>
                    </DialogHeader>

                    <div className="flex h-[500px]">
                        {/* Sidebar */}
                        <div className="w-[200px] border-r bg-muted/30 p-3 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                {renderContent()}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            <PricingModal
                open={showPricingModal}
                onOpenChange={setShowPricingModal}
            />
        </>
    );
}
