import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
    PlusCircle,
    Search,
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    CheckCircle2,
    XCircle,
    FileText,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import { ADMIN_PATH } from "@/lib/adminConfig";

export default function AdminBlogList() {
    const { sessionToken } = useAdmin();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [deletePostId, setDeletePostId] = useState<Id<"blogPosts"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const posts = useQuery(
        api.blog.getAllPosts,
        sessionToken ? { sessionToken } : "skip"
    );

    const deletePostMutation = useMutation(api.blog.deletePost);
    const publishPostMutation = useMutation(api.blog.publishPost);
    const unpublishPostMutation = useMutation(api.blog.unpublishPost);
    const generatePreviewTokenMutation = useMutation(api.blog.generatePreviewToken);

    const filteredPosts = posts?.filter(
        (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deletePostId || !sessionToken) return;
        setIsDeleting(true);
        try {
            await deletePostMutation({ sessionToken, postId: deletePostId });
            toast({
                title: "Post deleted",
                description: "The blog post has been deleted successfully.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete post",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeletePostId(null);
        }
    };

    const handlePublish = async (postId: Id<"blogPosts">) => {
        if (!sessionToken) return;
        try {
            await publishPostMutation({ sessionToken, postId });
            toast({
                title: "Post published",
                description: "The blog post is now live.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to publish post",
                variant: "destructive",
            });
        }
    };

    const handleUnpublish = async (postId: Id<"blogPosts">) => {
        if (!sessionToken) return;
        try {
            await unpublishPostMutation({ sessionToken, postId });
            toast({
                title: "Post unpublished",
                description: "The blog post is now a draft.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to unpublish post",
                variant: "destructive",
            });
        }
    };

    const handlePreview = async (postId: Id<"blogPosts">) => {
        if (!sessionToken) return;
        try {
            const token = await generatePreviewTokenMutation({ sessionToken, postId });
            window.open(`/blog/preview/${postId}?token=${token}`, "_blank");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to generate preview",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        All Posts
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your blog posts
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link to={`${ADMIN_PATH}/posts/new`}>
                        <PlusCircle className="h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                />
            </div>

            {/* Posts Table */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Blog Posts
                        {filteredPosts && (
                            <Badge variant="secondary" className="ml-2">
                                {filteredPosts.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!posts ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredPosts?.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? "No posts match your search" : "No posts yet"}
                            </p>
                            {!searchQuery && (
                                <Button asChild>
                                    <Link to={`${ADMIN_PATH}/posts/new`}>Create your first post</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPosts?.map((post) => (
                                        <TableRow key={post._id}>
                                            <TableCell>
                                                <div className="font-medium">{post.title}</div>
                                                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                    {post.excerpt}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{post.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
                                                        post.status === "published"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                    )}
                                                >
                                                    {post.status === "published" ? (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3" />
                                                    )}
                                                    {post.status === "published" ? "Published" : "Draft"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {(post.views || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(post.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`${ADMIN_PATH}/posts/edit/${post._id}`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePreview(post._id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        {post.status === "published" ? (
                                                            <DropdownMenuItem onClick={() => handleUnpublish(post._id)}>
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Unpublish
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handlePublish(post._id)}>
                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                Publish
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeletePostId(post._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
