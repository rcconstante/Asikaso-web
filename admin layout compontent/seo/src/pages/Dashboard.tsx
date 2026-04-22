import { useHubSpot } from "@/contexts/HubSpotContext";
import { useUserSession } from "@/contexts/UserSessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tag as TagIcon,
    Users,
    Building2,
    Handshake,
    Ticket,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Minus,
    BookOpen,
    Play,
    ArrowRight,
    Lightbulb,
    Zap,
    Target,
    BarChart3,
    GitBranch,
    Search,
    AlertCircle,
    Hand,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";

// Helper to get stored previous stats
const getPreviousStats = (): Record<string, number> => {
    try {
        const stored = localStorage.getItem('tagbase_previous_stats');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading previous stats:', e);
    }
    return {};
};

// Helper to store current stats
const storeCurrentStats = (stats: Record<string, number>) => {
    try {
        localStorage.setItem('tagbase_previous_stats', JSON.stringify(stats));
        localStorage.setItem('tagbase_stats_timestamp', new Date().toISOString());
    } catch (e) {
        console.error('Error storing stats:', e);
    }
};

// Calculate change text
const calculateChange = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) {
        return { text: current > 0 ? `+${current} new` : 'No change', positive: current > 0, neutral: current === 0 };
    }

    const diff = current - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);

    if (diff > 0) {
        return { text: `+${percentChange}%`, positive: true, neutral: false };
    } else if (diff < 0) {
        return { text: `${percentChange}%`, positive: false, neutral: false };
    }
    return { text: 'No change', positive: false, neutral: true };
};

// Base stat card configuration - colors match HubSpot object types
const baseStatCardConfig = [
    {
        key: "tags",
        title: "Total Tags",
        icon: TagIcon,
        bgColor: "bg-[#FFE2E5]",
        iconBg: "bg-[#FA5A7D]",
        darkBgColor: "dark:bg-[#FA5A7D]/20",
        darkIconBg: "dark:bg-[#FA5A7D]/30",
        changeColor: "text-[#FA5A7D]",
        negativeColor: "text-red-600",
    },
    {
        key: "contacts",
        title: "Contacts",
        icon: Users,
        // Green for Contacts
        bgColor: "bg-[#DCFCE7]",
        iconBg: "bg-[#22C55E]",
        darkBgColor: "dark:bg-[#22C55E]/20",
        darkIconBg: "dark:bg-[#22C55E]/30",
        changeColor: "text-[#22C55E]",
        negativeColor: "text-red-600",
    },
    {
        key: "companies",
        title: "Companies",
        icon: Building2,
        // Orange for Companies
        bgColor: "bg-[#FFF4DE]",
        iconBg: "bg-[#F97316]",
        darkBgColor: "dark:bg-[#F97316]/20",
        darkIconBg: "dark:bg-[#F97316]/30",
        changeColor: "text-[#F97316]",
        negativeColor: "text-red-600",
    },
    {
        key: "deals",
        title: "Deals",
        icon: Handshake,
        // Blue for Deals
        bgColor: "bg-[#E0F2FE]",
        iconBg: "bg-[#3B82F6]",
        darkBgColor: "dark:bg-[#3B82F6]/20",
        darkIconBg: "dark:bg-[#3B82F6]/30",
        changeColor: "text-[#3B82F6]",
        negativeColor: "text-red-600",
    },
    {
        key: "tickets",
        title: "Tickets",
        icon: Ticket,
        // Red for Tickets
        bgColor: "bg-[#FEE2E2]",
        iconBg: "bg-[#EF4444]",
        darkBgColor: "dark:bg-[#EF4444]/20",
        darkIconBg: "dark:bg-[#EF4444]/30",
        changeColor: "text-[#EF4444]",
        negativeColor: "text-red-600",
    },
];

