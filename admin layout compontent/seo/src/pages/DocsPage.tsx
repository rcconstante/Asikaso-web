import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen, Tag, Settings, GitBranch, LayoutDashboard, Target, Users,
    Building2, Handshake, Ticket, ChevronRight, ChevronDown, Moon, Sun, LogIn, ArrowRight,
    FileText, Zap, Shield, ArrowLeft, Menu, ExternalLink, CheckCircle2,
    Lightbulb, AlertTriangle, Info, Play, List,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useTheme } from "@/components/theme-provider";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { Footer } from "@/components/ui/animated-footer";
import { cn } from "@/lib/utils";

// Documentation sections with full content
const docSections = [
    {
        id: "product-overview",
        title: "Product Overview",
        icon: BookOpen,
        description: "Complete overview of TagBase features and capabilities",
    },
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Play,
        description: "Learn how to install and set up TagBase",
    },
    {
        id: "tags",
        title: "Tag Management",
        icon: Tag,
        description: "Create, organize, and manage your tags",
    },
    {
        id: "categories",
        title: "Categories",
        icon: Target,
        description: "Organize tags into logical groups",
    },
    {
        id: "objects",
        title: "HubSpot Objects",
        icon: Users,
        description: "Working with Contacts, Companies, Deals, and Tickets",
    },
    {
        id: "customer-journey",
        title: "Customer Journey",
        icon: GitBranch,
        description: "Visualize how records move through tags",
    },
    {
        id: "workflows",
        title: "Workflow Actions",
        icon: Zap,
        description: "Automate tagging with HubSpot workflows",
    },
    {
        id: "manage-plan",
        title: "Manage Your Plan",
        icon: List,
        description: "Subscription plans, billing, and upgrades",
    },
    {
        id: "settings",
        title: "Settings & Configuration",
        icon: Settings,
        description: "Configure TagBase for your needs",
    },
    {
        id: "security",
        title: "Security & Privacy",
        icon: Shield,
        description: "How we protect your data",
    },
];

// Table of contents for each section
const sectionTOC: Record<string, Array<{ id: string; title: string }>> = {
    "product-overview": [
        { id: "what-is-tagbase", title: "What is TagBase?" },
        { id: "key-features", title: "Key Features" },
        { id: "how-it-works", title: "How It Works" },
        { id: "use-cases", title: "Use Cases" },
        { id: "feature-comparison", title: "Feature Comparison" },
        { id: "system-requirements", title: "System Requirements" },
    ],
    "getting-started": [
        { id: "installation", title: "Installation" },
        { id: "connecting", title: "Connecting to HubSpot" },
        { id: "dashboard", title: "Dashboard Overview" },
        { id: "first-tag", title: "Creating Your First Tag" },
    ],
    "tags": [
        { id: "creating-tags", title: "Creating Tags" },
        { id: "editing-tags", title: "Editing Tags" },
        { id: "deleting-tags", title: "Deleting Tags" },
        { id: "tag-colors", title: "Tag Colors" },
        { id: "tag-board", title: "Tag Board View" },
    ],
    "categories": [
        { id: "what-are-categories", title: "What are Categories?" },
        { id: "creating-categories", title: "Creating Categories" },
        { id: "managing-categories", title: "Managing Categories" },
    ],
    "objects": [
        { id: "contacts", title: "Contacts" },
        { id: "companies", title: "Companies" },
        { id: "deals", title: "Deals" },
        { id: "tickets", title: "Tickets" },
        { id: "applying-tags", title: "Applying Tags to Records" },
    ],
    "customer-journey": [
        { id: "journey-overview", title: "Journey Overview" },
        { id: "sankey-diagram", title: "Sankey Diagram" },
        { id: "filtering", title: "Filtering & Date Ranges" },
        { id: "insights", title: "Understanding Insights" },
    ],
    "workflows": [
        { id: "workflow-setup", title: "Setting Up Workflows" },
        { id: "add-tag-action", title: "Add Tag Action" },
        { id: "remove-tag-action", title: "Remove Tag Action" },
        { id: "workflow-examples", title: "Workflow Examples" },
    ],
    "manage-plan": [
        { id: "pricing-plans", title: "Pricing Plans" },
        { id: "plan-details", title: "Plan Details" },
        { id: "upgrading", title: "Upgrading Your Plan" },
        { id: "downgrading", title: "Downgrading Your Plan" },
        { id: "billing", title: "Billing & Invoices" },
        { id: "cancellation", title: "Cancellation Policy" },
        { id: "faq", title: "FAQ" },
    ],
    "settings": [
        { id: "general-settings", title: "General Settings" },
        { id: "hubspot-properties", title: "HubSpot Properties" },
        { id: "data-management", title: "Data Management" },
    ],
    "security": [
        { id: "data-security", title: "Data Security" },
        { id: "privacy", title: "Privacy Policy" },
        { id: "compliance", title: "Compliance" },
    ],
};

// Helper components for documentation
const Tip = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 my-4">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">{children}</div>
    </div>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 my-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">{children}</div>
    </div>
);

const Note = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 my-4">
        <Info className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </div>
);

