/**
 * usePlanFeatures Hook
 * 
 * Provides access to the current user's plan features and limits.
 * This is the primary way to check feature access in the frontend.
 */

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUserSession } from '@/contexts/UserSessionContext';
import {
    PlanType,
    PlanFeatures,
    PLAN_FEATURES,
    getPlanFeatures,
    getEffectivePlan,
    getTrialDaysRemaining,
    isInTrialPeriod,
} from '@/lib/planFeatures';

export interface UsePlanFeaturesReturn {
    // Plan info
    plan: PlanType;
    planName: string;
    features: PlanFeatures;
    isLoading: boolean;

    // Trial info
    isTrialActive: boolean;
    trialDaysRemaining: number;
    trialEndsAt: number | undefined;
    hasUsedTrial: boolean;

    // Subscription info
    subscriptionStatus: string | undefined;
    isSubscribed: boolean;

    // Feature checks
    canCreateTag: (currentTagCount: number) => boolean;
    canTagRecord: (currentRecordCount: number) => boolean;
    canAccessObjectType: (objectType: string) => boolean;
    canAccessCategories: boolean;
    canAccessSankey: boolean;
    canAccessJourney: boolean;
    canAccessStageJourney: boolean;
    canExportTagBoard: boolean;
    canExportAnalytics: boolean;
    canUseAIChat: boolean;
    canUseWorkflows: boolean;

    // Limits
    maxTags: number;
    maxRecords: number;
    allowedObjectTypes: string[];
}

export function usePlanFeatures(): UsePlanFeaturesReturn {
    const { userEmail, isLoading: isSessionLoading } = useUserSession();

    // Fetch subscription from Convex
    const subscription = useQuery(
        api.subscriptions.getUserSubscription,
        userEmail ? { email: userEmail } : 'skip'
    );

    // Fetch user data for trial info
    const userData = useQuery(
        api.users.getUserByEmail,
        userEmail ? { email: userEmail } : 'skip'
    );

    const result = useMemo<UsePlanFeaturesReturn>(() => {
        // Default to free if loading
        if (!subscription || !userData) {
            const freeFeatures = PLAN_FEATURES.free;
            return {
                plan: 'free',
                planName: 'Free',
                features: freeFeatures,
                isLoading: subscription === undefined || userData === undefined,

                isTrialActive: false,
                trialDaysRemaining: 0,
                trialEndsAt: undefined,
                hasUsedTrial: false,

                subscriptionStatus: undefined,
                isSubscribed: false,

                canCreateTag: (count) => count < freeFeatures.maxTags,
                canTagRecord: (count) => count < freeFeatures.maxRecords,
                canAccessObjectType: (type) => freeFeatures.objectTypes.includes(type as any),
                canAccessCategories: false,
                canAccessSankey: false,
                canAccessJourney: false,
                canAccessStageJourney: false,
                canExportTagBoard: false,
                canExportAnalytics: false,
                canUseAIChat: false,
                canUseWorkflows: false,

                maxTags: freeFeatures.maxTags,
                maxRecords: freeFeatures.maxRecords,
                allowedObjectTypes: freeFeatures.objectTypes,
            };
        }

        // Get effective plan considering trial status
        const effectivePlan = getEffectivePlan(
            subscription.plan,
            subscription.subscriptionStatus,
            userData.trialEndDate
        );

        const features = getPlanFeatures(effectivePlan);
        const trialActive = isInTrialPeriod(subscription.subscriptionStatus, userData.trialEndDate);
        const daysRemaining = getTrialDaysRemaining(userData.trialEndDate);

        return {
            plan: effectivePlan,
            planName: features.name,
            features,
            isLoading: false,

            isTrialActive: trialActive,
            trialDaysRemaining: daysRemaining,
            trialEndsAt: userData.trialEndDate,
            hasUsedTrial: userData.trialUsed || false,

            subscriptionStatus: subscription.subscriptionStatus,
            isSubscribed: subscription.subscriptionStatus === 'active',

            canCreateTag: (count) => count < features.maxTags,
            canTagRecord: (count) => count < features.maxRecords,
            canAccessObjectType: (type) => features.objectTypes.includes(type as any),
            canAccessCategories: features.categories,
            canAccessSankey: features.sankey,
            canAccessJourney: features.customerJourney,
            canAccessStageJourney: features.stageJourney,
            canExportTagBoard: features.tagBoard.export,
            canExportAnalytics: features.exportAnalytics,
            canUseAIChat: features.aiChat,
            canUseWorkflows: features.workflowIntegration,

            maxTags: features.maxTags,
            maxRecords: features.maxRecords,
            allowedObjectTypes: features.objectTypes,
        };
    }, [subscription, userData]);

    return {
        ...result,
        isLoading: isSessionLoading || result.isLoading,
    };
}

export default usePlanFeatures;
