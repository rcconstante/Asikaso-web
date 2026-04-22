/**
 * Plan Features Configuration
 * 
 * This file defines all plan limits and feature access.
 * Used by both frontend (hooks) and backend (Convex) for enforcement.
 */

export type PlanType = 'free' | 'basic' | 'pro';

export type ObjectType = 'contacts' | 'companies' | 'deals' | 'tickets';

export interface PlanFeatures {
    name: string;
    maxTags: number;
    maxRecords: number;
    objectTypes: ObjectType[];
    tagBoard: { view: boolean; export: boolean };
    categories: boolean;
    workflowIntegration: boolean;
    customerJourney: boolean;
    sankey: boolean;
    stageJourney: boolean;
    advancedFiltering: boolean;
    exportAnalytics: boolean;
    aiChat: boolean;
    trial: boolean;
    trialDays: number;
    priceMonthly: number;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
    free: {
        name: 'Free',
        maxTags: 10,
        maxRecords: 100,
        objectTypes: ['contacts'],
        tagBoard: { view: true, export: false },
        categories: false,
        workflowIntegration: false,
        customerJourney: false,
        sankey: false,
        stageJourney: false,
        advancedFiltering: false,
        exportAnalytics: false,
        aiChat: false,
        trial: false,
        trialDays: 0,
        priceMonthly: 0,
    },
    basic: {
        name: 'Basic',
        maxTags: Infinity,
        maxRecords: Infinity,
        objectTypes: ['contacts', 'companies', 'deals', 'tickets'],
        tagBoard: { view: true, export: true },
        categories: true,
        workflowIntegration: true,
        customerJourney: false,
        sankey: false,
        stageJourney: false,
        advancedFiltering: false,
        exportAnalytics: false,
        aiChat: true,
        trial: true,
        trialDays: 3,
        priceMonthly: 19,
    },
    pro: {
        name: 'Pro',
        maxTags: Infinity,
        maxRecords: Infinity,
        objectTypes: ['contacts', 'companies', 'deals', 'tickets'],
        tagBoard: { view: true, export: true },
        categories: true,
        workflowIntegration: true,
        customerJourney: true,
        sankey: true,
        stageJourney: true,
        advancedFiltering: true,
        exportAnalytics: true,
        aiChat: true,
        trial: true,
        trialDays: 3,
        priceMonthly: 59,
    },
};

/**
 * Get the plan features for a given plan type
 */
export function getPlanFeatures(plan: string | undefined | null): PlanFeatures {
    const normalizedPlan = (plan || 'free').toLowerCase() as PlanType;
    return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;
}

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeatureAccess(
    plan: string | undefined | null,
    feature: keyof PlanFeatures
): boolean {
    const features = getPlanFeatures(plan);
    const value = features[feature];

    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value > 0;
    }
    if (typeof value === 'object' && value !== null) {
        // For objects like tagBoard, check if any value is true
        return Object.values(value).some(v => v === true);
    }
    return false;
}

/**
 * Check if a user can create more tags based on their plan
 */
export function canCreateTag(plan: string | undefined | null, currentTagCount: number): boolean {
    const features = getPlanFeatures(plan);
    return currentTagCount < features.maxTags;
}

/**
 * Check if a user can tag more records based on their plan
 */
export function canTagRecord(plan: string | undefined | null, currentRecordCount: number): boolean {
    const features = getPlanFeatures(plan);
    return currentRecordCount < features.maxRecords;
}

/**
 * Check if a user can access a specific object type
 */
export function canAccessObjectType(plan: string | undefined | null, objectType: string): boolean {
    const features = getPlanFeatures(plan);
    return features.objectTypes.includes(objectType as ObjectType);
}

/**
 * Get the minimum plan required for a feature
 */
export function getRequiredPlan(feature: keyof PlanFeatures): PlanType {
    // Check in order: free -> basic -> pro
    if (PLAN_FEATURES.free[feature]) return 'free';
    if (PLAN_FEATURES.basic[feature]) return 'basic';
    return 'pro';
}

/**
 * Check if user is currently in trial period
 */
export function isInTrialPeriod(
    subscriptionStatus: string | undefined,
    trialEndDate: number | undefined
): boolean {
    if (subscriptionStatus !== 'trialing') return false;
    if (!trialEndDate) return false;
    return Date.now() < trialEndDate;
}

/**
 * Get remaining trial days
 */
export function getTrialDaysRemaining(trialEndDate: number | undefined): number {
    if (!trialEndDate) return 0;
    const remaining = trialEndDate - Date.now();
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

/**
 * Get the effective plan considering trial status
 * If user is in trial, they get access to the plan they're trialing
 * If trial expired, they revert to free
 */
export function getEffectivePlan(
    plan: string | undefined | null,
    subscriptionStatus: string | undefined,
    trialEndDate: number | undefined
): PlanType {
    const currentPlan = (plan || 'free').toLowerCase() as PlanType;

    // Active subscription - return the plan
    if (subscriptionStatus === 'active') {
        return currentPlan;
    }

    // Trialing - check if trial is still valid
    if (subscriptionStatus === 'trialing' && trialEndDate && Date.now() < trialEndDate) {
        return currentPlan;
    }

    // Trial expired or no subscription - free plan
    if (subscriptionStatus === 'trialing' || subscriptionStatus === 'trial_expired') {
        return 'free';
    }

    // Default to free if no active subscription
    if (!subscriptionStatus || subscriptionStatus === 'canceled') {
        return 'free';
    }

    return currentPlan;
}
