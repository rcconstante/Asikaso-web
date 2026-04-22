import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogIn, ArrowRight, Tag, Mail } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { useEffect } from "react";

export default function PrivacyPage() {
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
                        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                        <p className="text-muted-foreground mb-6">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                            <p>
                                TagBase ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                                explains how we collect, use, disclose, and safeguard your information when you use our
                                tag management application for HubSpot CRM.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                            <p className="mb-4">We collect information in the following ways:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Account Information:</strong> When you connect your HubSpot account, we receive your portal ID, account name, and authorized scopes.</li>
                                <li><strong>CRM Data:</strong> We access contacts, companies, deals, and tickets as permitted by your HubSpot authorization to provide tagging functionality.</li>
                                <li><strong>Tag Data:</strong> Tags you create, their assignments, and related metadata are stored in our database.</li>
                                <li><strong>Usage Data:</strong> We collect information about how you interact with our application to improve our services.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                            <p className="mb-4">We use the collected information to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide and maintain our tag management services</li>
                                <li>Sync tags between our application and HubSpot CRM</li>
                                <li>Generate customer journey visualizations and analytics</li>
                                <li>Improve and optimize our application</li>
                                <li>Communicate with you about service updates</li>
                                <li>Provide customer support</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                            <p>
                                Your data is stored securely using industry-standard encryption. We use Convex for
                                database storage with enterprise-grade security measures. Tag data is synced with
                                HubSpot through their official API using secure OAuth 2.0 authentication.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
                            <p className="mb-4">We do not sell your personal data. We may share information with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>HubSpot:</strong> Tag data is synced to your HubSpot account as custom properties.</li>
                                <li><strong>Service Providers:</strong> We use trusted third-party services (e.g., hosting, analytics) that may process data on our behalf.</li>
                                <li><strong>Legal Requirements:</strong> We may disclose data if required by law or to protect our rights.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                            <p className="mb-4">You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access and receive a copy of your data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to or restrict processing of your data</li>
                                <li>Disconnect your HubSpot account at any time</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">7. HubSpot Integration</h2>
                            <p>
                                Our application integrates with HubSpot CRM through their official API. When you
                                authorize TagBase, you grant us permission to read and write specific data types
                                as outlined during the OAuth authorization process. You can revoke this access
                                at any time through your HubSpot account settings.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
                            <p>
                                We use essential cookies to maintain your session and preferences. We may use
                                analytics tools to understand how users interact with our application. You can
                                control cookie settings through your browser.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
                            <p>
                                We retain your data for as long as your account is active or as needed to provide
                                services. If you disconnect your HubSpot account, we will delete your data within
                                30 days, except where retention is required by law.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                            <p>
                                Our services are not intended for users under 16 years of age. We do not knowingly
                                collect personal information from children.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                changes by posting the new Privacy Policy on this page and updating the "Last
                                updated" date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy or our data practices, please
                                contact us at:
                            </p>
                            <p className="mt-2">
                                <strong>Email:</strong> <a href="mailto:support@tagbase.co" className="text-primary hover:underline">support@tagbase.co</a>
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-muted rounded-lg">
                            <p className="text-sm">
                                By using TagBase, you acknowledge that you have read and understood this Privacy
                                Policy and agree to our collection, use, and disclosure of your information as
                                described herein.
                            </p>
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
