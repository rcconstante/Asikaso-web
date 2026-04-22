import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tags,
  Grid3X3,
  GitBranch,
  FolderTree,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Crown,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useUserSession } from "@/contexts/UserSessionContext";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { PricingModal } from "@/components/modals/PricingModal";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { clearAllStorageData } from "@/lib/logger";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  icon: any;
  path: string;
  requiredPlan?: 'basic' | 'pro';
}

const navigationItems: { title: string; items: NavItem[] }[] = [
  {
    title: "Main Menu",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Tags", icon: Tags, path: "/tags" },
      { name: "Tag Board", icon: Grid3X3, path: "/board" },
      { name: "Customer Journey", icon: GitBranch, path: "/customer-journey", requiredPlan: "pro" },
      { name: "Categories", icon: FolderTree, path: "/categories", requiredPlan: "basic" },
    ],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const { disconnect } = useHubSpot();
  const { clearSession } = useUserSession();

  // Get user's plan features
  const { plan, canAccessCategories, canAccessSankey } = usePlanFeatures();

  // Only show upgrade card if user is not on Pro plan
  const isPro = plan === "pro";

  // Helper to check if item is locked based on plan
  const isItemLocked = (item: NavItem) => {
    if (!item.requiredPlan) return false;
    const planOrder = ['free', 'basic', 'pro'];
    const userPlanIndex = planOrder.indexOf(plan);
    const requiredPlanIndex = planOrder.indexOf(item.requiredPlan);
    return userPlanIndex < requiredPlanIndex;
  };

  const handleSignOut = async () => {
    // Clear all localStorage and sessionStorage FIRST
    clearAllStorageData();
    
    // Disconnect HubSpot (resets context state)
    disconnect();
    
    // Clear user session from Convex
    await clearSession();
    
    // Force full page reload to reset all React state
    window.location.href = '/';
  };

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col bg-white dark:bg-card border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-20" : "w-[280px]",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-sidebar-border px-4">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/Logo-taghub-nobg.png"
                alt="TagBase"
                className="h-12 object-contain"
              />
            </div>
          ) : (
            <img
              src="/Logo-taghub-nobg.png"
              alt="TagBase"
              className="h-10 w-10 object-contain mx-auto"
            />
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
                    const locked = isItemLocked(item);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                            isActive && !locked
                              ? "bg-primary text-white shadow-lg shadow-primary/30"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            collapsed && "justify-center px-3"
                          )
                        }
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                        {!collapsed && (
                          <span className="flex-1 flex items-center justify-between">
                            <span className={locked ? "line-through opacity-70" : ""}>
                              {item.name}
                            </span>
                            {locked && (
                              <Lock className="h-4 w-4 text-amber-500" />
                            )}
                          </span>
                        )}
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
            {/* Settings - Opens Modal */}
            <button
              onClick={() => setSettingsOpen(true)}
              className={cn(
                "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-3"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              {!collapsed && <span>Settings</span>}
            </button>

            {/* Help Center - Opens in New Tab */}
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-3"
              )}
              title={collapsed ? "Help Center" : undefined}
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              {!collapsed && <span>Help Center</span>}
            </a>
          </nav>

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
        </div>

        {/* Upgrade Card - Only show when not collapsed AND not on Pro plan */}
        {!collapsed && !isPro && (
          <div
            className="mx-4 mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setPricingOpen(true)}
          >
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <img
                  src="/Taghub-logo-nobg.png"
                  alt="TagBase Pro"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-300" />
                  <h3 className="text-base font-semibold text-white">
                    Upgrade to Pro
                  </h3>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Unlock all premium features
                </p>
              </div>
              <button className="px-6 py-2 bg-white rounded-lg text-primary text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg">
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Upgrade Button - Only show when collapsed AND not on Pro plan */}
        {collapsed && !isPro && (
          <div className="p-4">
            <button
              onClick={() => setPricingOpen(true)}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white hover:shadow-lg transition-all"
              title="Upgrade to Pro"
            >
              <Crown className="h-5 w-5" />
            </button>
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

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </>
  );
}
