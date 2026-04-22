import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Cookie, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookieConsentProps {
    className?: string;
}

const COOKIE_CONSENT_KEY = "tagbase_cookie_consent";

export function CookieConsent({ className }: CookieConsentProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Always true - cannot be disabled
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show the banner after a short delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const consentData = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleAcceptEssential = () => {
        const consentData = {
            essential: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        const consentData = {
            ...preferences,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
        setIsVisible(false);
        setShowPreferences(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                onClick={() => { }} // Prevent closing by clicking backdrop
            />

            {/* Cookie Consent Banner */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6",
                    "animate-in slide-in-from-bottom-full duration-500",
                    className
                )}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Cookie className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                                    <p className="text-sm text-muted-foreground">Manage your cookie settings</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!showPreferences ? (
                                // Main consent view
                                <>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        We use essential cookies to make our site work. With your consent, we may also use
                                        non-essential cookies to improve user experience and analyze website traffic. By
                                        clicking "Accept," you agree to our website's cookie use as described in our{" "}
                                        <Link to="/cookies" className="text-primary hover:underline font-medium">
                                            Cookie Policy
                                        </Link>
                                        . You can change your cookie settings at any time by clicking "Preferences."
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={handleAcceptAll}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Accept All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleAcceptEssential}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Essential Only
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowPreferences(true)}
                                            className="flex-1 sm:flex-none gap-2"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Preferences
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                // Preferences view
                                <>
                                    <div className="space-y-4 mb-6">
                                        {/* Essential Cookies */}
                                        <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">Essential Cookies</h4>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        Always Active
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    These cookies are necessary for the website to function and cannot be switched off.
                                                    They are usually only set in response to actions made by you such as setting your
                                                    privacy preferences, logging in, or filling in forms.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={true}
                                                    disabled
                                                    className="sr-only"
                                                />
                                                <div className="w-11 h-6 bg-primary rounded-full opacity-70 cursor-not-allowed" />
                                                <div className="absolute top-0.5 left-[22px] w-5 h-5 bg-white rounded-full shadow" />
                                            </div>
                                        </div>

                                        {/* Analytics Cookies */}
                                        <div className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 pr-4">
                                                <h4 className="font-medium mb-1">Analytics Cookies</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    These cookies allow us to count visits and traffic sources so we can measure and
                                                    improve the performance of our site. They help us understand which pages are the
                                                    most and least popular.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                                                className="relative"
                                            >
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full transition-colors",
                                                    preferences.analytics ? "bg-primary" : "bg-muted-foreground/30"
                                                )} />
                                                <div className={cn(
                                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                                    preferences.analytics ? "left-[22px]" : "left-0.5"
                                                )} />
                                            </button>
                                        </div>

                                        {/* Marketing Cookies */}
                                        <div className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 pr-4">
                                                <h4 className="font-medium mb-1">Marketing Cookies</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    These cookies may be set through our site by our advertising partners. They may be
                                                    used by those companies to build a profile of your interests and show you relevant
                                                    adverts on other sites.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                                                className="relative"
                                            >
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full transition-colors",
                                                    preferences.marketing ? "bg-primary" : "bg-muted-foreground/30"
                                                )} />
                                                <div className={cn(
                                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                                    preferences.marketing ? "left-[22px]" : "left-0.5"
                                                )} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={handleSavePreferences}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Save Preferences
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowPreferences(false)}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer links */}
                        <div className="px-6 py-3 bg-muted/30 border-t border-border">
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <Link to="/cookies" className="hover:text-primary hover:underline">
                                    Cookie Policy
                                </Link>
                                <Link to="/privacy" className="hover:text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                                <Link to="/terms" className="hover:text-primary hover:underline">
                                    Terms & Conditions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Export a utility function to reset cookie consent (useful for testing or settings page)
export function resetCookieConsent() {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
}

// Export function to get current cookie preferences
export function getCookiePreferences() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return null;
    try {
        return JSON.parse(consent);
    } catch {
        return null;
    }
}
