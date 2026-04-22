/**
 * FeatureGate Component
 * 
 * Conditionally renders children based on the user's plan.
 * Shows upgrade prompt or custom fallback when feature is not accessible.
 */

import React from 'react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { PlanType, PlanFeatures } from '@/lib/planFeatures';
import { UpgradePrompt } from './UpgradePrompt';
import { Loader2 } from 'lucide-react';

export interface FeatureGateProps {
    /**
     * The feature to check access for
     */
    feature?: keyof Omit<PlanFeatures, 'name' | 'maxTags' | 'maxRecords' | 'objectTypes' | 'tagBoard' | 'priceMonthly' | 'trialDays' | 'trial'>;

    /**
     * Minimum required plan (alternative to feature check)
     */
    requiredPlan?: 'basic' | 'pro';

    /**
     * Content to show when user has access
     */
    children: React.ReactNode;

    /**
     * Custom fallback when access is denied
     * If not provided, shows UpgradePrompt
     */
    fallback?: React.ReactNode;

    /**
     * Show loading spinner while plan data loads
     */
    showLoading?: boolean;

    /**
     * Custom class name for the wrapper
     */
    className?: string;

    /**
     * If true, still renders children but with disabled styling
     * Useful for showing locked UI elements
     */
    showLocked?: boolean;
}

export function FeatureGate({
    feature,
    requiredPlan,
    children,
    fallback,
    showLoading = true,
    className,
    showLocked = false,
}: FeatureGateProps) {
    const { plan, features, isLoading, isTrialActive } = usePlanFeatures();

    // Show loading state
    if (isLoading && showLoading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className || ''}`}>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Determine if user has access
    let hasAccess = false;
    let minPlan: PlanType = 'basic';

    if (requiredPlan) {
        // Check by required plan
        const planOrder: PlanType[] = ['free', 'basic', 'pro'];
        const userPlanIndex = planOrder.indexOf(plan);
        const requiredPlanIndex = planOrder.indexOf(requiredPlan);
        hasAccess = userPlanIndex >= requiredPlanIndex;
        minPlan = requiredPlan;
    } else if (feature) {
        // Check by feature
        hasAccess = !!features[feature];

        // Determine minimum plan for this feature
        if (features.sankey || features.customerJourney || features.stageJourney) {
            minPlan = 'pro';
        } else {
            minPlan = 'basic';
        }
    } else {
        // No feature or plan specified - allow access
        hasAccess = true;
    }

    // User has access - render children
    if (hasAccess) {
        return <>{children}</>;
    }

    // Show locked version if requested
    if (showLocked) {
        return (
            <div className={`relative ${className || ''}`}>
                <div className="opacity-50 pointer-events-none select-none blur-[1px]">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                    <UpgradePrompt requiredPlan={minPlan} compact />
                </div>
            </div>
        );
    }

    // Show custom fallback or upgrade prompt
    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <UpgradePrompt
            requiredPlan={minPlan}
            featureName={feature as string}
            className={className}
        />
    );
}

/**
 * HOC version of FeatureGate for wrapping entire components
 */
export function withFeatureGate<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: Omit<FeatureGateProps, 'children'>
) {
    return function FeatureGatedComponent(props: P) {
        return (
            <FeatureGate {...options}>
                <WrappedComponent {...props} />
            </FeatureGate>
        );
    };
}

export default FeatureGate;
