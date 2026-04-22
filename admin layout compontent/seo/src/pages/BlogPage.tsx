import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Tag, Twitter, Linkedin, Github, Mail, Moon, Sun, ArrowRight, Search, Loader2, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Footer } from "@/components/ui/animated-footer";
import { useTheme } from "@/components/theme-provider";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";

export default function BlogPage() {
    const { theme, setTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch published posts from Convex
    const posts = useQuery(api.blog.getPublishedPosts, {});
    const categories = useQuery(api.blog.getCategories);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Filter posts by search and category
    const filteredPosts = posts?.filter((post) => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isLoading = posts === undefined;
    const isEmpty = posts?.length === 0;

    return (
        <>
            <Helmet>
                <title>Blog | TagBase - HubSpot Tag Management</title>
                <meta name="description" content="Stay updated with the latest news, tips, and best practices for tag management in HubSpot. Learn how to maximize your CRM efficiency with TagBase." />
                <meta property="og:title" content="TagBase Blog - HubSpot Tag Management Tips & Insights" />
                <meta property="og:description" content="Discover tips, best practices, and strategies for maximizing your HubSpot tagging and customer journey management." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://tagbase.co/blog" />
            </Helmet>

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
                                asChild
                                className="hidden md:inline-flex"
                            >
                                <Link to="/#features">Features</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="hidden md:inline-flex"
                            >
                                <Link to="/#pricing">Pricing</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="font-semibold hidden md:inline-flex"
                            >
                                Blog
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="hidden md:inline-flex"
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            <Button asChild variant="outline" className="gap-2">
                                <Link to="/">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Home</span>
                                    <span className="sm:hidden">Home</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Blog Header */}
                <section className="pt-28 pb-12 px-4 md:px-6">
                    <div className="container mx-auto max-w-4xl text-center">
                        <Badge variant="secondary" className="mb-6">
                            Latest Updates
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            TagBase Blog
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Stay updated with the latest news, tips, and best practices for tag management in HubSpot. Learn how to maximize your CRM efficiency with TagBase.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                {categories && categories.length > 0 && (
                    <section className="px-4 md:px-6 pb-8">
                        <div className="container mx-auto max-w-6xl">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                    className="rounded-full"
                                >
                                    All Posts
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.name}
                                        variant={selectedCategory === cat.name ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className="rounded-full"
                                    >
                                        {cat.name}
                                        <span className="ml-1 text-xs opacity-70">({cat.count})</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Blog Posts */}
                <section className="flex-1 px-4 md:px-6 pb-16">
                    <div className="container mx-auto max-w-6xl">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : isEmpty ? (
                            // Empty State with Mascot
                            <div className="text-center py-16">
                                <img
                                    src="/no-blog-mascot.png"
                                    alt="No blogs yet"
                                    className="w-64 h-64 mx-auto mb-6 object-contain"
                                />
                                <h2 className="text-2xl font-bold mb-2">No Blog Posts Yet</h2>
                                <p className="text-muted-foreground mb-6">
                                    We're working on some great content for you. Check back soon!
                                </p>
                                <Button asChild>
                                    <Link to="/">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Home
                                    </Link>
                                </Button>
                            </div>
                        ) : filteredPosts?.length === 0 ? (
                            // No Results State
                            <div className="text-center py-16">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h2 className="text-xl font-bold mb-2">No Results Found</h2>
                                <p className="text-muted-foreground mb-4">
                                    No posts match your search criteria.
                                </p>
                                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            // Posts Grid
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts?.map((post) => (
                                    <Card key={post._id} className="rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
                                        <Link to={`/blog/${post.slug}`}>
                                            <div className="aspect-[16/9] w-full overflow-hidden">
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                        <span className="text-4xl">📝</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <CardHeader>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary">{post.category}</Badge>
                                            </div>
                                            <Link to={`/blog/${post.slug}`}>
                                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                        </CardContent>
                                        <CardFooter className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : ""}
                                                </span>
                                                {post.readTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {post.readTime} min
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                to={`/blog/${post.slug}`}
                                                className="flex items-center text-primary text-sm font-medium hover:underline"
                                            >
                                                Read more
                                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
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
                    brandDescription="Seamless tag management for HubSpot. Organize, track, and visualize your customer journey."
                    socialLinks={[
                        {
                            icon: <Twitter className="w-6 h-6" />,
                            href: "https://twitter.com",
                            label: "Twitter",
                        },
                        {
                            icon: <Linkedin className="w-6 h-6" />,
                            href: "https://linkedin.com",
                            label: "LinkedIn",
                        },
                        {
                            icon: <Github className="w-6 h-6" />,
                            href: "https://github.com",
                            label: "GitHub",
                        },
                        {
                            icon: <Mail className="w-6 h-6" />,
                            href: "mailto:support@tagbase.co",
                            label: "Email",
                        },
                    ]}
                    navLinks={[
                        { label: "Features", href: "/#features" },
                        { label: "Pricing", href: "/#pricing" },
                        { label: "Blog", href: "/blog" },
                        { label: "Help Center", href: "/help" },
                        { label: "Privacy Policy", href: "/privacy" },
                        { label: "Terms & Conditions", href: "/terms" },
                        { label: "Cookie Policy", href: "/cookies" },
                    ]}
                    brandIcon={<Tag className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />}
                />
            </main>
        </>
    );
}