const quickActions = [
    {
        title: "Create Your First Tag",
        description: "Start organizing your HubSpot data with custom tags",
        icon: TagIcon,
        link: "/tags",
        color: "bg-primary",
    },
    {
        title: "View Tag Board",
        description: "See all your tags in a visual board layout",
        icon: Target,
        link: "/board",
        color: "bg-blue-500",
    },
    {
        title: "Customer Journey",
        description: "Visualize how contacts move through your tags",
        icon: GitBranch,
        link: "/customer-journey",
        color: "bg-purple-500",
    },
    {
        title: "Explore Categories",
        description: "Organize your tags into logical categories",
        icon: BarChart3,
        link: "/categories",
        color: "bg-emerald-500",
    },
];

// Getting started steps will be calculated dynamically based on user progress

const Dashboard = () => {
    const { tags, connectionStatus } = useHubSpot();
    const { firstName, isAuthenticated } = useUserSession();

    // Check if we're loading user data (authenticated but no firstName yet)
    const isLoadingUserData = isAuthenticated && firstName === null;
    const [previousStats, setPreviousStats] = useState<Record<string, number>>({});

    // Calculate current stats - count how many tags were created for each object type
    const stats = useMemo(() => ({
        tags: tags.length,
        contacts: tags.filter(t => t.objectTypes?.includes('contacts')).length,
        companies: tags.filter(t => t.objectTypes?.includes('companies')).length,
        deals: tags.filter(t => t.objectTypes?.includes('deals')).length,
        tickets: tags.filter(t => t.objectTypes?.includes('tickets')).length,
    }), [tags]);

    // Load previous stats on mount
    useEffect(() => {
        const prev = getPreviousStats();
        setPreviousStats(prev);
    }, []);

    // Store current stats periodically (once per session)
    useEffect(() => {
        const lastTimestamp = localStorage.getItem('tagbase_stats_timestamp');
        const now = new Date();

        // Only update if more than 1 hour has passed
        if (!lastTimestamp || (now.getTime() - new Date(lastTimestamp).getTime()) > 3600000) {
            // Wait a bit before storing to ensure we have accurate data
            const timer = setTimeout(() => {
                storeCurrentStats(stats);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [stats]);

    // Calculate stat card config with dynamic changes
    const statCardConfig = useMemo(() => {
        return baseStatCardConfig.map(config => {
            const currentValue = stats[config.key as keyof typeof stats];
            const prevValue = previousStats[config.key];
            const change = calculateChange(currentValue, prevValue);

            return {
                ...config,
                change: change.text,
                positive: change.positive,
                neutral: change.neutral,
            };
        });
    }, [stats, previousStats]);

    // Calculate getting started steps dynamically based on user progress
    const gettingStartedSteps = useMemo(() => {
        // Check if user has viewed customer journey (stored in localStorage)
        const hasViewedJourney = localStorage.getItem('tagbase_viewed_journey') === 'true';

        // Check if any tags have been applied to records
        const totalTaggedRecords = tags.reduce((sum, t) =>
            sum + (t?.contactCount || 0) + (t?.companyCount || 0) + (t?.dealCount || 0) + (t?.ticketCount || 0), 0
        );

        return [
            {
                step: 1,
                title: "Connect HubSpot",
                description: "Link your HubSpot account to sync your contacts, companies, and deals.",
                completed: connectionStatus.isConnected,
            },
            {
                step: 2,
                title: "Create Tags",
                description: "Create custom tags to categorize and organize your CRM data.",
                completed: tags.length > 0,
            },
            {
                step: 3,
                title: "Apply to Records",
                description: "Tag your contacts, companies, and deals for better organization.",
                completed: totalTaggedRecords > 0,
            },
            {
                step: 4,
                title: "Analyze Journeys",
                description: "Use the Customer Journey view to understand contact movements.",
                completed: hasViewedJourney,
            },
        ];
    }, [connectionStatus.isConnected, tags]);

    // Use firstName from context, fallback to "there" if not available or still loading
    const displayName = isLoadingUserData ? "..." : (firstName || 'there');

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Hand className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Welcome, {displayName}!
                    </h1>
                </div>
                <p className="text-muted-foreground text-base md:text-lg">
                    Check out what you can do with HubSpot. Use{" "}
                    <span className="font-medium text-foreground">'Quick Search'</span> to find templates, help articles, and links.
                </p>
            </div>

            {/* Connection Status Alert */}
            {!connectionStatus.isConnected && (
                <Alert className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                        Not connected to HubSpot. Click{" "}
                        <span className="font-medium">Settings</span> in the sidebar to connect your account.
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Overview */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                            Today's Overview
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground mt-1">
                            Your HubSpot tagging summary
                        </p>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
                    {statCardConfig.map((config) => {
                        const Icon = config.icon;
                        const value = stats[config.key as keyof typeof stats];

                        return (
                            <div
                                key={config.key}
                                className={cn(
                                    "stat-card rounded-2xl p-5 min-h-[160px] flex flex-col",
                                    config.bgColor,
                                    config.darkBgColor
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center mb-4",
                                        config.iconBg,
                                        config.darkIconBg
                                    )}
                                >
                                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                    {value}
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    {config.title}
                                </p>
                                <div className="flex items-center gap-1 mt-auto">
                                    {config.neutral ? (
                                        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : config.positive ? (
                                        <ArrowUpRight className={cn("w-3.5 h-3.5", config.changeColor)} />
                                    ) : (
                                        <ArrowDownRight className={cn("w-3.5 h-3.5", config.negativeColor || "text-red-500")} />
                                    )}
                                    <p className={cn(
                                        "text-xs font-medium",
                                        config.neutral ? "text-muted-foreground" : config.positive ? config.changeColor : (config.negativeColor || "text-red-500")
                                    )}>
                                        {config.change}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Getting Started Steps */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Lightbulb className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Getting Started</CardTitle>
                                <CardDescription>Follow these steps to get the most out of TagBase</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {gettingStartedSteps.map((item) => (
                            <div
                                key={item.step}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-xl transition-colors",
                                    item.completed ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                                        item.completed
                                            ? "bg-emerald-500 text-white"
                                            : "bg-muted-foreground/20 text-muted-foreground"
                                    )}
                                >
                                    {item.step}
                                </div>
                                <div className="flex-1">
                                    <h4 className={cn(
                                        "font-medium",
                                        item.completed && "text-emerald-700 dark:text-emerald-300"
                                    )}>
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                                {item.completed && (
                                    <Badge className="bg-emerald-500 text-white">Done</Badge>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Jump right into the most common tasks</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    to={action.link}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                                        action.color
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium group-hover:text-primary transition-colors">
                                            {action.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Learn & Explore</CardTitle>
                                <CardDescription>Resources to help you master TagBase</CardDescription>
                            </div>
                        </div>
                        <Link to="/help">
                            <Button variant="ghost" className="gap-2">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link to="/docs" className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 hover:shadow-md transition-shadow cursor-pointer block">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                            <h4 className="font-semibold mb-1">Documentation</h4>
                            <p className="text-sm text-muted-foreground">
                                Comprehensive guides and tutorials for all features
                            </p>
                        </Link>
                        <Link to="/docs?section=getting-started" className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 hover:shadow-md transition-shadow cursor-pointer block">
                            <Play className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                            <h4 className="font-semibold mb-1">Video Tutorials</h4>
                            <p className="text-sm text-muted-foreground">
                                Step-by-step video walkthroughs for visual learners
                            </p>
                        </Link>
                        <Link to="/help" className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 hover:shadow-md transition-shadow cursor-pointer block">
                            <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                            <h4 className="font-semibold mb-1">FAQ & Support</h4>
                            <p className="text-sm text-muted-foreground">
                                Find answers to common questions and get help
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
