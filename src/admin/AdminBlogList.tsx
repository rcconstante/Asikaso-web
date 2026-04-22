import { useState } from "react";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Globe,
  Calendar,
  BarChart3,
} from "lucide-react";

/* ─── types ──────────────────────────────────────────────── */
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  status: "published" | "draft";
  views: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── mock data ──────────────────────────────────────────── */
export const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "How to Get Your TIN as a Freelancer in 2025",
    slug: "how-to-get-tin-freelancer-2025",
    excerpt:
      "Step-by-step guide to registering as self-employed in BIR and getting your TIN online.",
    content: "<p>Full content here...</p>",
    category: "Tax",
    tags: ["BIR", "TIN", "Freelancer"],
    coverImage: "",
    status: "published",
    views: 4820,
    metaTitle: "How to Get Your TIN as a Freelancer in 2025 | Asikaso",
    metaDescription:
      "Complete guide to BIR registration and TIN application for Filipino freelancers.",
    createdAt: "2025-02-10",
    updatedAt: "2025-04-18",
  },
  {
    id: 2,
    title: "PhilHealth Contribution Table 2025 (Updated)",
    slug: "philhealth-contribution-table-2025",
    excerpt:
      "Updated PhilHealth premium contribution rates for 2025 for employed, self-employed, and voluntary members.",
    content: "<p>Full content here...</p>",
    category: "Healthcare",
    tags: ["PhilHealth", "Contributions", "2025"],
    coverImage: "",
    status: "published",
    views: 8310,
    metaTitle: "PhilHealth Contribution Table 2025 | Asikaso",
    metaDescription:
      "Updated PhilHealth premium rates for 2025 with computation examples.",
    createdAt: "2025-03-01",
    updatedAt: "2025-04-15",
  },
  {
    id: 3,
    title: "Complete Guide to Pag-IBIG Housing Loan",
    slug: "pag-ibig-housing-loan-guide",
    excerpt:
      "Everything you need to know about applying for a Pag-IBIG housing loan in the Philippines.",
    content: "<p>Full content here...</p>",
    category: "Housing",
    tags: ["Pag-IBIG", "Housing Loan"],
    coverImage: "",
    status: "draft",
    views: 0,
    metaTitle: "",
    metaDescription: "",
    createdAt: "2025-04-15",
    updatedAt: "2025-04-20",
  },
  {
    id: 4,
    title: "SSS Benefits You Probably Don't Know About",
    slug: "sss-benefits-philippines",
    excerpt:
      "Discover underutilized SSS benefits including sickness, maternity, and salary loan programs.",
    content: "<p>Full content here...</p>",
    category: "Government",
    tags: ["SSS", "Benefits", "Philippines"],
    coverImage: "",
    status: "published",
    views: 3120,
    metaTitle: "Hidden SSS Benefits in the Philippines | Asikaso",
    metaDescription:
      "Learn about lesser-known SSS benefits that most Filipino workers miss.",
    createdAt: "2025-03-20",
    updatedAt: "2025-04-10",
  },
  {
    id: 5,
    title: "How to File Annual Income Tax Return (ITR) Online",
    slug: "how-to-file-itr-online-philippines",
    excerpt:
      "Step-by-step guide to filing your annual ITR using BIR eFPS and eBIRForms.",
    content: "<p>Full content here...</p>",
    category: "Tax",
    tags: ["BIR", "ITR", "Tax Filing"],
    coverImage: "",
    status: "draft",
    views: 0,
    metaTitle: "",
    metaDescription: "",
    createdAt: "2025-04-20",
    updatedAt: "2025-04-21",
  },
];

/* ─── component ──────────────────────────────────────────── */
interface AdminBlogListProps {
  onNewPost: () => void;
  onEditPost: (id: number) => void;
}

export default function AdminBlogList({
  onNewPost,
  onEditPost,
}: AdminBlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  const togglePublish = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "published" ? "draft" : "published",
            }
          : p
      )
    );
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">All Posts</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your blog posts and SEO content
          </p>
        </div>
        <button
          onClick={onNewPost}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          New Post
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Posts",
            value: posts.length,
            icon: FileText,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Published",
            value: publishedCount,
            icon: CheckCircle,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Drafts",
            value: draftCount,
            icon: XCircle,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Total Views",
            value: totalViews.toLocaleString(),
            icon: BarChart3,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText
              size={40}
              className="mx-auto text-slate-300 mb-3"
            />
            <p className="font-semibold text-slate-500 mb-1">
              {search ? "No posts match your search" : "No posts yet"}
            </p>
            {!search && (
              <button
                onClick={onNewPost}
                className="text-blue-600 text-sm font-semibold hover:underline mt-2"
              >
                Create your first post
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[
                    "Title",
                    "Category",
                    "Status",
                    "Views",
                    "Updated",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-sm text-slate-800 max-w-[300px] truncate">
                          {post.title}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe size={10} /> /blog/{post.slug}
                        </p>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                        {post.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {post.status === "published" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    {/* Views */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {post.views.toLocaleString()}
                    </td>
                    {/* Updated */}
                    <td className="px-5 py-4 text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {post.updatedAt}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditPost(post.id)}
                          title="Edit"
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => togglePublish(post.id)}
                          title={
                            post.status === "published"
                              ? "Unpublish"
                              : "Publish"
                          }
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {post.status === "published" ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post.id)}
                          title="Delete"
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <h3 className="font-bold text-lg text-slate-800 mb-2">
              Delete Post
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          <style>{`@keyframes fade-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fade-in .2s ease-out}`}</style>
        </div>
      )}
    </div>
  );
}
