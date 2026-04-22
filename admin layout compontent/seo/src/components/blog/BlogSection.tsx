import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export function BlogSection() {
    const posts = useQuery(api.blog.getPublishedPosts, { limit: 3 });

    const isEmpty = posts?.length === 0;

    return (
        <section id="blog" className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-8 flex flex-col items-center gap-16">
                <div className="text-center">
                    <Badge variant="secondary" className="mb-6">
                        From Our Blog
                    </Badge>
                    <h2 className="mb-4 text-pretty text-3xl font-semibold md:text-4xl lg:text-5xl">
                        Latest Insights & Updates
                    </h2>
                    <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
                        Discover tips, best practices, and strategies for maximizing your HubSpot tagging and customer journey management.
                    </p>
                    <Button variant="link" className="w-full sm:w-auto" asChild>
                        <Link to="/blog">
                            View All Articles
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>

                {isEmpty ? (
                    // Empty State with Mascot
                    <div className="text-center py-8">
                        <img
                            src="/no-blog-mascot.png"
                            alt="No blogs yet"
                            className="w-48 h-48 mx-auto mb-6 object-contain"
                        />
                        <h3 className="text-xl font-bold mb-2">Blog Coming Soon!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We're crafting amazing content for you. Check back soon for tips, guides, and industry insights!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 w-full max-w-6xl">
                        {posts?.map((post) => (
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
                                            {post.publishedAt ? format(new Date(post.publishedAt), "MMM yyyy") : ""}
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
    );
}

export default BlogSection;
