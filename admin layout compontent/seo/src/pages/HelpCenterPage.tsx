import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  HelpCircle,
  Search,
  ArrowRight,
  Tag,
  Settings,
  GitBranch,
  LayoutDashboard,
  Mail,
  LogIn,
  Moon,
  Sun,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useTheme } from "@/components/theme-provider";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/ui/animated-footer";
import { cn } from "@/lib/utils";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of TagBase",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    id: "how-tos",
    title: "How Tos",
    description: "Step-by-step guides",
    icon: FileText,
    color: "bg-teal-500",
  },
  {
    id: "product-overview",
    title: "Product Overview",
    description: "Explore all features",
    icon: LayoutDashboard,
    color: "bg-slate-600",
  },
  {
    id: "manage-plan",
    title: "Manage Your Plan",
    description: "Billing and subscription",
    icon: Settings,
    color: "bg-slate-600",
  },
];

const commonTopics = [
  { label: "deduplication", href: "#" },
  { label: "format", href: "#" },
  { label: "csv association", href: "#" },
  { label: "pricing", href: "#" },
  { label: "troubleshoot", href: "#" },
];

const faqItems = [
  {
    question: "How do I install TagBase?",
    answer: "Click the 'Install TagBase' button on our homepage and follow the HubSpot OAuth flow to grant permissions. TagBase will automatically appear in your HubSpot sidebar.",
    keywords: ["install", "setup", "connect", "hubspot", "oauth", "permissions"],
  },
  {
    question: "Is TagBase free to use?",
    answer: "Yes! TagBase offers a free plan with up to 10 tags and 100 contacts. For unlimited tags and advanced features like journey visualizations, check out our Basic ($19/mo) and Pro ($59/mo) plans.",
    keywords: ["free", "pricing", "cost", "plan", "subscription", "payment"],
  },
  {
    question: "How does journey visualization work?",
    answer: "The Customer Journey feature uses Sankey diagrams to show how contacts move through different tags over time, helping you understand conversion paths and drop-off points.",
    keywords: ["journey", "visualization", "sankey", "diagram", "flow", "customer", "conversion"],
  },
  {
    question: "Can I bulk tag multiple records?",
    answer: "Yes! TagBase supports bulk tagging through the HubSpot interface. Select multiple records and apply tags in one action.",
    keywords: ["bulk", "multiple", "records", "mass", "batch", "tagging"],
  },
  {
    question: "How do I create tag categories?",
    answer: "Go to Settings > Categories to create and manage tag categories. Categories help you organize tags for better workflow management.",
    keywords: ["categories", "organize", "group", "settings", "create", "manage"],
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. TagBase follows HubSpot's security guidelines and only accesses the permissions you grant. All data is encrypted in transit and at rest.",
    keywords: ["security", "data", "safe", "privacy", "encryption", "secure"],
  },
  {
    question: "How do I use the Sankey diagram?",
    answer: "Navigate to Customer Journey from the sidebar, select Tag Journey or Stage Journey mode, adjust filters, and hover over elements for detailed metrics. You can also export the diagram as PNG.",
    keywords: ["sankey", "diagram", "journey", "visualization", "export", "filters"],
  },
  {
    question: "What is the Transition Table?",
    answer: "The Transition Table shows detailed metrics for each journey path, including record counts, conversion rates, and average duration between stages.",
    keywords: ["transition", "table", "metrics", "conversion", "rate", "duration"],
  },
  {
    question: "How does Touchpoint Scatter work?",
    answer: "Touchpoint Scatter provides a time-based analysis of customer touchpoints, helping you visualize when and how customers interact with your tags over time.",
    keywords: ["touchpoint", "scatter", "time", "analysis", "chart", "timeline"],
  },
  {
    question: "Can I export my data?",
    answer: "Yes! You can export Sankey diagrams as PNG images from the Customer Journey page, and export tag data from the Tag Board.",
    keywords: ["export", "download", "png", "image", "data", "save"],
  },
];

