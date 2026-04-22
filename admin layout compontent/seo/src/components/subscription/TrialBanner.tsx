/**
 * TrialBanner Component
 * 
 * Shows a banner when user is in trial period with countdown.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Clock, CreditCard, Sparkles } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
    className?: string;
    onDismiss?: () => void;
}

export function TrialBanner({ className, onDismiss }: TrialBannerProps) {
    const { isTrialActive, trialDaysRemaining, trialEndsAt, planName } = usePlanFeatures();
    const [isDismissed, setIsDismissed] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    // Calculate exact time remaining
    useEffect(() => {
        if (!trialEndsAt) return;

        const updateTime = () => {
            const now = Date.now();
            const remaining = trialEndsAt - now;

            if (remaining <= 0) {
                setTimeRemaining('Trial ended');
                return;
            }

            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h remaining`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m remaining`);
            } else {
                setTimeRemaining(`${minutes}m remaining`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [trialEndsAt]);

    // Don't show if not in trial or dismissed
    if (!isTrialActive || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    const handleSubscribe = () => {
        // Navigate to pricing or open checkout
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.open('/pricing', '_blank');
        }
    };

    // Different styles based on urgency
    const isUrgent = trialDaysRemaining <= 1;

    return (
        <div
            className={cn(
                "relative px-4 py-3 text-sm transition-colors",
                isUrgent
                    ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-b border-amber-500/30"
                    : "bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20",
                className
            )}
        >
            <div className="container mx-auto flex items-center justify-between gap-4">
                {/* Left side - Trial info */}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-full",
                        isUrgent ? "bg-amber-500/20" : "bg-primary/20"
                    )}>
                        {isUrgent ? (
                            <Clock className="h-4 w-4 text-amber-500" />
                        ) : (
                            <Sparkles className="h-4 w-4 text-primary" />
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className={cn(
                            "font-medium",
                            isUrgent ? "text-amber-600 dark:text-amber-400" : "text-primary"
                        )}>
                            {planName} Trial
                        </span>

                        <span className="text-muted-foreground hidden sm:inline">•</span>

                        <span className={cn(
                            "text-xs sm:text-sm",
                            isUrgent ? "text-amber-600/80 dark:text-amber-400/80" : "text-muted-foreground"
                        )}>
                            {timeRemaining}
                        </span>
                    </div>
                </div>

                {/* Right side - CTA and dismiss */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSubscribe}
                        className={cn(
                            "gap-1.5 text-xs sm:text-sm",
                            isUrgent && "bg-amber-500 hover:bg-amber-600"
                        )}
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Subscribe Now</span>
                        <span className="sm:hidden">Subscribe</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TrialBanner;
