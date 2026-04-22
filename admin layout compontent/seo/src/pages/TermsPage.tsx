import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogIn, ArrowRight, Tag, Mail } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { useEffect } from "react";

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

            <p className="text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using TagBase ("the Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these Terms and Conditions, please do
                not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                TagBase is a tag management application for HubSpot CRM that enables users to organize and
                categorize their contacts, companies, deals, and tickets through a tagging system with
                visualization capabilities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. HubSpot Integration</h2>
              <p>
                TagBase integrates with HubSpot CRM through official APIs. By using TagBase, you authorize
                the application to access your HubSpot account data as necessary to provide the Service.
                You are responsible for maintaining the security of your HubSpot account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information when using the Service</li>
                <li>Maintain the security and confidentiality of your account</li>
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Not use the Service for any unlawful or unauthorized purpose</li>
                <li>Not interfere with or disrupt the integrity or performance of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data and Privacy</h2>
              <p>
                TagBase stores tag data and configuration information in Convex database. We do not sell
                or share your data with third parties except as required to provide the Service (e.g.,
                HubSpot API integration). Tag history and activity logs are maintained for functionality
                purposes. For more details, please review our{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by TagBase
                and are protected by international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>
                In no event shall TagBase, its directors, employees, partners, agents, suppliers, or
                affiliates be liable for any indirect, incidental, special, consequential, or punitive
                damages, including loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
              <p>
                While we strive to provide continuous service, we do not guarantee that the Service
                will be uninterrupted, timely, secure, or error-free. We reserve the right to modify,
                suspend, or discontinue the Service at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Pricing and Payments</h2>
              <p>
                Certain features of the Service may be provided for a fee. You agree to pay all fees
                associated with your use of paid features. Fees are subject to change with reasonable
                notice. Refunds may be provided at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice
                or liability, for any reason, including breach of these Terms. Upon termination, your
                right to use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. We will provide
                notice of any material changes by posting the new Terms on this page and updating
                the "Last updated" date. Your continued use of the Service after such modifications
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:{" "}
                <a href="mailto:support@tagbase.co" className="text-primary hover:underline">support@tagbase.co</a>
              </p>
            </section>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <p className="text-sm">
                By using TagBase, you acknowledge that you have read, understood, and agree to be bound
                by these Terms and Conditions.
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
