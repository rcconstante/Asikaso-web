import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, User } from "lucide-react";
import { format } from "date-fns";
import './blog-content.css';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: string;
    tags?: string[];
    author: string;
    status: string;
    publishedAt?: number;
    createdAt: number;
    updatedAt: number;
    metaTitle?: string;
    metaDescription?: string;
    readTime?: number;
    views?: number;
}

interface BlogRendererProps {
    post: BlogPost;
    isPreview?: boolean;
}

export function BlogRenderer({ post, isPreview = false }: BlogRendererProps) {
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = useMemo(() => {
        return DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'ul', 'ol', 'li',
                'blockquote', 'pre', 'code',
                'strong', 'em', 'u', 's', 'mark',
                'a', 'img',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'div', 'span',
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel',
                'src', 'alt', 'title', 'width', 'height',
                'class', 'id', 'style',
            ],
        });
    }, [post.content]);

    const formattedDate = post.publishedAt
        ? format(new Date(post.publishedAt), "MMMM d, yyyy")
        : format(new Date(post.createdAt), "MMMM d, yyyy");

    return (
        <article className="max-w-4xl mx-auto">
            {/* Preview Banner */}
            {isPreview && (
                <div className="bg-amber-500 text-white px-4 py-2 rounded-t-xl text-center text-sm font-medium">
                    🔍 Preview Mode - This is how your blog post will appear when published
                </div>
            )}

            {/* Hero Section */}
            <div className="relative">
                {post.coverImage ? (
                    <div className="w-full aspect-[21/9] overflow-hidden rounded-xl mb-8">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-[21/9] bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <span className="text-4xl">📝</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Header */}
            <header className="mb-8">
                {/* Category Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-sm">
                        {post.category}
                    </Badge>
                    {post.status === "draft" && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                            Draft
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl text-muted-foreground mb-6">
                    {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t border-b border-border py-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    {post.readTime && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} min read</span>
                        </div>
                    )}
                    {typeof post.views === "number" && (
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{post.views.toLocaleString()} views</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div
                className="blog-content prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-foreground
          prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-muted prose-pre:border prose-pre:border-border
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-muted-foreground
          prose-img:rounded-xl prose-img:shadow-lg
          prose-hr:border-border
        "
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <footer className="mt-12 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-sm">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </footer>
            )}
        </article>
    );
}

export default BlogRenderer;
