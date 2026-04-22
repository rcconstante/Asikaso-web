import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Send,
  Globe,
  Tag,
  X,
  ArrowLeft,
  ImageIcon,
  Search as SearchIcon,
} from "lucide-react";
import { MOCK_POSTS, type BlogPost } from "./AdminBlogList";

const CATEGORIES = [
  "Tax",
  "Government",
  "Healthcare",
  "Finance",
  "Travel",
  "Housing",
  "Career",
  "Lifestyle",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface AdminBlogEditorProps {
  postId?: number | null;
  onBack: () => void;
}

export default function AdminBlogEditor({
  postId,
  onBack,
}: AdminBlogEditorProps) {
  const isEditing = !!postId;
  const existingPost = isEditing
    ? MOCK_POSTS.find((p) => p.id === postId)
    : null;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "seo">("settings");
  const [saved, setSaved] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt);
      setContent(existingPost.content);
      setCoverImage(existingPost.coverImage);
      setCategory(existingPost.category);
      setTags(existingPost.tags);
      setMetaTitle(existingPost.metaTitle);
      setMetaDescription(existingPost.metaDescription);
      setSlugManuallyEdited(true);
    }
  }, [existingPost]);

  // Auto slug
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? "Edit Post" : "New Post"}
            </h2>
            {isEditing && existingPost && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  existingPost.status === "published"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {existingPost.status === "published" ? "Published" : "Draft"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Save size={15} />
            {saved ? "Saved!" : "Save Draft"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <Send size={15} />
            Publish
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + Slug + Excerpt */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30">
                <span className="bg-slate-50 px-3 py-3 text-xs text-slate-400 border-r border-slate-200 whitespace-nowrap">
                  /blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="post-url-slug"
                  className="flex-1 px-3 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your post..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Content</h3>
            </div>
            <div className="p-6">
              {/* Toolbar row */}
              <div className="flex items-center gap-1 pb-3 mb-3 border-b border-slate-100 flex-wrap">
                {["B", "I", "U", "H1", "H2", "H3", "UL", "OL", "Link", "Img", "Code"].map(
                  (btn) => (
                    <button
                      key={btn}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      {btn}
                    </button>
                  )
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your blog post content here..."
                rows={16}
                className="w-full text-sm text-slate-700 leading-relaxed focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-5">
          {/* Tab Switch */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(["settings", "seo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "seo" ? "SEO" : "Settings"}
              </button>
            ))}
          </div>

          {activeTab === "settings" && (
            <>
              {/* Cover Image */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                  <ImageIcon size={15} className="text-slate-400" />
                  Cover Image
                </h4>
                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img
                      src={coverImage}
                      alt=""
                      className="w-full aspect-video object-cover"
                    />
                    <button
                      onClick={() => setCoverImage("")}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <ImageIcon size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 mb-3">
                      Upload a cover image
                    </p>
                    <button
                      onClick={() =>
                        setCoverImage(
                          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600"
                        )
                      }
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Add Image
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-bold text-sm text-slate-800 mb-3">
                  Category
                </h4>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                  <Tag size={15} className="text-slate-400" />
                  Tags
                </h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-lg"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "seo" && (
            <>
              {/* SEO Settings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-800">
                  SEO Settings
                </h4>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "Page title for search engines"}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p
                    className={`text-right text-[10px] mt-1 ${
                      (metaTitle || title).length > 60
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {(metaTitle || title).length}/60 characters
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={
                      excerpt || "Description for search engines"
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  />
                  <p
                    className={`text-right text-[10px] mt-1 ${
                      (metaDescription || excerpt).length > 160
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {(metaDescription || excerpt).length}/160 characters
                  </p>
                </div>
              </div>

              {/* Google Search Preview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <SearchIcon size={14} className="text-slate-400" />
                  Search Preview
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                  <p className="text-blue-700 text-sm font-medium truncate">
                    {metaTitle || title || "Post Title"}
                  </p>
                  <p className="text-emerald-700 text-xs">
                    asikaso.ph/blog/{slug || "post-slug"}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {metaDescription ||
                      excerpt ||
                      "Post description will appear here..."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
