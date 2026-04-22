import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Moon, Sun, LogIn, ArrowRight, ArrowLeft, Tag, CheckCircle2, 
  HelpCircle, Settings, Zap, Shield, ExternalLink, Users,
  Building2, Handshake, Ticket, Copy, Info
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SetupGuidePage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { connectionStatus } = useHubSpot();
  const { toast } = useToast();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleHubSpotInstall = () => {
    window.location.href = buildOAuthAuthorizationUrl();
  };

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
    setTimeout(() => setCopiedStep(null), 2000);
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
              onClick={() => navigate('/docs')}
              className="hidden md:inline-flex"
            >
              Documentation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/support')}
              className="hidden md:inline-flex"
            >
              Support
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
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Header */}
          <div className="mb-10">
            <Badge variant="secondary" className="mb-4">Installation Guide</Badge>
            <h1 className="text-4xl font-bold mb-4">TagBase Setup Guide</h1>
            <p className="text-xl text-muted-foreground">
              Complete guide to installing and configuring TagBase for your HubSpot account.
              Follow these steps to get started in under 5 minutes.
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                What is TagBase?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                TagBase is a powerful tagging system that integrates directly with HubSpot CRM. 
                It allows you to create custom tags, apply them to Contacts, Companies, Deals, and Tickets, 
                and visualize customer journeys through interactive Sankey diagrams.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Contacts</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Companies</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Handshake className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Deals</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Ticket className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Tickets</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
              <CardDescription>Before you begin, make sure you have the following:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>An active <strong>HubSpot account</strong> (Free, Starter, Professional, or Enterprise)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span><strong>Admin permissions</strong> in your HubSpot portal to install apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Access to <strong>CRM objects</strong> (Contacts, Companies, Deals, or Tickets)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Installation Steps */}
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-semibold">Installation Steps</h2>

            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <CardTitle>Click "Install TagBase"</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Start the installation by clicking the button below. You'll be redirected to HubSpot 
                  to authorize the connection.
                </p>
                <Button onClick={handleHubSpotInstall} size="lg" className="gap-2">
                  <LogIn className="h-5 w-5" />
                  Install TagBase
                </Button>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <CardTitle>Authorize HubSpot Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  HubSpot will ask you to grant TagBase access to your CRM data. 
                  Review the permissions and click "Connect app" to proceed.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-3">Permissions requested:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <strong>Read/Write CRM Objects</strong> - To manage tags on records
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <strong>CRM Schema Access</strong> - To create custom properties for tags
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <strong>Owner Information</strong> - To display record owners
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <CardTitle>Access Your Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  After authorization, you'll be redirected to your TagBase dashboard where you can 
                  start creating and managing tags.
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <img 
                    src="/Hero1.png" 
                    alt="TagBase Dashboard Preview" 
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <CardTitle>Create Your First Tag</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Navigate to the Tags page and click "New Tag" to create your first tag. 
                  Choose a name, color, and optionally assign it to a category.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Click the <strong>"Tags"</strong> section in the sidebar</li>
                  <li>Click the <strong>"New Tag"</strong> button</li>
                  <li>Enter a tag name (e.g., "VIP Customer", "Hot Lead")</li>
                  <li>Select a color for easy identification</li>
                  <li>Click <strong>"Create"</strong> to save your tag</li>
                </ol>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <CardTitle>Apply Tags in HubSpot</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Once tags are created, you can apply them to records directly from HubSpot. 
                  TagBase appears as a CRM card in the record sidebar.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Open any Contact, Company, Deal, or Ticket in HubSpot</li>
                  <li>Find the <strong>"TagBase"</strong> card in the sidebar</li>
                  <li>Click to select tags from your available list</li>
                  <li>Tags sync instantly to TagBase and are stored on the record</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Integration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Bonus: Workflow Integration
              </CardTitle>
              <CardDescription>Automate tagging with HubSpot workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                TagBase includes workflow actions that let you automatically add or remove tags 
                based on triggers like form submissions, deal stage changes, or lifecycle updates.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Available Workflow Actions:</p>
                <ul className="grid md:grid-cols-2 gap-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-green-500" />
                    <span>Add Tag to Record</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-red-500" />
                    <span>Remove Tag from Record</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" onClick={() => navigate('/docs?section=workflows')} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Workflow Documentation
              </Button>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="mb-8 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you encounter any issues during setup, our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate('/support')} className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Visit Help Center
                </Button>
                <Button variant="outline" onClick={() => navigate('/docs')} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Documentation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = 'mailto:support@tagbase.io'}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                TagBase follows HubSpot's security guidelines and industry best practices:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  All data encrypted in transit (TLS 1.3) and at rest
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  OAuth 2.0 authentication (no passwords stored)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Minimal permissions requested (only what's needed)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  GDPR and CCPA compliant
                </li>
              </ul>
              <div className="mt-4 flex gap-3">
                <Button variant="link" onClick={() => navigate('/privacy')} className="p-0">
                  Privacy Policy →
                </Button>
                <Button variant="link" onClick={() => navigate('/terms')} className="p-0">
                  Terms of Service →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Install TagBase now and start organizing your HubSpot CRM with powerful tags.
            </p>
            <Button onClick={handleHubSpotInstall} size="lg" className="gap-2">
              <LogIn className="h-5 w-5" />
              Install TagBase for Free
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
