/**
 * LockedFeature Component
 * 
 * Shows a lock icon and tooltip for features that require a higher plan.
 */

import React from 'react';
import { Lock } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlanType, PLAN_FEATURES } from '@/lib/planFeatures';
import { cn } from '@/lib/utils';

interface LockedFeatureProps {
    requiredPlan: 'basic' | 'pro';
    className?: string;
}

export function LockedFeature({ requiredPlan, className }: LockedFeatureProps) {
    const planName = PLAN_FEATURES[requiredPlan]?.name || requiredPlan;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={cn("inline-flex items-center justify-center", className)}>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px]">
                    <p className="text-sm">
                        Requires <span className="font-semibold">{planName}</span> plan
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default LockedFeature;
