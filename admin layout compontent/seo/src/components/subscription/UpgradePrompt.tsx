/**
 * UpgradePrompt Component
 * 
 * Displays a large feature preview image carousel with upgrade options below.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { PLAN_FEATURES } from '@/lib/planFeatures';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { cn } from '@/lib/utils';
import { PricingModal } from '@/components/modals/PricingModal';

interface UpgradePromptProps {
    requiredPlan: 'basic' | 'pro';
    featureName?: string;
    className?: string;
    compact?: boolean;
    onUpgradeClick?: () => void;
}

// Feature preview images - distinct images for each feature
const FEATURE_IMAGES: Record<string, string[]> = {
    // Categories shows only category-related images
    categories: [
        '/preview-categories.png',
        '/feature-categories.png',
    ],
    // Customer Journey shows only journey visualization images
    customerJourney: [
        '/preview-sankey.png',
        '/preview-touchpoint.png',
        '/preview-transition.png',
    ],
    // Sankey is similar to customer journey
    sankey: [
        '/preview-sankey.png',
        '/preview-transition.png',
    ],
    // Default fallback
    default: [
        '/Hero1.png',
    ],
};

export function UpgradePrompt({
    requiredPlan,
    featureName,
    className,
    compact = false,
    onUpgradeClick,
}: UpgradePromptProps) {
    const { plan, hasUsedTrial, isTrialActive, trialDaysRemaining } = usePlanFeatures();
    const [showPricing, setShowPricing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isEnlarged, setIsEnlarged] = useState(false);

    const targetPlan = PLAN_FEATURES[requiredPlan];
    const images = featureName
        ? FEATURE_IMAGES[featureName] || FEATURE_IMAGES.default
        : FEATURE_IMAGES.default;

    // Auto-advance carousel
    useEffect(() => {
        if (images.length <= 1 || isEnlarged) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, [images.length, isEnlarged]);

    const handleUpgrade = () => {
        if (onUpgradeClick) {
            onUpgradeClick();
        } else {
            setShowPricing(true);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (compact) {
        return (
            <>
                <div className={cn("flex flex-col items-center gap-3 p-6", className)}>
                    <p className="text-sm text-muted-foreground">{targetPlan.name} Feature</p>
                    <Button size="sm" onClick={handleUpgrade} className="gap-2">
                        Unlock Feature
                    </Button>
                </div>
                <PricingModal open={showPricing} onOpenChange={setShowPricing} />
            </>
        );
    }

    return (
        <>
            <div className={cn(
                "flex flex-col items-center justify-center min-h-[70vh] p-6",
                className
            )}>
                {/* Large Picture Frame - Feature Preview Carousel */}
                <div className="w-full max-w-5xl mb-8">
                    <div className="relative bg-zinc-900 dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                        {/* Feature preview image container */}
                        <div className="aspect-[16/9] w-full relative group cursor-pointer" onClick={() => setIsEnlarged(true)}>
                            {/* Current image */}
                            <img
                                src={images[currentImageIndex]}
                                alt="Feature preview"
                                className="w-full h-full object-contain bg-zinc-900"
                            />

                            {/* Zoom hint overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                    <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            {/* Navigation arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}

                            {/* Dots indicator */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                idx === currentImageIndex
                                                    ? "bg-white w-4"
                                                    : "bg-white/50 hover:bg-white/70"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content below the picture frame */}
                <div className="text-center space-y-4">
                    {/* Trial offer */}
                    {!hasUsedTrial && !isTrialActive && (
                        <p className="text-base text-emerald-500 font-medium">
                            🎉 Start with a free 3-day trial!
                        </p>
                    )}

                    {/* Trial active indicator */}
                    {isTrialActive && (
                        <p className="text-base text-amber-500 font-medium">
                            ⏰ Your trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                        </p>
                    )}

                    {/* Unlock Button */}
                    <Button
                        size="lg"
                        onClick={handleUpgrade}
                        className="gap-2 px-8 py-6 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
                    >
                        <Lock className="h-5 w-5" />
                        Unlock This Feature
                        <ArrowRight className="h-5 w-5" />
                    </Button>

                    {/* Current plan info */}
                    <p className="text-sm text-muted-foreground">
                        Your current plan: <span className="font-medium text-foreground">{PLAN_FEATURES[plan]?.name || 'Free'}</span>
                    </p>
                </div>
            </div>

            {/* Enlarged Image Modal */}
            {isEnlarged && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setIsEnlarged(false)}
                >
                    <button
                        onClick={() => setIsEnlarged(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Navigation in enlarged view */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </>
                    )}

                    <img
                        src={images[currentImageIndex]}
                        alt="Feature preview enlarged"
                        className="max-w-full max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Dots in enlarged view */}
                    {images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all",
                                        idx === currentImageIndex
                                            ? "bg-white w-6"
                                            : "bg-white/50 hover:bg-white/70"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pricing Modal */}
            <PricingModal open={showPricing} onOpenChange={setShowPricing} />
        </>
    );
}

export default UpgradePrompt;
