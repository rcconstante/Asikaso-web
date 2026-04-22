import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogIn, ArrowRight, Tag, Mail, Cookie } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { useEffect } from "react";
import { resetCookieConsent } from "@/components/ui/CookieConsent";

export default function CookiesPage() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { connectionStatus } = useHubSpot();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleHubSpotInstall = () => {
        window.location.href = buildOAuthAuthorizationUrl();
    };

    return (
        <main className="min-h-screen flex flex-col bg-background">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/Logo-taghub-nobg.png"
                            alt="TagBase"
                            className="h-10 object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="hidden md:inline-flex"
                        >
                            Home
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/help')}
                            className="hidden md:inline-flex"
                        >
                            Help Center
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="hidden md:inline-flex"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        {connectionStatus.isConnected ? (
                            <Button onClick={() => navigate('/dashboard')} className="gap-2">
                                <ArrowRight className="h-4 w-4" />
                                <span className="hidden sm:inline">Go to Dashboard</span>
                                <span className="sm:hidden">Dashboard</span>
                            </Button>
                        ) : (
                            <Button onClick={handleHubSpotInstall} className="gap-2">
                                <LogIn className="h-4 w-4" />
                                <span className="hidden sm:inline">Install TagBase</span>
                                <span className="sm:hidden">Install</span>
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Content with proper padding for fixed nav */}
            <div className="flex-1 pt-24 pb-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        {/* Header with icon */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Cookie className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
                                <p className="text-muted-foreground">
                                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
                            <p>
                                Cookies are small text files that are placed on your computer or mobile device when you visit
                                a website. They are widely used to make websites work more efficiently and to provide
                                information to the owners of the site. Cookies help us understand how you interact with
                                TagBase, remember your preferences, and improve your overall experience.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">2. How TagBase Uses Cookies</h2>
                            <p className="mb-4">
                                TagBase uses cookies to enhance your experience when using our HubSpot tag management
                                application. We use cookies for the following purposes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Authentication:</strong> To keep you logged in and maintain your session while using TagBase</li>
                                <li><strong>Preferences:</strong> To remember your settings and preferences (such as dark/light mode)</li>
                                <li><strong>Security:</strong> To protect your account and prevent unauthorized access</li>
                                <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services</li>
                                <li><strong>Performance:</strong> To ensure our application loads quickly and functions properly</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>

                            <div className="space-y-6">
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                        Essential Cookies (Strictly Necessary)
                                    </h3>
                                    <p className="mb-3 text-sm">
                                        These cookies are essential for the website to function properly. You cannot opt out of
                                        these cookies as they are required for basic features like security, network management,
                                        and accessibility.
                                    </p>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 pr-4">Cookie Name</th>
                                                <th className="text-left py-2 pr-4">Purpose</th>
                                                <th className="text-left py-2">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-dashed">
                                                <td className="py-2 pr-4 font-mono text-xs">tagbase_session</td>
                                                <td className="py-2 pr-4">Maintains user session</td>
                                                <td className="py-2">Session</td>
                                            </tr>
                                            <tr className="border-b border-dashed">
                                                <td className="py-2 pr-4 font-mono text-xs">tagbase_cookie_consent</td>
                                                <td className="py-2 pr-4">Stores your cookie preferences</td>
                                                <td className="py-2">1 year</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-xs">hubspot_auth_token</td>
                                                <td className="py-2 pr-4">HubSpot OAuth authentication</td>
                                                <td className="py-2">Session</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                        Analytics Cookies (Performance)
                                    </h3>
                                    <p className="mb-3 text-sm">
                                        These cookies help us understand how visitors interact with our website by collecting
                                        and reporting information anonymously. This helps us improve our services.
                                    </p>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 pr-4">Cookie Name</th>
                                                <th className="text-left py-2 pr-4">Purpose</th>
                                                <th className="text-left py-2">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-dashed">
                                                <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                                                <td className="py-2 pr-4">Google Analytics - Distinguishes users</td>
                                                <td className="py-2">2 years</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                                                <td className="py-2 pr-4">Google Analytics - Distinguishes users</td>
                                                <td className="py-2">24 hours</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                        Marketing Cookies (Targeting)
                                    </h3>
                                    <p className="mb-3 text-sm">
                                        These cookies are used to track visitors across websites. The intention is to display
                                        ads that are relevant and engaging for the individual user.
                                    </p>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 pr-4">Cookie Name</th>
                                                <th className="text-left py-2 pr-4">Purpose</th>
                                                <th className="text-left py-2">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-dashed">
                                                <td className="py-2 pr-4 font-mono text-xs">_fbp</td>
                                                <td className="py-2 pr-4">Facebook Pixel - Ad targeting</td>
                                                <td className="py-2">3 months</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-xs">_gcl_au</td>
                                                <td className="py-2 pr-4">Google Ads conversion tracking</td>
                                                <td className="py-2">3 months</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                            <p className="mb-4">
                                In addition to our own cookies, we may also use various third-party cookies to report
                                usage statistics of the Service and deliver advertisements on and through the Service.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>HubSpot:</strong> For CRM integration and authentication</li>
                                <li><strong>Stripe:</strong> For secure payment processing</li>
                                <li><strong>Google Analytics:</strong> For website analytics (if enabled)</li>
                                <li><strong>Convex:</strong> For real-time database functionality</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
                            <p className="mb-4">
                                You have the right to decide whether to accept or reject cookies. You can manage your
                                cookie preferences in several ways:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li><strong>Cookie Consent Banner:</strong> When you first visit our site, you can choose which types of cookies to accept</li>
                                <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings</li>
                                <li><strong>Opt-Out Links:</strong> Some third-party services offer opt-out mechanisms</li>
                            </ul>

                            <div className="p-4 rounded-lg bg-muted border mb-4">
                                <p className="text-sm mb-3">
                                    <strong>Reset Cookie Preferences:</strong> You can reset your cookie preferences at any time
                                    by clicking the button below. This will clear your current settings and show the cookie
                                    consent banner again.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetCookieConsent}
                                    className="gap-2"
                                >
                                    <Cookie className="h-4 w-4" />
                                    Reset Cookie Preferences
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> If you disable essential cookies, some features of TagBase may not
                                function properly. Disabling analytics cookies will prevent us from understanding how you
                                use our service, which may limit our ability to improve your experience.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">6. Browser Cookie Settings</h2>
                            <p className="mb-4">
                                You can also manage cookies directly through your browser settings. Here are guides for
                                popular browsers:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                            <p>
                                Cookies have different retention periods depending on their purpose. Session cookies are
                                deleted when you close your browser, while persistent cookies remain on your device for a
                                set period or until you delete them. The specific retention periods for each cookie are
                                listed in the tables above.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">8. Legal Basis for Processing</h2>
                            <p>
                                We process cookie data based on your consent for non-essential cookies, and on our
                                legitimate interest in operating and improving our services for essential cookies. You can
                                withdraw your consent at any time by changing your cookie preferences.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time to reflect changes in our practices or
                                for other operational, legal, or regulatory reasons. We will notify you of any material
                                changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                            <p>
                                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                            </p>
                            <p className="mt-2">
                                <strong>Email:</strong> <a href="mailto:support@tagbase.co" className="text-primary hover:underline">support@tagbase.co</a>
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-muted rounded-lg">
                            <p className="text-sm mb-4">
                                By using TagBase, you acknowledge that you have read and understood this Cookie Policy
                                and agree to our use of cookies as described herein.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/privacy" className="text-sm text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                                <Link to="/terms" className="text-sm text-primary hover:underline">
                                    Terms & Conditions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer
                logo={
                    <img
                        src="/Taghub-logo-nobg.png"
                        alt="TagBase Logo"
                        className="h-10 object-contain"
                    />
                }
                brandDescription="Seamless tag management for HubSpot. Organize, track, and visualize your customer journey."
                socialLinks={[
                    {
                        icon: <Mail className="w-6 h-6" />,
                        href: "mailto:support@tagbase.co",
                        label: "Email",
                    },
                ]}
                navLinks={[
                    { label: "Home", href: "/" },
                    { label: "Help Center", href: "/help" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "Cookie Policy", href: "/cookies" },
                ]}
                brandIcon={<Tag className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />}
            />
        </main>
    );
}