// Full documentation content for each section
const sectionContent: Record<string, React.ReactNode> = {
    "product-overview": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Product Overview</h1>
                <p className="text-lg text-muted-foreground">A comprehensive guide to TagBase — the powerful tagging system for HubSpot CRM.</p>
            </div>

            <nav className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">On this page</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><a href="#what-is-tagbase" className="hover:text-primary">What is TagBase?</a></li>
                    <li><a href="#key-features" className="hover:text-primary">Key Features</a></li>
                    <li><a href="#how-it-works" className="hover:text-primary">How It Works</a></li>
                    <li><a href="#use-cases" className="hover:text-primary">Use Cases</a></li>
                    <li><a href="#feature-comparison" className="hover:text-primary">Feature Comparison</a></li>
                    <li><a href="#system-requirements" className="hover:text-primary">System Requirements</a></li>
                </ul>
            </nav>

            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden border shadow-lg">
                <img
                    src="/Hero1.png"
                    alt="TagBase Dashboard"
                    className="w-full h-auto"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                    Dashboard Preview
                </div>
            </div>

            <section id="what-is-tagbase">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">What is TagBase?</h2>
                <p className="mb-4">
                    <strong>TagBase</strong> is a powerful, intuitive tagging system designed specifically for HubSpot CRM. It allows you to create custom tags,
                    apply them to your CRM records (Contacts, Companies, Deals, and Tickets), and visualize how records flow through your business processes.
                </p>
                <p className="mb-4">
                    Unlike HubSpot's native properties, TagBase provides a flexible, visual approach to categorization that works across all object types
                    with a unified interface. Tags appear directly in HubSpot as a CRM card, making it seamless to manage from within your existing workflow.
                </p>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">∞</div>
                        <div className="text-sm text-muted-foreground">Unlimited Tags</div>
                        <div className="text-xs text-muted-foreground">(on paid plans)</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">4</div>
                        <div className="text-sm text-muted-foreground">Object Types</div>
                        <div className="text-xs text-muted-foreground">Contacts, Companies, Deals, Tickets</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">Real-time</div>
                        <div className="text-sm text-muted-foreground">HubSpot Sync</div>
                        <div className="text-xs text-muted-foreground">Instant updates</div>
                    </div>
                </div>
            </section>

            <section id="key-features">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Key Features</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Tag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Tag Management</h3>
                            <p className="text-muted-foreground text-sm">Create, edit, and delete tags with custom colors. Organize tags into categories for better management. Apply tags to any CRM object type.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Tag Board</h3>
                            <p className="text-muted-foreground text-sm">Visual overview of all your tags in a beautiful card layout. See tag usage statistics, filter by category, and export tag data.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GitBranch className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Customer Journey Visualization</h3>
                            <p className="text-muted-foreground text-sm">Interactive Sankey diagrams showing how records flow between tags over time. Understand conversion paths and identify bottlenecks.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Workflow Integration</h3>
                            <p className="text-muted-foreground text-sm">Add and remove tags automatically using HubSpot workflows. Trigger based on form submissions, deal stages, or any other criteria.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">HubSpot CRM Card</h3>
                            <p className="text-muted-foreground text-sm">TagBase appears directly in HubSpot record sidebars. Apply and remove tags without leaving HubSpot.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">How It Works</h2>

                {/* Architecture Diagram Placeholder */}
                <div className="rounded-xl border bg-muted/30 p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center p-4 rounded-lg bg-background border">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-2">
                                <Building2 className="h-6 w-6 text-orange-600" />
                            </div>
                            <p className="text-sm font-medium">HubSpot CRM</p>
                            <p className="text-xs text-muted-foreground">Your data source</p>
                        </div>

                        <div className="flex items-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                            <ChevronDown className="h-6 w-6 text-muted-foreground md:hidden" />
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background border">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                                <Tag className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium">TagBase</p>
                            <p className="text-xs text-muted-foreground">Tag management</p>
                        </div>

                        <div className="flex items-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                            <ChevronDown className="h-6 w-6 text-muted-foreground md:hidden" />
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background border">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium">Synced Tags</p>
                            <p className="text-xs text-muted-foreground">Real-time updates</p>
                        </div>
                    </div>
                </div>

                <ol className="list-decimal pl-6 space-y-3 mb-4">
                    <li><strong>Connect HubSpot:</strong> Install TagBase and authorize access to your HubSpot portal via OAuth 2.0</li>
                    <li><strong>Create Tags:</strong> Define tags with names, colors, and object type associations</li>
                    <li><strong>Apply Tags:</strong> Use the CRM card in HubSpot or workflows to apply tags to records</li>
                    <li><strong>Track Changes:</strong> TagBase automatically tracks all tag changes for journey visualization</li>
                    <li><strong>Analyze:</strong> View the Customer Journey page to see how records flow through your tags</li>
                </ol>

                <Tip>Tags are stored as custom properties in HubSpot, ensuring your data stays in your CRM and is accessible via HubSpot's native tools.</Tip>
            </section>

            <section id="use-cases">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Use Cases</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-500" />
                                Sales Teams
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Tag leads by interest level (Hot, Warm, Cold)</li>
                                <li>• Track lead sources and campaigns</li>
                                <li>• Identify decision-makers vs influencers</li>
                                <li>• Segment by industry or company size</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-red-500" />
                                Support Teams
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Categorize tickets by issue type</li>
                                <li>• Tag escalated or priority tickets</li>
                                <li>• Track recurring problems</li>
                                <li>• Identify VIP customers</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                Marketing Teams
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Segment audiences for campaigns</li>
                                <li>• Tag by content interests</li>
                                <li>• Track event attendees</li>
                                <li>• Identify brand advocates</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Handshake className="h-5 w-5 text-orange-500" />
                                Customer Success
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Tag by subscription tier</li>
                                <li>• Identify at-risk accounts</li>
                                <li>• Track onboarding progress</li>
                                <li>• Segment by product usage</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section id="feature-comparison">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Feature Comparison by Plan</h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-semibold">Feature</th>
                                <th className="text-center p-3 font-semibold">Free</th>
                                <th className="text-center p-3 font-semibold">Basic ($19/mo)</th>
                                <th className="text-center p-3 font-semibold">Pro ($59/mo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3">Number of Tags</td>
                                <td className="text-center p-3">10</td>
                                <td className="text-center p-3">Unlimited</td>
                                <td className="text-center p-3">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Tagged Records</td>
                                <td className="text-center p-3">100 contacts</td>
                                <td className="text-center p-3">Unlimited</td>
                                <td className="text-center p-3">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Object Types</td>
                                <td className="text-center p-3">Contacts only</td>
                                <td className="text-center p-3">All 4 types</td>
                                <td className="text-center p-3">All 4 types</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Categories</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Tag Board</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">HubSpot CRM Card</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Workflow Actions</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Export Data</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Customer Journey</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">AI Assistant (Taggie)</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">Priority Support</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3">Email</td>
                                <td className="text-center p-3">Live Chat</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Note>All plans include real-time sync with HubSpot, dark mode support, and secure OAuth authentication.</Note>
            </section>

            <section id="system-requirements">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">System Requirements</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">HubSpot Requirements</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                HubSpot account (Free, Starter, Pro, or Enterprise)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Super Admin or App Marketplace Access permissions
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                CRM enabled (Contacts, Companies, Deals, or Tickets)
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Browser Requirements</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Chrome (latest 2 versions)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Firefox (latest 2 versions)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Safari (latest 2 versions)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Edge (latest 2 versions)
                            </li>
                        </ul>
                    </div>
                </div>

                <Warning>Internet Explorer is not supported. For the best experience, use a modern browser with JavaScript enabled.</Warning>
            </section>
        </div>
    ),

    "getting-started": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Getting Started with TagBase</h1>
                <p className="text-lg text-muted-foreground">Learn how to install TagBase and start organizing your HubSpot data.</p>
            </div>

            <nav className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">On this page</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><a href="#installation" className="hover:text-primary">Installation</a></li>
                    <li><a href="#connecting" className="hover:text-primary">Connecting Your HubSpot Account</a></li>
                    <li><a href="#dashboard" className="hover:text-primary">Understanding the Dashboard</a></li>
                    <li><a href="#first-tag" className="hover:text-primary">Creating Your First Tag</a></li>
                </ul>
            </nav>

            <section id="installation">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Installation</h2>
                <p className="mb-4">TagBase is installed directly from the HubSpot App Marketplace or from our website. No technical setup is required.</p>

                <h3 className="text-lg font-medium mb-3">Step 1: Click Install</h3>
                <p className="mb-4">Visit <a href="https://tagbase.co" className="text-primary hover:underline">tagbase.co</a> and click the <strong>"Install TagBase"</strong> button. You'll be redirected to HubSpot's authorization page.</p>

                <h3 className="text-lg font-medium mb-3">Step 2: Authorize Access</h3>
                <p className="mb-4">Review the permissions TagBase requires and click <strong>"Grant Access"</strong>. We only request the minimum permissions necessary to manage tags on your CRM records.</p>

                <h3 className="text-lg font-medium mb-3">Step 3: Start Using TagBase</h3>
                <p className="mb-4">After authorization, you'll be redirected to your TagBase dashboard. You can immediately start creating tags and organizing your HubSpot data.</p>

                <Tip>TagBase automatically appears as a CRM card in your HubSpot sidebar on Contact, Company, Deal, and Ticket records.</Tip>
            </section>

            <section id="connecting">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Connecting Your HubSpot Account</h2>
                <p className="mb-4">TagBase uses OAuth 2.0 to securely connect to your HubSpot account. This is the same authentication method used by all HubSpot marketplace apps.</p>

                <h3 className="text-lg font-medium mb-3">Required Permissions</h3>
                <p className="mb-2">TagBase requests the following permissions:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>CRM Object Access:</strong> Read and write contacts, companies, deals, and tickets</li>
                    <li><strong>Schema Access:</strong> Create custom properties to store tag data</li>
                    <li><strong>Automation:</strong> Enable workflow actions for automated tagging</li>
                    <li><strong>Account Info:</strong> Basic account information for identification</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Multiple Accounts</h3>
                <p className="mb-4">You can connect multiple HubSpot portals to the same TagBase account. Go to <strong>Settings → Accounts</strong> and click <strong>"Add Another HubSpot Account"</strong> to connect additional portals.</p>
            </section>

            <section id="dashboard">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Understanding the Dashboard</h2>
                <p className="mb-4">The dashboard provides an overview of your tagging activity and quick access to all features.</p>

                <h3 className="text-lg font-medium mb-3">Stats Overview</h3>
                <p className="mb-2">The top section displays key metrics:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Total Tags:</strong> Number of tags you've created</li>
                    <li><strong>Contacts:</strong> Number of tags configured for contacts</li>
                    <li><strong>Companies:</strong> Number of tags configured for companies</li>
                    <li><strong>Deals:</strong> Number of tags configured for deals</li>
                    <li><strong>Tickets:</strong> Number of tags configured for tickets</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
                <p className="mb-4">Use the quick action cards to navigate to common tasks: creating tags, viewing the tag board, exploring customer journeys, and managing categories.</p>

                <h3 className="text-lg font-medium mb-3">Getting Started Guide</h3>
                <p className="mb-4">New users see a step-by-step checklist that tracks your progress. Each step turns green when completed.</p>
            </section>

            <section id="first-tag">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Creating Your First Tag</h2>
                <ol className="list-decimal pl-6 space-y-3 mb-4">
                    <li>Navigate to <strong>Tags Management</strong> in the sidebar</li>
                    <li>Click the <strong>"New Tag"</strong> button</li>
                    <li>Enter a descriptive name for your tag</li>
                    <li>Choose a color for visual identification</li>
                    <li>Select which object types this tag applies to (Contacts, Companies, Deals, Tickets)</li>
                    <li>Click <strong>Save</strong></li>
                </ol>
                <Tip>Use clear, descriptive names like "Lead: Hot" or "Customer: Enterprise" for better organization.</Tip>
            </section>
        </div>
    ),

    "tags": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Tag Management</h1>
                <p className="text-lg text-muted-foreground">Learn how to create, edit, and organize your tags.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Creating Tags</h2>
                <p className="mb-4">Tags are the core of TagBase. Each tag can be applied to one or more HubSpot object types.</p>

                <h3 className="text-lg font-medium mb-3">Tag Properties</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Name:</strong> A descriptive label for the tag (e.g., "Hot Lead", "VIP Customer")</li>
                    <li><strong>Color:</strong> Visual identifier shown in the UI and HubSpot sidebar</li>
                    <li><strong>Object Types:</strong> Which CRM objects this tag can be applied to</li>
                    <li><strong>Category:</strong> Optional grouping for organization</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Best Practices</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Use consistent naming conventions (e.g., "Status: Active", "Status: Churned")</li>
                    <li>Choose colors that are meaningful to your workflow</li>
                    <li>Only enable object types you'll actually use</li>
                    <li>Group related tags into categories</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Editing and Deleting Tags</h2>
                <p className="mb-4">You can modify existing tags at any time:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Tags Management</strong></li>
                    <li>Find the tag you want to edit</li>
                    <li>Click the edit (pencil) icon</li>
                    <li>Make your changes and save</li>
                </ol>
                <Warning>Deleting a tag will remove it from all records. This action cannot be undone.</Warning>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Applying Tags in HubSpot</h2>
                <p className="mb-4">Once created, tags appear in the TagBase CRM card on each record:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Open any Contact, Company, Deal, or Ticket in HubSpot</li>
                    <li>Find the <strong>TagBase</strong> card in the right sidebar</li>
                    <li>Click on available tags to apply them</li>
                    <li>Click applied tags to remove them</li>
                </ol>
                <Note>Tags are synced in real-time between TagBase and HubSpot.</Note>
            </section>
        </div>
    ),

    "categories": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Categories</h1>
                <p className="text-lg text-muted-foreground">Organize your tags into logical groups for better management.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Creating Categories</h2>
                <p className="mb-4">Categories help organize tags when you have many of them:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Navigate to <strong>Categories</strong> in the sidebar</li>
                    <li>Click <strong>"Create Category"</strong></li>
                    <li>Enter a name and optional description</li>
                    <li>Choose a color for the category</li>
                    <li>Save the category</li>
                </ol>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Assigning Tags to Categories</h2>
                <p className="mb-4">When creating or editing a tag, you can assign it to a category. This helps:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Filter tags by category in the management view</li>
                    <li>Group related tags visually in the Tag Board</li>
                    <li>Organize tags in the HubSpot CRM card</li>
                </ul>
                <Tip>Create categories like "Lead Status", "Customer Type", "Industry", or "Priority" to mirror your business processes.</Tip>
            </section>
        </div>
    ),

    "objects": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">HubSpot Objects</h1>
                <p className="text-lg text-muted-foreground">TagBase works with all major HubSpot CRM objects.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Supported Object Types</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-green-600" />
                            <h3 className="font-medium">Contacts</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Tag individual people in your database</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-orange-600" />
                            <h3 className="font-medium">Companies</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Tag organizations and accounts</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Handshake className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium">Deals</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Tag sales opportunities and revenue</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket className="h-5 w-5 text-red-600" />
                            <h3 className="font-medium">Tickets</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Tag support requests and issues</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Object-Specific Tags</h2>
                <p className="mb-4">When creating a tag, select which object types it applies to. This keeps your tagging focused and relevant.</p>
                <Tip>Create separate tags for different objects when the meaning differs. For example, "Priority: High" might mean different things for Deals vs Tickets.</Tip>
            </section>
        </div>
    ),

    "customer-journey": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Customer Journey Visualization</h1>
                <p className="text-lg text-muted-foreground">Understand how records flow through your tags over time.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Understanding the Sankey Diagram</h2>
                <p className="mb-4">The Customer Journey page displays a Sankey diagram that visualizes tag transitions:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Nodes:</strong> Each tag appears as a colored node</li>
                    <li><strong>Flows:</strong> Lines between nodes show how many records moved from one tag to another</li>
                    <li><strong>Width:</strong> Thicker flows indicate more records taking that path</li>
                    <li><strong>Direction:</strong> Flows move left to right, showing progression over time</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">How It Works</h2>
                <p className="mb-4">TagBase tracks every tag change on every record. When you:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Apply a tag to a record → Creates an entry point</li>
                    <li>Add a second tag → Creates a transition from tag 1 to tag 2</li>
                    <li>Remove a tag and add another → Creates another transition</li>
                </ol>
                <p className="mb-4">Over time, these transitions build up to show patterns in how your records progress through your business process.</p>
                <Note>The journey visualization requires tag history data. New installations will see data accumulate over time as you use tags.</Note>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Filters and Controls</h2>
                <p className="mb-4">Use the controls to customize your view:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Date Range:</strong> Filter to specific time periods</li>
                    <li><strong>Object Type:</strong> Focus on Contacts, Companies, Deals, or Tickets</li>
                    <li><strong>Minimum Flow:</strong> Hide small transitions to focus on major patterns</li>
                    <li><strong>Journey Mode:</strong> Switch between Tag Journey and Stage Journey views</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Transition Table</h2>
                <p className="mb-4">Below the diagram, the transition table shows detailed statistics:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>From/To:</strong> The tag transition</li>
                    <li><strong>Count:</strong> Number of records that made this transition</li>
                    <li><strong>Percentage:</strong> Proportion of total transitions</li>
                    <li><strong>Avg Duration:</strong> Average time between tag changes</li>
                </ul>
            </section>
        </div>
    ),

    "workflows": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Workflow Actions</h1>
                <p className="text-lg text-muted-foreground">Automate tagging using HubSpot workflows.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Available Actions</h2>
                <p className="mb-4">TagBase provides two workflow actions:</p>
                <div className="space-y-4 mb-4">
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Add Tag
                        </h3>
                        <p className="text-sm text-muted-foreground">Automatically apply a tag when a record meets certain criteria.</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-red-500" />
                            Remove Tag
                        </h3>
                        <p className="text-sm text-muted-foreground">Automatically remove a tag based on workflow conditions.</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Setting Up a Workflow</h2>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>In HubSpot, go to <strong>Automations → Workflows</strong></li>
                    <li>Create or edit a workflow</li>
                    <li>Add an action and search for <strong>"TagBase"</strong></li>
                    <li>Select <strong>"Add Tag"</strong> or <strong>"Remove Tag"</strong></li>
                    <li>Choose the tag from the dropdown</li>
                    <li>Save and activate the workflow</li>
                </ol>
                <Tip>Use workflows to automatically tag leads based on form submissions, deal stage changes, or lifecycle stage updates.</Tip>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Example Use Cases</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Form submission:</strong> Tag contacts who fill out specific forms</li>
                    <li><strong>Deal stage:</strong> Tag deals that reach "Closed Won"</li>
                    <li><strong>Lead scoring:</strong> Tag high-scoring leads automatically</li>
                    <li><strong>Lifecycle stage:</strong> Tag customers when they become "Opportunity"</li>
                </ul>
            </section>
        </div>
    ),

    "manage-plan": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Manage Your Plan</h1>
                <p className="text-lg text-muted-foreground">Everything you need to know about TagBase subscriptions, billing, and upgrades.</p>
            </div>

            <nav className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">On this page</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><a href="#pricing-plans" className="hover:text-primary">Pricing Plans</a></li>
                    <li><a href="#plan-details" className="hover:text-primary">Plan Details</a></li>
                    <li><a href="#upgrading" className="hover:text-primary">Upgrading Your Plan</a></li>
                    <li><a href="#downgrading" className="hover:text-primary">Downgrading Your Plan</a></li>
                    <li><a href="#billing" className="hover:text-primary">Billing & Payments</a></li>
                    <li><a href="#cancellation" className="hover:text-primary">Cancellation Policy</a></li>
                    <li><a href="#faq" className="hover:text-primary">Billing FAQ</a></li>
                </ul>
            </nav>

            {/* Pricing Overview Image Placeholder */}
            <div className="relative rounded-xl overflow-hidden border bg-gradient-to-br from-green-500/10 via-blue-500/5 to-background">
                <div className="aspect-[21/9] flex items-center justify-center">
                    <div className="flex gap-6 p-8">
                        <div className="text-center p-6 rounded-xl bg-background/80 border shadow-sm">
                            <div className="text-2xl font-bold text-muted-foreground">Free</div>
                            <div className="text-sm text-muted-foreground mt-1">$0/month</div>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-background/80 border shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">Basic</div>
                            <div className="text-sm text-muted-foreground mt-1">$19/month</div>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-primary/10 border-2 border-primary shadow-lg">
                            <Badge className="mb-2">Most Popular</Badge>
                            <div className="text-2xl font-bold text-primary">Pro</div>
                            <div className="text-sm text-muted-foreground mt-1">$59/month</div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                    Pricing Plans Overview
                </div>
            </div>

            <section id="pricing-plans">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Pricing Plans</h2>
                <p className="mb-4">
                    TagBase offers three plans to fit teams of all sizes. All plans include core tagging functionality,
                    HubSpot integration, and real-time sync. Choose the plan that matches your needs.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="relative">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-1">Free</h3>
                            <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            <p className="text-sm text-muted-foreground mb-4">Perfect for trying out TagBase</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Up to 10 tags</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 100 contact limit</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tag Board view</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> HubSpot CRM card</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="relative">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-1">Basic</h3>
                            <p className="text-3xl font-bold mb-4">$19<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            <p className="text-sm text-muted-foreground mb-4">Essential tagging for growing teams</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unlimited tags</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unlimited records</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> All object types</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Categories</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Workflow actions</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Export functionality</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="relative border-primary">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge>Most Popular</Badge>
                        </div>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold mb-1">Pro</h3>
                            <p className="text-3xl font-bold mb-4">$59<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            <p className="text-sm text-muted-foreground mb-4">Advanced analytics for data-driven teams</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Everything in Basic</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Customer Journey</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Sankey diagrams</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> AI Assistant (Taggie)</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Stage journey analytics</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Priority support</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section id="plan-details">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Detailed Plan Comparison</h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-semibold">Feature</th>
                                <th className="text-center p-3 font-semibold">Free</th>
                                <th className="text-center p-3 font-semibold">Basic</th>
                                <th className="text-center p-3 font-semibold">Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b bg-muted/20">
                                <td className="p-3 font-medium" colSpan={4}>Tag Management</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Maximum Tags</td>
                                <td className="text-center p-3">10</td>
                                <td className="text-center p-3">Unlimited</td>
                                <td className="text-center p-3">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Tagged Records</td>
                                <td className="text-center p-3">100 contacts</td>
                                <td className="text-center p-3">Unlimited</td>
                                <td className="text-center p-3">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Categories</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Tag Colors</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>

                            <tr className="border-b bg-muted/20">
                                <td className="p-3 font-medium" colSpan={4}>Object Types</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Contacts</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Companies</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Deals</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Tickets</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>

                            <tr className="border-b bg-muted/20">
                                <td className="p-3 font-medium" colSpan={4}>HubSpot Integration</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">CRM Card</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Real-time Sync</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Workflow Actions</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>

                            <tr className="border-b bg-muted/20">
                                <td className="p-3 font-medium" colSpan={4}>Analytics & Insights</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Tag Board</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Export Data</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Customer Journey</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Sankey Diagrams</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">AI Assistant (Taggie)</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>

                            <tr className="border-b bg-muted/20">
                                <td className="p-3 font-medium" colSpan={4}>Support</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Documentation</td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Email Support</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3">24-48 hours</td>
                                <td className="text-center p-3">24 hours</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 pl-6">Live Chat</td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-red-500">✗</span></td>
                                <td className="text-center p-3"><span className="text-green-500">✓</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="upgrading">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Upgrading Your Plan</h2>
                <p className="mb-4">
                    Upgrading is quick and easy. Your new features are available immediately after upgrading.
                </p>

                <h3 className="text-lg font-medium mb-3">How to Upgrade</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Settings</strong> in the TagBase sidebar</li>
                    <li>Click on <strong>Billing</strong> or <strong>Manage Subscription</strong></li>
                    <li>Select your desired plan (Basic or Pro)</li>
                    <li>Enter your payment information</li>
                    <li>Click <strong>Subscribe</strong> to confirm</li>
                </ol>

                <h3 className="text-lg font-medium mb-3">What Happens When You Upgrade</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Immediate Access:</strong> New features are available instantly</li>
                    <li><strong>Prorated Billing:</strong> You only pay for the remaining time in your billing cycle</li>
                    <li><strong>No Data Loss:</strong> All your existing tags and data remain intact</li>
                    <li><strong>Seamless Transition:</strong> No downtime or interruption to your workflow</li>
                </ul>

                <Tip>Upgrading from Free to Basic or Pro? Your existing tags and settings will carry over automatically.</Tip>
            </section>

            <section id="downgrading">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Downgrading Your Plan</h2>
                <p className="mb-4">
                    If you need to downgrade, you can do so at any time. Changes take effect at the end of your current billing period.
                </p>

                <h3 className="text-lg font-medium mb-3">How to Downgrade</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Settings → Billing</strong></li>
                    <li>Click <strong>Change Plan</strong></li>
                    <li>Select your new plan</li>
                    <li>Confirm the change</li>
                </ol>

                <Warning>
                    <strong>Before downgrading, consider these limitations:</strong>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>Pro → Basic: You'll lose access to Customer Journey visualizations and AI Assistant</li>
                        <li>Basic → Free: Limited to 10 tags and 100 contacts; Companies, Deals, and Tickets access removed</li>
                        <li>Tags exceeding the Free plan limit will become inactive (not deleted)</li>
                    </ul>
                </Warning>
            </section>

            <section id="billing">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Billing & Payments</h2>

                <h3 className="text-lg font-medium mb-3">Payment Methods</h3>
                <p className="mb-4">We accept the following payment methods via our secure payment processor (Stripe):</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Credit Cards (Visa, Mastercard, American Express, Discover)</li>
                    <li>Debit Cards</li>
                    <li>Apple Pay</li>
                    <li>Google Pay</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Billing Cycle</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Monthly Billing:</strong> Charged on the same date each month</li>
                    <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
                    <li><strong>Receipt Emails:</strong> Sent after each successful payment</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Updating Payment Information</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Settings → Billing</strong></li>
                    <li>Click <strong>Manage Payment Method</strong></li>
                    <li>Update your card details</li>
                    <li>Save changes</li>
                </ol>

                <Note>Your payment information is securely stored by Stripe. TagBase never sees or stores your full card number.</Note>
            </section>

            <section id="cancellation">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Cancellation Policy</h2>

                <h3 className="text-lg font-medium mb-3">How to Cancel</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Settings → Billing</strong></li>
                    <li>Click <strong>Cancel Subscription</strong></li>
                    <li>Confirm your cancellation</li>
                </ol>

                <h3 className="text-lg font-medium mb-3">What Happens After Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Access Until End of Period:</strong> You keep full access until your current billing period ends</li>
                    <li><strong>Automatic Downgrade:</strong> After the period ends, you'll be moved to the Free plan</li>
                    <li><strong>Data Retained:</strong> Your tags and data are preserved (subject to Free plan limits)</li>
                    <li><strong>Easy Resubscribe:</strong> You can resubscribe at any time to regain access</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Refund Policy</h3>
                <p className="mb-4">
                    We offer a <strong>14-day money-back guarantee</strong> for first-time subscribers. If you're not satisfied within
                    the first 14 days of your paid subscription, contact us for a full refund.
                </p>
                <p className="mb-4">
                    After 14 days, refunds are not available, but you can cancel at any time to prevent future charges.
                </p>
            </section>

            <section id="faq">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Billing FAQ</h2>

                <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Can I switch plans at any time?</h3>
                        <p className="text-sm text-muted-foreground">
                            Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately with prorated billing.
                            Downgrades take effect at the end of your current billing period.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Do you offer annual billing?</h3>
                        <p className="text-sm text-muted-foreground">
                            Currently, we only offer monthly billing. Annual plans with discounts are coming soon!
                            Subscribe to our newsletter to be notified.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">What happens if my payment fails?</h3>
                        <p className="text-sm text-muted-foreground">
                            We'll retry the payment a few times and send you email notifications. If payment continues to fail,
                            your account will be downgraded to the Free plan after a grace period.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Can I get an invoice for my company?</h3>
                        <p className="text-sm text-muted-foreground">
                            Yes! Invoices are automatically sent to your email after each payment. You can also download
                            past invoices from Settings → Billing → Invoice History.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Is there a free trial for paid plans?</h3>
                        <p className="text-sm text-muted-foreground">
                            We offer a 14-day money-back guarantee instead of a free trial. This allows you to
                            experience the full features of your chosen plan with the confidence of a refund if it's not right for you.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium mb-2">Do you offer discounts for non-profits or education?</h3>
                        <p className="text-sm text-muted-foreground">
                            Yes! We offer a 30% discount for verified non-profit organizations and educational institutions.
                            Contact us at support@tagbase.co with verification to apply.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    ),

    "settings": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings & Configuration</h1>
                <p className="text-lg text-muted-foreground">Configure TagBase to fit your needs.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Account Settings</h2>
                <p className="mb-4">Access settings by clicking the gear icon in the sidebar. Here you can:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>View your connected HubSpot accounts</li>
                    <li>Switch between multiple portal connections</li>
                    <li>Add new HubSpot accounts</li>
                    <li>Manage your subscription</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Multi-Account Management</h2>
                <p className="mb-4">If you manage multiple HubSpot portals:</p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Go to <strong>Settings → Accounts</strong></li>
                    <li>Click <strong>"Add Another HubSpot Account"</strong></li>
                    <li>Authorize the new portal</li>
                    <li>Switch between accounts using the account selector</li>
                </ol>
                <Note>Each HubSpot portal has its own set of tags. Tags are not shared between portals.</Note>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Subscription Plans</h2>
                <div className="space-y-3 mb-4">
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium">Free Plan</h3>
                        <p className="text-sm text-muted-foreground">Up to 10 tags, 100 contacts, basic features</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium">Basic Plan ($19/mo)</h3>
                        <p className="text-sm text-muted-foreground">Unlimited tags, all object types, categories, export</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                        <h3 className="font-medium">Pro Plan ($59/mo)</h3>
                        <p className="text-sm text-muted-foreground">Everything in Basic + Customer Journey visualizations, analytics</p>
                    </div>
                </div>
            </section>
        </div>
    ),

    "security": (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Security & Privacy</h1>
                <p className="text-lg text-muted-foreground">How TagBase protects your data.</p>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">OAuth Authentication</h2>
                <p className="mb-4">TagBase uses OAuth 2.0, the industry-standard protocol for authorization:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>We never see or store your HubSpot password</li>
                    <li>Access tokens are encrypted and securely stored</li>
                    <li>You can revoke access at any time from HubSpot</li>
                    <li>Tokens are automatically refreshed to maintain security</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Data Security</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>All data is encrypted in transit using TLS 1.3</li>
                    <li>Data at rest is encrypted using AES-256</li>
                    <li>We use secure, SOC 2 compliant infrastructure</li>
                    <li>Regular security audits and penetration testing</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Data Processing</h2>
                <p className="mb-4">TagBase processes the following HubSpot data:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Record IDs and tag assignments</li>
                    <li>Tag transition history for journey visualization</li>
                    <li>Basic account information for identification</li>
                </ul>
                <p className="mb-4">We do not access your email content, files, or other sensitive data beyond what's needed for tagging functionality.</p>
                <Note>For complete privacy information, see our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</Note>
            </section>
        </div>
    ),
};

