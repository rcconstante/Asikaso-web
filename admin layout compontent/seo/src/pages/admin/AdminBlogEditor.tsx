import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WysiwygEditor } from "@/components/editor/WysiwygEditor";
import { ImageUploader } from "@/components/editor/ImageUploader";
import {
    Save,
    Eye,
    Send,
    Loader2,
    ImageIcon,
    Tag,
    X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import { ADMIN_PATH } from "@/lib/adminConfig";

const CATEGORIES = [
    "Best Practices",
    "Tutorials",
    "Features",
    "Integration",
    "Tips & Tricks",
    "Case Studies",
    "Product Updates",
    "Industry News",
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function AdminBlogEditor() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { sessionToken } = useAdmin();
    const { toast } = useToast();

    const isEditing = !!postId;

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [category, setCategory] = useState("Best Practices");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [activeTab, setActiveTab] = useState("settings");

    // Fetch existing post if editing
    const existingPost = useQuery(
        api.blog.getPostById,
        isEditing && sessionToken ? { postId: postId as Id<"blogPosts">, sessionToken } : "skip"
    );

    // Mutations
    const createPostMutation = useMutation(api.blog.createPost);
    const updatePostMutation = useMutation(api.blog.updatePost);
    const publishPostMutation = useMutation(api.blog.publishPost);
    const generatePreviewTokenMutation = useMutation(api.blog.generatePreviewToken);

    // Populate form when editing
    useEffect(() => {
        if (existingPost) {
            setTitle(existingPost.title);
            setSlug(existingPost.slug);
            setExcerpt(existingPost.excerpt);
            setContent(existingPost.content);
            setCoverImage(existingPost.coverImage || "");
            setCategory(existingPost.category);
            setTags(existingPost.tags || []);
            setMetaTitle(existingPost.metaTitle || "");
            setMetaDescription(existingPost.metaDescription || "");
            setSlugManuallyEdited(true);
        }
    }, [existingPost]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugManuallyEdited && title) {
            setSlug(slugify(title));
        }
    }, [title, slugManuallyEdited]);

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const validateForm = () => {
        if (!title.trim()) {
            toast({ title: "Error", description: "Title is required", variant: "destructive" });
            return false;
        }
        if (!slug.trim()) {
            toast({ title: "Error", description: "Slug is required", variant: "destructive" });
            return false;
        }
        if (!excerpt.trim()) {
            toast({ title: "Error", description: "Excerpt is required", variant: "destructive" });
            return false;
        }
        if (!content.trim() || content === "<p></p>") {
            toast({ title: "Error", description: "Content is required", variant: "destructive" });
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm() || !sessionToken) return;
        setIsSaving(true);

        try {
            if (isEditing) {
                await updatePostMutation({
                    sessionToken,
                    postId: postId as Id<"blogPosts">,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
                toast({
                    title: "Post saved",
                    description: "Your changes have been saved.",
                });
            } else {
                const newPostId = await createPostMutation({
                    sessionToken,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
                toast({
                    title: "Post created",
                    description: "Your draft has been saved.",
                });
                navigate(`${ADMIN_PATH}/posts/edit/${newPostId}`);
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to save post",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!validateForm() || !sessionToken) return;
        setIsPublishing(true);

        try {
            let targetPostId = postId as Id<"blogPosts">;

            // Save first if new post
            if (!isEditing) {
                targetPostId = await createPostMutation({
                    sessionToken,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
            } else {
                await updatePostMutation({
                    sessionToken,
                    postId: targetPostId,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
            }

            await publishPostMutation({ sessionToken, postId: targetPostId });
            toast({
                title: "Post published!",
                description: "Your post is now live.",
            });
            navigate(`${ADMIN_PATH}/posts`);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to publish post",
                variant: "destructive",
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePreview = async () => {
        if (!sessionToken) return;

        try {
            let targetPostId = postId as Id<"blogPosts">;

            // Save first
            if (!isEditing) {
                if (!validateForm()) return;
                targetPostId = await createPostMutation({
                    sessionToken,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
                navigate(`${ADMIN_PATH}/posts/edit/${targetPostId}`, { replace: true });
            } else {
                await updatePostMutation({
                    sessionToken,
                    postId: targetPostId,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    category,
                    tags,
                    metaTitle: metaTitle || title,
                    metaDescription: metaDescription || excerpt,
                });
            }

            const token = await generatePreviewTokenMutation({ sessionToken, postId: targetPostId });
            window.open(`/blog/preview/${targetPostId}?token=${token}`, "_blank");
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
                        {isEditing ? "Edit Post" : "New Post"}
                    </h1>
                    {existingPost && (
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={existingPost.status === "published" ? "default" : "secondary"}>
                                {existingPost.status === "published" ? "Published" : "Draft"}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handlePreview} disabled={isSaving || isPublishing}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                    <Button variant="outline" onClick={handleSave} disabled={isSaving || isPublishing}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Draft
                    </Button>
                    <Button onClick={handlePublish} disabled={isSaving || isPublishing}>
                        {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Publish
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Slug */}
                    <Card className="rounded-2xl">
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter post title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12 text-lg font-medium rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">/blog/</span>
                                    <Input
                                        id="slug"
                                        placeholder="post-url-slug"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlug(slugify(e.target.value));
                                            setSlugManuallyEdited(true);
                                        }}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    placeholder="Brief description of your post..."
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    rows={3}
                                    className="rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WysiwygEditor
                                content={content}
                                onChange={setContent}
                                placeholder="Start writing your blog post..."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                            <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="settings" className="space-y-4 mt-4">
                            {/* Cover Image */}
                            <Card className="rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Cover Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ImageUploader
                                        onUpload={(url) => setCoverImage(url)}
                                        aspectRatio={16 / 9}
                                        currentImage={coverImage}
                                        buttonText="Upload Cover Image"
                                    />
                                </CardContent>
                            </Card>

                            {/* Category */}
                            <Card className="rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            {/* Tags */}
                            <Card className="rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add tag..."
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                            className="rounded-xl"
                                        />
                                        <Button size="sm" onClick={handleAddTag}>
                                            Add
                                        </Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                                                    {tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-4 mt-4">
                            <Card className="rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">SEO Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="metaTitle">Meta Title</Label>
                                        <Input
                                            id="metaTitle"
                                            placeholder={title || "Page title for search engines"}
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {(metaTitle || title).length}/60 characters
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metaDescription">Meta Description</Label>
                                        <Textarea
                                            id="metaDescription"
                                            placeholder={excerpt || "Description for search engines"}
                                            value={metaDescription}
                                            onChange={(e) => setMetaDescription(e.target.value)}
                                            rows={3}
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {(metaDescription || excerpt).length}/160 characters
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO Preview */}
                            <Card className="rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Search Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                                            {metaTitle || title || "Post Title"}
                                        </p>
                                        <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                                            tagbase.co/blog/{slug || "post-slug"}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {metaDescription || excerpt || "Post description will appear here..."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
