import { Hero } from "@/components/ui/hero"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogIn, CheckCircle2, Tag, Twitter, Linkedin, Github, Mail, Moon, Sun, Facebook } from "lucide-react"
import { buildOAuthAuthorizationUrl } from "@/config/hubspot"
import { useHubSpot } from "@/contexts/HubSpotContext"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { FeatureTabs } from "@/components/ui/feature-tabs"
import { PricingCard } from "@/components/ui/dark-gradient-pricing"
import { Footer } from "@/components/ui/animated-footer"
import { useTheme } from "@/components/theme-provider"
import { BlogSection } from "@/components/blog/BlogSection"
import { Feature1 } from "@/components/ui/feature-1"

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connectionStatus } = useHubSpot();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [justInstalled, setJustInstalled] = useState(false);

  // Preload all feature images
  useEffect(() => {
    const imagesToPreload = [
      '/feature-quick-tagging.png',
      '/feature-journey-visualization.png',
      '/feature-categories.png',
      '/Hero1.png',
      '/Logo-taghub-nobg.png',
      '/tagbase-mascot.png',
      '/Taghub-logo-nobg.png'
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Handle callback from HubSpot static token install
  useEffect(() => {
    const installSuccess = searchParams.get('installed');
    const portalId = searchParams.get('portalId');

    if (installSuccess === 'true') {
      setJustInstalled(true);
      toast({
        title: "TagBase Installed!",
        description: portalId
          ? `TagBase has been installed to portal ${portalId}. The TagBase card is now available in your CRM sidebar.`
          : "TagBase has been installed. The TagBase card is now available in your CRM sidebar.",
      });
      // Clear URL params
      window.history.replaceState({}, document.title, '/');
    }
  }, [searchParams, toast]);

  const handleHubSpotInstall = () => {
    // Use the static token install URL for the new project-based app
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
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:inline-flex"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:inline-flex"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/blog')}
              className="hidden md:inline-flex"
            >
              Blog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="hidden md:inline-flex"
            >
              Help
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:inline-flex"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {justInstalled ? (
              <Button variant="outline" className="gap-2 text-green-600 border-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Installed Successfully</span>
              </Button>
            ) : connectionStatus.isConnected ? (
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

      {/* Hero Section with padding for fixed nav */}
      <div className="pt-16">
        <Hero
          eyebrow="INTRODUCING TAGBASE - HUBSPOT TAG MANAGEMENT"
          title={
            <span className="font-bold">
              HubSpot Tag Management Software for{" "}
              <span className="text-primary italic">Customer Journey</span>{" "}
              Visualization
            </span>
          }
          subtitle="TagBase brings powerful tagging and customer journey visualization to your HubSpot CRM. Manage tags for contacts, companies, deals and tickets with ease."
          ctaText={justInstalled ? "Installation Complete!" : "Install TagBase to HubSpot"}
          ctaLink="#"
          onCtaClick={handleHubSpotInstall}
          mockupImage={{
            src: "/Hero1.png",
            alt: "TagBase Interface Dashboard",
          }}
        />
      </div>

      {/* Features Section */}
      <div id="features">
        <FeatureTabs />
      </div>

      {/* Blog Section */}
      <BlogSection />

      {/* Pricing Section */}
      <section id="pricing" className="relative overflow-hidden bg-background text-foreground py-20">
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-12 space-y-3">
            <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-base text-muted-foreground md:text-lg">
              Start free and upgrade as your team grows. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <PricingCard
              tier="Free"
              price="$0/mo"
              bestFor="Get started with tagging"
              CTA="Get Started"
              onClick={handleHubSpotInstall}
              benefits={[
                { text: "Up to 10 tags", checked: true },
                { text: "Tag up to 100 contacts", checked: true },
                { text: "Basic tag management", checked: true },
                { text: "Tag Board view", checked: true },
                { text: "Companies, Deals, Tickets", checked: false },
                { text: "Journey visualizations", checked: false },
              ]}
            />
            <PricingCard
              tier="Basic"
              price="$19/mo"
              bestFor="Essential tagging for teams"
              CTA="Start Free Trial"
              onClick={handleHubSpotInstall}
              benefits={[
                { text: "Unlimited tags", checked: true },
                { text: "All object types", checked: true },
                { text: "Categories & organization", checked: true },
                { text: "Tag Board with export", checked: true },
                { text: "Real-time HubSpot sync", checked: true },
                { text: "Email support", checked: true },
              ]}
            />
            <PricingCard
              tier="Pro"
              price="$59/mo"
              bestFor="Analytics for data-driven teams"
              CTA="Start Free Trial"
              onClick={handleHubSpotInstall}
              benefits={[
                { text: "Everything in Basic", checked: true },
                { text: "Customer Journey Visualizations", checked: true },
                { text: "Sankey diagrams", checked: true },
                { text: "Advanced analytics", checked: true },
                { text: "Priority support", checked: true },
                { text: "AI Assistant", checked: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <Feature1
          title="Ready to Transform Your HubSpot Experience?"
          description="Join thousands of teams using TagBase to organize, track, and visualize their customer journeys. Get started in minutes with our seamless HubSpot integration."
          imageSrc="/tagbase-mascot.png"
          imageAlt="TagBase Mascot - Friendly dinosaur with tag icons"
          buttonPrimary={{
            label: "Install TagBase Now",
            onClick: handleHubSpotInstall,
          }}
          buttonSecondary={{
            label: "Contact Sales",
            href: "mailto:support@tagbase.co",
          }}
        />
      </section>

      {/* Footer */}
      <Footer
        logo={
          <img
            src="/Taghub-logo-nobg.png"
            alt="TagBase Logo"
            className="h-10 object-contain"
          />
        }
        brandDescription="TagBase - The ultimate HubSpot tagging solution. Organize contacts, companies, deals & tickets with powerful tag management and customer journey visualization."
        socialLinks={[
          {
            icon: <Twitter className="w-6 h-6" />,
            href: "https://twitter.com/tagbase",
            label: "Twitter",
          },
          {
            icon: <Facebook className="w-6 h-6" />,
            href: "https://www.facebook.com/people/TagBase/61586058194770/",
            label: "Facebook",
          },
          {
            icon: <Linkedin className="w-6 h-6" />,
            href: "https://linkedin.com/company/tagbase",
            label: "LinkedIn",
          },
          {
            icon: <Github className="w-6 h-6" />,
            href: "https://github.com/tagbase",
            label: "GitHub",
          },
          {
            icon: <Mail className="w-6 h-6" />,
            href: "mailto:support@tagbase.co",
            label: "Email",
          },
        ]}
        navLinks={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Blog", href: "/blog" },
          { label: "Documentation", href: "/docs" },
          { label: "Help Center", href: "/help" },
          { label: "Getting Started", href: "/docs?section=getting-started" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms & Conditions", href: "/terms" },
          { label: "Cookie Policy", href: "/cookies" },
        ]}
        brandIcon={<Tag className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />}
      />
    </main>
  )
}