export default function DocsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { connectionStatus } = useHubSpot();
    const { theme, setTheme } = useTheme();
    const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || "getting-started");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedSection]);

    useEffect(() => {
        const section = searchParams.get('section');
        if (section && docSections.find(s => s.id === section)) {
            setSelectedSection(section);
        }
    }, [searchParams]);

    const handleHubSpotInstall = () => {
        window.location.href = buildOAuthAuthorizationUrl();
    };

    const currentSection = docSections.find((s) => s.id === selectedSection);

    return (
        <main className="min-h-screen flex flex-col bg-background">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Logo-taghub-nobg.png" alt="TagBase" className="h-8 object-contain" />
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium">Documentation</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden md:inline-flex">Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/help")} className="hidden md:inline-flex">Help Center</Button>
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        {connectionStatus.isConnected ? (
                            <Button onClick={() => navigate("/dashboard")} size="sm">Dashboard</Button>
                        ) : (
                            <Button onClick={handleHubSpotInstall} size="sm">Install</Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 pt-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex gap-8 py-8">
                        {/* Sidebar Navigation */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <nav className="space-y-1">
                                    {docSections.map((section) => {
                                        const Icon = section.icon;
                                        const isActive = selectedSection === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setSelectedSection(section.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="h-4 w-4 flex-shrink-0" />
                                                <span>{section.title}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>

                        {/* Mobile Nav Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden fixed bottom-4 right-4 z-40 shadow-lg"
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        >
                            <Menu className="h-4 w-4 mr-2" />
                            Navigation
                        </Button>

                        {/* Mobile Navigation */}
                        {mobileNavOpen && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-20 px-4">
                                <Button variant="ghost" size="sm" className="absolute top-20 right-4" onClick={() => setMobileNavOpen(false)}>
                                    Close
                                </Button>
                                <nav className="space-y-1 mt-8">
                                    {docSections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => {
                                                    setSelectedSection(section.id);
                                                    setMobileNavOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all text-left",
                                                    selectedSection === section.id
                                                        ? "bg-primary text-primary-foreground font-medium"
                                                        : "text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                                {section.title}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Content Area */}
                        <article className="flex-1 min-w-0 max-w-3xl">
                            {sectionContent[selectedSection] || (
                                <div className="text-muted-foreground">Content coming soon...</div>
                            )}
                        </article>

                        {/* Right Sidebar - On This Page */}
                        <aside className="hidden xl:block w-56 flex-shrink-0">
                            <div className="sticky top-24">
                                <p className="text-sm font-medium mb-3">On this page</p>
                                {sectionTOC[selectedSection] && sectionTOC[selectedSection].length > 0 ? (
                                    <nav className="space-y-2">
                                        {sectionTOC[selectedSection].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    const element = document.querySelector(`#${item.id}`);
                                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }}
                                                className="block text-xs text-muted-foreground hover:text-primary transition-colors text-left w-full"
                                            >
                                                {item.title}
                                            </button>
                                        ))}
                                    </nav>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No subsections</p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer
                logo={<img src="/Taghub-logo-nobg.png" alt="TagBase Logo" className="h-10 object-contain" />}
                brandDescription="Seamless tag management for HubSpot."
                socialLinks={[]}
                navLinks={[
                    { label: "Home", href: "/" },
                    { label: "Documentation", href: "/docs" },
                    { label: "Help Center", href: "/help" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms", href: "/terms" },
                    { label: "Cookie Policy", href: "/cookies" },
                ]}
                brandIcon={<Tag className="w-8 h-8 text-background" />}
            />
        </main>
    );
}
