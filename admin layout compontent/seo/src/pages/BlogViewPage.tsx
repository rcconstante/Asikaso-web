import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BlogRenderer } from "@/components/blog/BlogRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Twitter, Linkedin, Github, Mail, Moon, Sun, Loader2 } from "lucide-react";
import { Footer } from "@/components/ui/animated-footer";
import { useTheme } from "@/components/theme-provider";
import { Helmet } from "react-helmet-async";

export default function BlogViewPage() {
    const { slug } = useParams<{ slug: string }>();
    const { theme, setTheme } = useTheme();

    const post = useQuery(api.blog.getPostBySlug, slug ? { slug } : "skip");
    const incrementViews = useMutation(api.blog.incrementViews);

    // Scroll to top and increment views on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        if (post?._id) {
            incrementViews({ postId: post._id });
        }
    }, [post?._id]);

    if (post === undefined) {
        return (
            <main className="min-h-screen flex flex-col bg-background">
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Logo-taghub-nobg.png" alt="TagBase" className="h-10 object-contain" />
                        </Link>
                    </div>
                </nav>
                <div className="flex-1 flex items-center justify-center pt-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    if (post === null) {
        return (
            <main className="min-h-screen flex flex-col bg-background">
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Logo-taghub-nobg.png" alt="TagBase" className="h-10 object-contain" />
                        </Link>
                    </div>
                </nav>
                <div className="flex-1 flex flex-col items-center justify-center pt-20 px-4">
                    <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
                    <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
                    <Button asChild>
                        <Link to="/blog">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Blog
                        </Link>
                    </Button>
                </div>
            </main>
        );
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        image: post.coverImage || "https://tagbase.co/Hero1.png",
        url: `https://tagbase.co/blog/${post.slug}`,
        datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        author: {
            "@type": "Organization",
            name: post.author || "TagBase",
            url: "https://tagbase.co",
        },
        publisher: {
            "@type": "Organization",
            name: "TagBase",
            url: "https://tagbase.co",
            logo: {
                "@type": "ImageObject",
                url: "https://tagbase.co/Logo-taghub-nobg.png",
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://tagbase.co/blog/${post.slug}`,
        },
        ...(post.category ? { articleSection: post.category } : {}),
        ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    };

    return (
        <>
            <Helmet>
                <title>{post.metaTitle || post.title} | TagBase Blog</title>
                <meta name="description" content={post.metaDescription || post.excerpt} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <meta property="og:title" content={post.metaTitle || post.title} />
                <meta property="og:description" content={post.metaDescription || post.excerpt} />
                {post.coverImage && <meta property="og:image" content={post.coverImage} />}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://tagbase.co/blog/${post.slug}`} />
                <meta property="og:site_name" content="TagBase" />
                {post.publishedAt && <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />}
                {post.updatedAt && <meta property="article:modified_time" content={new Date(post.updatedAt).toISOString()} />}
                {post.category && <meta property="article:section" content={post.category} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.metaTitle || post.title} />
                <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
                {post.coverImage && <meta name="twitter:image" content={post.coverImage} />}
                <meta name="twitter:site" content="@TagBase" />
                <link rel="canonical" href={`https://tagbase.co/blog/${post.slug}`} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <main className="min-h-screen flex flex-col bg-background">
                {/* Navigation Header */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Logo-taghub-nobg.png" alt="TagBase" className="h-10 object-contain" />
                        </Link>

                        <div className="flex items-center gap-2 md:gap-4">
                            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                                <Link to="/#features">Features</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                                <Link to="/#pricing">Pricing</Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                                <Link to="/blog">Blog</Link>
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
                                <Link to="/blog">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Blog</span>
                                    <span className="sm:hidden">Blog</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Blog Content */}
                <article className="pt-24 pb-16 px-4 md:px-6">
                    <div className="container mx-auto">
                        <BlogRenderer post={post} />
                    </div>
                </article>

                {/* Footer */}
                <Footer
                    logo={<img src="/Taghub-logo-nobg.png" alt="TagBase Logo" className="h-10 object-contain" />}
                    brandDescription="Seamless tag management for HubSpot. Organize, track, and visualize your customer journey."
                    socialLinks={[
                        { icon: <Twitter className="w-6 h-6" />, href: "https://twitter.com", label: "Twitter" },
                        { icon: <Linkedin className="w-6 h-6" />, href: "https://linkedin.com", label: "LinkedIn" },
                        { icon: <Github className="w-6 h-6" />, href: "https://github.com", label: "GitHub" },
                        { icon: <Mail className="w-6 h-6" />, href: "mailto:support@tagbase.co", label: "Email" },
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
