/**
 * PlanBadge Component
 * 
 * Displays the user's current plan with appropriate styling.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, User } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
    className?: string;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ className, showIcon = true, size = 'md' }: PlanBadgeProps) {
    const { plan, planName, isTrialActive, trialDaysRemaining, isLoading } = usePlanFeatures();

    if (isLoading) {
        return (
            <Badge variant="outline" className={cn("animate-pulse", className)}>
                <span className="opacity-50">Loading...</span>
            </Badge>
        );
    }

    const getPlanConfig = () => {
        switch (plan) {
            case 'pro':
                return {
                    icon: Crown,
                    variant: 'default' as const,
                    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600',
                };
            case 'basic':
                return {
                    icon: Zap,
                    variant: 'default' as const,
                    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600',
                };
            default:
                return {
                    icon: User,
                    variant: 'secondary' as const,
                    className: '',
                };
        }
    };

    const config = getPlanConfig();
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge
            variant={config.variant}
            className={cn(
                sizeClasses[size],
                "gap-1 font-medium",
                config.className,
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {planName}
            {isTrialActive && (
                <span className="ml-1 opacity-80">
                    ({trialDaysRemaining}d trial)
                </span>
            )}
        </Badge>
    );
}

export default PlanBadge;
