import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Eye,
    Moon,
    Sun,
    Activity,
    Ticket,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/components/theme-provider";
import { ADMIN_PATH } from "@/lib/adminConfig";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    {
        title: "Admin Menu",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, path: ADMIN_PATH },
            { name: "All Posts", icon: FileText, path: `${ADMIN_PATH}/posts` },
            { name: "New Post", icon: PlusCircle, path: `${ADMIN_PATH}/posts/new` },
            { name: "Lifecycle Logs", icon: Activity, path: `${ADMIN_PATH}/lifecycle-logs` },
            { name: "Redeem Codes", icon: Ticket, path: `${ADMIN_PATH}/redeem-codes` },
        ],
    },
];

function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { admin, logout } = useAdmin();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        navigate(`${ADMIN_PATH}/login`);
    };

    return (
        <div
            className={cn(
                "relative flex flex-col bg-white dark:bg-card border-r border-sidebar-border transition-all duration-300",
                collapsed ? "w-20" : "w-[280px]"
            )}
        >
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-sidebar-border px-4">
                {!collapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="font-bold text-xl">Admin</span>
                        </div>
                    </div>
                ) : (
                    <Shield className="h-8 w-8 text-primary mx-auto" />
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-6">
                    {navigationItems.map((section) => (
                        <div key={section.title}>
                            {!collapsed && (
                                <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {section.title}
                                </h3>
                            )}
                            {collapsed && <Separator className="my-2" />}
                            <nav className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all",
                                                    isActive
                                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                    collapsed && "justify-center px-3"
                                                )
                                            }
                                            title={collapsed ? item.name : undefined}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                                            {!collapsed && <span>{item.name}</span>}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Bottom Items */}
            <div className="border-t border-sidebar-border p-4 space-y-1">
                <nav className="space-y-1">
                    {/* View Public Site */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                            "text-muted-foreground hover:bg-muted hover:text-foreground",
                            collapsed && "justify-center px-3"
                        )}
                        title={collapsed ? "View Site" : undefined}
                    >
                        <Eye className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                        {!collapsed && <span>View Site</span>}
                    </a>

                    {/* Settings */}
                    <NavLink
                        to={`${ADMIN_PATH}/settings`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                collapsed && "justify-center px-3"
                            )
                        }
                        title={collapsed ? "Settings" : undefined}
                    >
                        <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                        {!collapsed && <span>Settings</span>}
                    </NavLink>

                    {/* Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all w-full",
                            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                            collapsed && "justify-center px-3"
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </nav>
            </div>

            {/* Admin Info Card */}
            {!collapsed && admin && (
                <div className="mx-4 mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5">
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
                    <div className="relative flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white/20">
                                {admin.profilePictureUrl ? (
                                    <img src={admin.profilePictureUrl} alt={admin.name} className="w-full h-full object-cover" />
                                ) : (
                                    admin.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{admin.name}</p>
                                <p className="text-xs text-white/60">{admin.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 h-6 w-6 rounded-full border border-sidebar-border bg-background shadow-md hover:bg-accent"
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </Button>
        </div>
    );
}

function AdminHeader() {
    const { admin } = useAdmin();
    const { theme, setTheme } = useTheme();

    return (
        <header className="h-20 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Blog Admin Panel</h1>
                    <p className="text-xs text-muted-foreground">Manage your blog content</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-xl"
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium overflow-hidden">
                        {admin?.profilePictureUrl ? (
                            <img src={admin.profilePictureUrl} alt={admin.name} className="w-full h-full object-cover" />
                        ) : (
                            admin?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium">{admin?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{admin?.role?.replace("_", " ")}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
