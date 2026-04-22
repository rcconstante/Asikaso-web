import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    FileText,
    Eye,
    PlusCircle,
    TrendingUp,
    Edit,
    Clock,
    CheckCircle2,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PATH } from "@/lib/adminConfig";

export default function AdminDashboard() {
    const { sessionToken } = useAdmin();

    const stats = useQuery(
        api.adminAuth.getAdminStats,
        sessionToken ? { sessionToken } : "skip"
    );

    const posts = useQuery(
        api.blog.getAllPosts,
        sessionToken ? { sessionToken } : "skip"
    );

    const recentPosts = posts?.slice(0, 5) || [];

    const statCards = [
        {
            title: "Total Posts",
            value: stats?.totalPosts || 0,
            icon: FileText,
            bgColor: "bg-[#E0F2FE]",
            iconBg: "bg-[#3B82F6]",
            darkBgColor: "dark:bg-[#3B82F6]/20",
        },
        {
            title: "Published",
            value: stats?.publishedPosts || 0,
            icon: CheckCircle2,
            bgColor: "bg-[#DCFCE7]",
            iconBg: "bg-[#22C55E]",
            darkBgColor: "dark:bg-[#22C55E]/20",
        },
        {
            title: "Drafts",
            value: stats?.draftPosts || 0,
            icon: Clock,
            bgColor: "bg-[#FEF3C7]",
            iconBg: "bg-[#F59E0B]",
            darkBgColor: "dark:bg-[#F59E0B]/20",
        },
        {
            title: "Total Views",
            value: stats?.totalViews || 0,
            icon: Eye,
            bgColor: "bg-[#F3E8FF]",
            iconBg: "bg-[#A855F7]",
            darkBgColor: "dark:bg-[#A855F7]/20",
        },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Blog Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your blog posts and content
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link to={`${ADMIN_PATH}/posts/new`}>
                        <PlusCircle className="h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className={cn(
                                "rounded-2xl p-5 min-h-[140px] flex flex-col",
                                stat.bgColor,
                                stat.darkBgColor
                            )}
                        >
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center mb-4",
                                    stat.iconBg
                                )}
                            >
                                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                {stat.value.toLocaleString()}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Posts */}
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Recent Posts
                            </CardTitle>
                            <CardDescription>Your latest blog posts</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`${ADMIN_PATH}/posts`}>View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentPosts.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground">No posts yet</p>
                                <Button asChild className="mt-4" size="sm">
                                    <Link to={`${ADMIN_PATH}/posts/new`}>Create your first post</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPosts.map((post) => (
                                    <Link
                                        key={post._id}
                                        to={`${ADMIN_PATH}/posts/edit/${post._id}`}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {post.category} • {new Date(post.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "text-xs font-medium px-2 py-1 rounded-full",
                                                    post.status === "published"
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                )}
                                            >
                                                {post.status === "published" ? "Published" : "Draft"}
                                            </span>
                                            <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            to={`${ADMIN_PATH}/posts/new`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                <PlusCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                    Create New Post
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Write and publish a new blog article
                                </p>
                            </div>
                        </Link>

                        <Link
                            to={`${ADMIN_PATH}/posts`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                    Manage Posts
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Edit, publish, or delete existing posts
                                </p>
                            </div>
                        </Link>

                        <a
                            href="/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                <Eye className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                    View Public Blog
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    See how your blog looks to visitors
                                </p>
                            </div>
                        </a>

                        <Link
                            to={`${ADMIN_PATH}/settings`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                    Account Settings
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Change password and preferences
                                </p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
