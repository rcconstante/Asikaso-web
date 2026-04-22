import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Building2, Loader2, ExternalLink, Gift } from "lucide-react";
import { useUserSession } from "@/contexts/UserSessionContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface PricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const plansData = [
    {
        name: "Free",
        price: "$0",
        period: "/month",
        description: "Get started with tagging",
        icon: Sparkles,
        features: [
            "Up to 10 tags",
            "Tag up to 100 contacts",
            "Basic tag management",
            "Tag Board view",
        ],
        limitedFeatures: [
            "No Companies, Deals, Tickets",
            "No Journey visualizations",
        ],
        buttonText: "Current Plan",
        variant: "outline" as const,
        highlight: false,
        planId: "free",
        hasTrial: false,
    },
    {
        name: "Basic",
        price: "$19",
        period: "/month",
        description: "Essential tagging for teams",
        icon: Zap,
        features: [
            "Unlimited tags",
            "All object types",
            "Categories & organization",
            "Tag Board with export",
            "Real-time HubSpot sync",
            "Email support",
        ],
        limitedFeatures: [],
        buttonText: "Upgrade to Basic",
        variant: "default" as const,
        highlight: true,
        bgColor: "bg-primary/5",
        borderColor: "border-primary",
        badgeColor: "bg-primary",
        planId: "basic",
        hasTrial: true,
    },
    {
        name: "Pro",
        price: "$59",
        period: "/month",
        description: "Analytics for data-driven teams",
        icon: Building2,
        features: [
            "Everything in Basic",
            "Customer Journey Visualizations",
            "Sankey diagrams",
            "Advanced analytics",
            "Priority support",
            "AI Assistant",
        ],
        limitedFeatures: [],
        buttonText: "Upgrade to Pro",
        variant: "outline" as const,
        highlight: false,
        bgColor: "",
        borderColor: "border-muted",
        badgeColor: "",
        planId: "pro",
        hasTrial: true,
    },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
    const { userEmail } = useUserSession();
    const { toast } = useToast();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);

    // Get user's current subscription
    const subscription = useQuery(
        api.subscriptions.getUserSubscription,
        userEmail ? { email: userEmail } : "skip"
    );

    // Get user data to check if trial was used
    const userData = useQuery(
        api.users.getUserByEmail,
        userEmail ? { email: userEmail } : "skip"
    );

    const currentPlan = subscription?.plan || "free";
    const hasUsedTrial = userData?.trialUsed || false;
    const canStartTrial = !hasUsedTrial && currentPlan === "free";

    const handleUpgrade = async (planId: string, startTrial: boolean = false) => {
        if (planId === currentPlan) return;
        if (!userEmail) {
            toast({
                title: "Not logged in",
                description: "Please connect your HubSpot account first.",
                variant: "destructive",
            });
            return;
        }

        setLoadingPlan(planId);

        try {
            const response = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,
                    plan: planId,
                    enableTrial: startTrial && canStartTrial, // Enable 3-day trial if eligible
                    successUrl: `${window.location.origin}/dashboard?subscription=success&plan=${planId}${startTrial ? '&trial=started' : ''}`,
                    cancelUrl: `${window.location.origin}/dashboard?subscription=canceled`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast({
                title: "Checkout failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleManageSubscription = async () => {
        if (!userEmail) return;
        setLoadingPortal(true);

        try {
            const response = await fetch("/api/stripe/customer-portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,
                    returnUrl: `${window.location.origin}/dashboard`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to open customer portal");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to open billing portal.",
                variant: "destructive",
            });
        } finally {
            setLoadingPortal(false);
        }
    };

    // Build plans with current status
    const plans = plansData.map(plan => ({
        ...plan,
        isCurrent: plan.planId === currentPlan,
    }));

    // Filter plans based on current plan
    const visiblePlans = currentPlan === "pro"
        ? plans.filter(p => p.planId === "pro")
        : plans;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-2xl font-bold">
                        {currentPlan === "pro" ? "Your Plan" : "Choose Your Plan"}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {currentPlan === "pro"
                            ? "You have access to all premium features"
                            : canStartTrial
                                ? "Start your free 3-day trial - no charge until trial ends"
                                : "Unlock more features and grow your HubSpot tagging capabilities"
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className={`grid gap-4 py-4 ${visiblePlans.length === 1 ? '' : visiblePlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {visiblePlans.map((plan) => {
                        const Icon = plan.icon;
                        const isLoading = loadingPlan === plan.planId;
                        const isCurrent = plan.isCurrent;
                        const showTrialButton = canStartTrial && plan.hasTrial && !isCurrent;

                        // Determine border and background based on current status
                        const getBorderClass = () => {
                            if (isCurrent) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                            if (plan.highlight) return `${plan.borderColor || 'border-primary'} ${plan.bgColor || 'bg-primary/5'}`;
                            return 'border-border';
                        };

                        return (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${getBorderClass()}`}
                            >
                                {plan.highlight && !isCurrent && (
                                    <Badge className={`absolute -top-2.5 left-1/2 -translate-x-1/2 ${plan.badgeColor || 'bg-primary'}`}>
                                        Most Popular
                                    </Badge>
                                )}
                                {isCurrent && (
                                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500">
                                        Current Plan
                                    </Badge>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-emerald-500 text-white' :
                                        plan.highlight ? 'bg-primary text-white' : 'bg-muted'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{plan.name}</h3>
                                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                    {showTrialButton && (
                                        <span className="ml-2 text-sm text-emerald-600 font-medium">
                                            3 days free
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-2.5 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className={`h-4 w-4 flex-shrink-0 ${isCurrent ? 'text-emerald-500' :
                                                plan.highlight ? 'text-primary' : 'text-emerald-500'
                                                }`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {plan.limitedFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                                            <span className="line-through">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <Button
                                        className="w-full rounded-xl"
                                        variant="outline"
                                        onClick={handleManageSubscription}
                                        disabled={loadingPortal || plan.planId === "free"}
                                    >
                                        {loadingPortal ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : plan.planId === "free" ? (
                                            "Current Plan"
                                        ) : (
                                            <>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Manage Subscription
                                            </>
                                        )}
                                    </Button>
                                ) : showTrialButton ? (
                                    // Show trial button for eligible users
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                            disabled={isLoading}
                                            onClick={() => handleUpgrade(plan.planId, true)}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Redirecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className="h-4 w-4 mr-2" />
                                                    Start Free Trial
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            className="w-full rounded-xl"
                                            variant="ghost"
                                            size="sm"
                                            disabled={isLoading}
                                            onClick={() => handleUpgrade(plan.planId, false)}
                                        >
                                            Skip trial, subscribe now
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full rounded-xl"
                                        variant={plan.highlight ? "default" : "outline"}
                                        disabled={isLoading || plan.planId === "free"}
                                        onClick={() => handleUpgrade(plan.planId, false)}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Redirecting...
                                            </>
                                        ) : (
                                            `Upgrade to ${plan.name}`
                                        )}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-center text-muted-foreground pt-2">
                    {currentPlan !== "free"
                        ? "Manage your subscription, update payment method, or cancel anytime."
                        : hasUsedTrial
                            ? "Subscribe to unlock premium features. Cancel anytime."
                            : "🎉 Try any paid plan free for 3 days. No charge until trial ends. Cancel anytime."
                    }
                </p>
            </DialogContent>
        </Dialog>
    );
}
