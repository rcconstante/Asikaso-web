import { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BlogRenderer } from "@/components/blog/BlogRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

export default function BlogPreviewPage() {
    const { postId } = useParams<{ postId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const post = useQuery(
        api.blog.getPostForPreview,
        postId && token ? { postId: postId as Id<"blogPosts">, token } : "skip"
    );

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (post === undefined) {
        return (
            <main className="min-h-screen flex flex-col bg-background">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    if (post === null) {
        return (
            <main className="min-h-screen flex flex-col bg-background">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Preview Not Available</h1>
                        <p className="text-muted-foreground mb-6">
                            This preview link is invalid or has expired. Preview links are valid for 10 minutes.
                        </p>
                        <Button asChild>
                            <Link to="/admin/posts">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Admin
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-background">
            {/* Preview Header */}
            <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-lg">🔍</span>
                    <span className="font-medium">Preview Mode</span>
                    <span className="text-amber-100 text-sm hidden sm:inline">
                        • This is how your post will appear when published
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="bg-white/20 text-white hover:bg-white/30 border-none"
                    >
                        Refresh Preview
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.close()}
                        className="bg-white text-amber-600 hover:bg-white/90"
                    >
                        Close Preview
                    </Button>
                </div>
            </div>

            {/* Blog Content */}
            <article className="py-12 px-4 md:px-6">
                <div className="container mx-auto">
                    <BlogRenderer post={post} isPreview />
                </div>
            </article>
        </main>
    );
}