// Searchable content combining all help resources
interface SearchResult {
  type: 'faq' | 'category' | 'topic' | 'article';
  title: string;
  description: string;
  action: () => void;
  relevance: number;
}

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const { connectionStatus } = useHubSpot();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleHubSpotInstall = () => {
    window.location.href = buildOAuthAuthorizationUrl();
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search FAQs
    faqItems.forEach((faq, index) => {
      const questionMatch = faq.question.toLowerCase().includes(lowerQuery);
      const answerMatch = faq.answer.toLowerCase().includes(lowerQuery);
      const keywordMatch = faq.keywords.some(k => k.includes(lowerQuery) || lowerQuery.includes(k));

      if (questionMatch || answerMatch || keywordMatch) {
        let relevance = 0;
        if (questionMatch) relevance += 3;
        if (keywordMatch) relevance += 2;
        if (answerMatch) relevance += 1;

        results.push({
          type: 'faq',
          title: faq.question,
          description: faq.answer.slice(0, 120) + '...',
          action: () => {
            setExpandedFaq(index);
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
          },
          relevance,
        });
      }
    });

    // Search categories
    helpCategories.forEach((category) => {
      const titleMatch = category.title.toLowerCase().includes(lowerQuery);
      const descMatch = category.description.toLowerCase().includes(lowerQuery);

      if (titleMatch || descMatch) {
        results.push({
          type: 'category',
          title: category.title,
          description: category.description,
          action: () => {
            const route = getCategoryRoute(category.id);
            navigate(route);
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
          },
          relevance: titleMatch ? 3 : 1,
        });
      }
    });

    // Search common topics
    const topicKeywords: Record<string, { title: string; description: string; route: string }> = {
      deduplication: { title: 'Deduplication', description: 'Learn how to avoid duplicate tags and clean up your data', route: '/docs?section=tags' },
      format: { title: 'Format & Organization', description: 'Best practices for formatting and organizing your tags', route: '/docs?section=categories' },
      csv: { title: 'CSV Import/Export', description: 'Import and export tag data using CSV files', route: '/docs?section=tags' },
      association: { title: 'Tag Associations', description: 'Link tags to contacts, companies, deals, and tickets', route: '/docs?section=tags' },
      pricing: { title: 'Pricing & Plans', description: 'View pricing details and subscription options', route: '/#pricing' },
      troubleshoot: { title: 'Troubleshooting', description: 'Common issues and how to resolve them', route: '/docs?section=troubleshooting' },
      tags: { title: 'Tag Management', description: 'Create, edit, and organize your tags', route: '/docs?section=tags' },
      hubspot: { title: 'HubSpot Integration', description: 'Connect and sync with HubSpot CRM', route: '/docs?section=hubspot' },
      journey: { title: 'Customer Journey', description: 'Visualize customer journeys with Sankey diagrams', route: '/docs?section=journey' },
      sankey: { title: 'Sankey Diagrams', description: 'Understand flow visualization in TagBase', route: '/docs?section=journey' },
    };

    Object.entries(topicKeywords).forEach(([keyword, data]) => {
      if (keyword.includes(lowerQuery) || lowerQuery.includes(keyword) || data.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'topic',
          title: data.title,
          description: data.description,
          action: () => {
            navigate(data.route);
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
          },
          relevance: 2,
        });
      }
    });

    // Sort by relevance and remove duplicates
    const uniqueResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .filter((result, index, self) =>
        index === self.findIndex((r) => r.title === result.title)
      )
      .slice(0, 8);

    setSearchResults(uniqueResults);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function for category routes
  const getCategoryRoute = (id: string) => {
    switch (id) {
      case "getting-started":
        return "/docs?section=getting-started";
      case "how-tos":
        return "/docs?section=tags";
      case "product-overview":
        return "/docs";
      case "manage-plan":
        return connectionStatus.isConnected ? "/dashboard" : "/";
      default:
        return "/docs";
    }
  };

  const handleContactSubmit = () => {
    // Open email client with pre-filled data including user's email
    const bodyWithEmail = `From: ${emailAddress}\n\n${emailBody}`;
    const mailtoLink = `mailto:support@tagbase.co?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(bodyWithEmail)}`;
    window.open(mailtoLink, '_blank');

    toast({
      title: "Email client opened",
      description: "Your default email client has been opened with the support request.",
    });

    setContactModalOpen(false);
    setEmailAddress("");
    setEmailSubject("");
    setEmailBody("");
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navigation Header - Same as Landing Page */}
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
              className="hidden md:inline-flex text-primary"
            >
              FAQ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/#pricing')}
              className="hidden md:inline-flex"
            >
              Pricing
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

      {/* Hero Section with Background Image */}
      <section
        className="relative pt-24 pb-16 min-h-[400px] flex items-center"
        style={{
          backgroundImage: 'url(/Helpcenter.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wide uppercase rounded-full bg-primary text-white">
              TagBase Help Center
            </span>

            {/* Main Heading - Left Aligned */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              How can we help<br />you today?
            </h1>

            <p className="text-lg text-slate-300 mb-8">
              Search our knowledge base for answers to common questions
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for help articles, FAQs, guides..."
                    className="pl-12 pr-4 py-6 text-base rounded-lg bg-white/95 dark:bg-slate-800/95 border-0"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value === '') {
                        setSearchResults([]);
                        setIsSearching(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        searchResults[0].action();
                      }
                    }}
                  />
                </div>
                <Button
                  size="lg"
                  className="px-8 rounded-lg"
                  onClick={() => {
                    if (searchResults.length > 0) {
                      searchResults[0].action();
                    }
                  }}
                >
                  Search
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {isSearching && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-border overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={result.action}
                          className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            result.type === 'faq' && "bg-blue-100 dark:bg-blue-900/30",
                            result.type === 'category' && "bg-green-100 dark:bg-green-900/30",
                            result.type === 'topic' && "bg-purple-100 dark:bg-purple-900/30",
                            result.type === 'article' && "bg-orange-100 dark:bg-orange-900/30"
                          )}>
                            {result.type === 'faq' && <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                            {result.type === 'category' && <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />}
                            {result.type === 'topic' && <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                            {result.type === 'article' && <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{result.description}</p>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mt-1 inline-block">
                              {result.type === 'faq' ? 'FAQ' : result.type === 'category' ? 'Category' : result.type === 'topic' ? 'Topic' : 'Article'}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse the categories below</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Common Topics */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-300">Common topics:</span>
              {commonTopics.map((topic, index) => (
                <a
                  key={topic.label}
                  href={topic.href}
                  className="text-primary hover:underline"
                >
                  {topic.label}
                  {index < commonTopics.length - 1 && ","}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              // Map category IDs to routes
              const getCategoryRoute = (id: string) => {
                switch (id) {
                  case "getting-started":
                    return "/docs?section=getting-started";
                  case "how-tos":
                    return "/docs?section=tags";
                  case "product-overview":
                    return "/docs?section=product-overview";
                  case "manage-plan":
                    return "/docs?section=manage-plan";
                  default:
                    return "/docs";
                }
              };

              return (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-all cursor-pointer group border-0 bg-slate-700 dark:bg-slate-800 text-white"
                  onClick={() => navigate(getCategoryRoute(category.id))}
                >
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex flex-col items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links - Documentation, Video, Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-left">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate('/docs')}
            >
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Documentation</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive guides and tutorials</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate('/docs?section=getting-started')}
            >
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step video walkthroughs</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setContactModalOpen(true)}
            >
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Get help from our team</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - Accordion Style */}
      <section id="faq-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team is here to assist you. Reach out and we'll get back to you as soon as possible.
            </p>
            <Button size="lg" className="gap-2" onClick={() => setContactModalOpen(true)}>
              <Mail className="h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Same as Landing Page */}
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
          { label: "Documentation", href: "/docs" },
          { label: "Help Center", href: "/help" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms & Conditions", href: "/terms" },
          { label: "Cookie Policy", href: "/cookies" },
        ]}
        brandIcon={<Tag className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />}
      />

      {/* Contact Support Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Support
            </DialogTitle>
            <DialogDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-address">Your Email</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="your.email@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="What do you need help with?"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                placeholder="Describe your issue or question in detail..."
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleContactSubmit}
              disabled={!emailAddress.trim() || !emailSubject.trim() || !emailBody.trim()}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
