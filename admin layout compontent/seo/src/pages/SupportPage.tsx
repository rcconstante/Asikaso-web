import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Moon, Sun, LogIn, ArrowRight, ArrowLeft, HelpCircle, Mail,
  MessageCircle, BookOpen, FileText, ExternalLink, Clock,
  CheckCircle2, Send
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { connectionStatus } = useHubSpot();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleHubSpotInstall = () => {
    window.location.href = buildOAuthAuthorizationUrl();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
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
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Support Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Need help with TagBase? We're here to assist you. Browse our resources or contact our support team.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/docs')}>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and tutorials for all TagBase features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="gap-2 p-0">
                  Browse Docs <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/help')}>
              <CardHeader>
                <HelpCircle className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle>Help Center</CardTitle>
                <CardDescription>
                  FAQs, troubleshooting tips, and quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="gap-2 p-0">
                  View FAQs <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/setup-guide')}>
              <CardHeader>
                <FileText className="h-10 w-10 text-purple-500 mb-2" />
                <CardTitle>Setup Guide</CardTitle>
                <CardDescription>
                  Step-by-step instructions to install and configure TagBase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="gap-2 p-0">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Send us a message and we'll respond within 24-48 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What can we help you with?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For direct inquiries, email our support team:
                  </p>
                  <a 
                    href="mailto:support@tagbase.io" 
                    className="text-primary hover:underline font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    support@tagbase.io
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">24-48 hours for email support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority support for Pro users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Business hours: Mon-Fri, 9AM-6PM CET</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/setup-guide')}
                  >
                    <FileText className="h-4 w-4" />
                    Installation Guide
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/docs?section=workflows')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Workflow Integration
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/help')}
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Popular Topics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
              <CardDescription>Answers to frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/help')}
                >
                  <h3 className="font-medium mb-1">How do I install TagBase?</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step installation guide</p>
                </div>
                <div 
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/help')}
                >
                  <h3 className="font-medium mb-1">What are the pricing plans?</h3>
                  <p className="text-sm text-muted-foreground">Compare Free, Basic, and Pro plans</p>
                </div>
                <div 
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/docs?section=workflows')}
                >
                  <h3 className="font-medium mb-1">How do workflow actions work?</h3>
                  <p className="text-sm text-muted-foreground">Automate tagging with HubSpot workflows</p>
                </div>
                <div 
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/docs?section=customer-journey')}
                >
                  <h3 className="font-medium mb-1">How does Customer Journey work?</h3>
                  <p className="text-sm text-muted-foreground">Visualize how records flow through tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
