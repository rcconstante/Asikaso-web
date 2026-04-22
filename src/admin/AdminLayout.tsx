import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  LogOut,
  PlusCircle,
} from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import AdminGuides from "./AdminGuides";
import AdminUsers from "./AdminUsers";
import AdminBlogList from "./AdminBlogList";
import AdminBlogEditor from "./AdminBlogEditor";
import AdminLogs from "./AdminLogs";
import AdminSettings from "./AdminSettings";

/* ─── nav config ─────────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Admin Menu",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "guides", label: "Guides", icon: BookOpen },
      { id: "users", label: "Users", icon: Users },
      { id: "blog", label: "All Posts", icon: FileText },
      { id: "blog-new", label: "New Post", icon: PlusCircle },
      { id: "logs", label: "Data Logs", icon: Activity },
    ],
  },
];

/* ─── sidebar ────────────────────────────────────────────── */
function AdminSidebar({
  collapsed,
  setCollapsed,
  active,
  setActive,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  active: string;
  setActive: (v: string) => void;
}) {
  return (
    <div
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[264px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center border-b border-slate-200 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/Logo.png"
              alt="Asikaso"
              className="h-10 w-10 object-contain rounded-xl"
            />
            <div>
              <span className="font-bold text-lg text-slate-800 leading-none block">
                Asikaso
              </span>
              <span className="text-[10px] text-blue-600 font-medium">
                Admin Panel
              </span>
            </div>
          </div>
        ) : (
          <img
            src="/assets/Logo.png"
            alt="Asikaso"
            className="h-9 w-9 object-contain mx-auto rounded-xl"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {section.title}
                </h3>
              )}
              {collapsed && (
                <div className="h-px bg-slate-200 mx-2 my-2" />
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3.5 w-full rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      } ${collapsed ? "justify-center px-2.5" : ""}`}
                    >
                      <Icon
                        className="h-[18px] w-[18px] flex-shrink-0"
                        strokeWidth={2}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Items */}
      <div className="border-t border-slate-200 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all ${
            collapsed ? "justify-center px-2.5" : ""
          }`}
          title={collapsed ? "View Site" : undefined}
        >
          <Eye className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2} />
          {!collapsed && <span>View Site</span>}
        </a>

        <button
          onClick={() => setActive("settings")}
          className={`flex items-center gap-3.5 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
            active === "settings"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          } ${collapsed ? "justify-center px-2.5" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings
            className="h-[18px] w-[18px] flex-shrink-0"
            strokeWidth={2}
          />
          {!collapsed && <span>Settings</span>}
        </button>

        <Link
          to="/login"
          className={`flex items-center gap-3.5 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all ${
            collapsed ? "justify-center px-2.5" : ""
          }`}
        >
          <LogOut
            className="h-[18px] w-[18px] flex-shrink-0"
            strokeWidth={2}
          />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>

      {/* Admin Info Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
          <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin</p>
              <p className="text-[11px] text-white/50 truncate">
                admin@asikaso.ph
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[88px] h-6 w-6 rounded-full border border-slate-200 bg-white shadow-md hover:bg-slate-50 flex items-center justify-center transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-500" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-500" />
        )}
      </button>
    </div>
  );
}

/* ─── header ─────────────────────────────────────────────── */
function AdminHeader({ label }: { label: string }) {
  return (
    <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
          <img
            src="/assets/Logo.png"
            alt=""
            className="h-6 w-6 object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{label}</h1>
          <p className="text-xs text-slate-400">Asikaso Admin Panel</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}

/* ─── page map ───────────────────────────────────────────── */
function getPageLabel(id: string): string {
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    guides: "Guides",
    users: "Users",
    blog: "Blog / SEO",
    "blog-new": "New Blog Post",
    "blog-edit": "Edit Blog Post",
    logs: "Data Logs",
    settings: "Settings",
  };
  return map[id] || "Admin";
}

/* ─── main layout ────────────────────────────────────────── */
export default function AdminLayout() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const handleNavigateToEditor = (postId?: number) => {
    if (postId !== undefined) {
      setEditingPostId(postId);
      setActive("blog-edit");
    } else {
      setEditingPostId(null);
      setActive("blog-new");
    }
  };

  const handleBackToList = () => {
    setEditingPostId(null);
    setActive("blog");
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard />;
      case "guides":
        return <AdminGuides />;
      case "users":
        return <AdminUsers />;
      case "blog":
        return (
          <AdminBlogList
            onNewPost={() => handleNavigateToEditor()}
            onEditPost={(id) => handleNavigateToEditor(id)}
          />
        );
      case "blog-new":
        return <AdminBlogEditor onBack={handleBackToList} />;
      case "blog-edit":
        return (
          <AdminBlogEditor postId={editingPostId} onBack={handleBackToList} />
        );
      case "logs":
        return <AdminLogs />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        active={active}
        setActive={setActive}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader label={getPageLabel(active)} />
        <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
