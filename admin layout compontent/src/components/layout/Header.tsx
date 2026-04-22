import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Moon,
  Sun,
  Bell,
  LogOut,
  Link2,
  Link2Off,
  Plus,
  X,
  Search,
  ChevronDown,
  Settings,
  Tag,
  LayoutDashboard,
  Target,
  GitBranch,
  HelpCircle,
  BookOpen,
  FileText,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useUserSession } from "@/contexts/UserSessionContext";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildOAuthAuthorizationUrl } from "@/config/hubspot";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { DisconnectionModal } from "@/components/modals/DisconnectionModal";
import { ReconnectModal } from "@/components/modals/ReconnectModal";
import { useQuery } from "convex/react";
import { clearAllStorageData } from "@/lib/logger";
import { api } from "../../../convex/_generated/api";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Page title mapping
const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/tags': 'Tags Management',
    '/board': 'Tag Board',
    '/customer-journey': 'Customer Journey',
    '/categories': 'Categories',
  };
  return titles[pathname] || 'Dashboard';
};

// Searchable items
const searchableItems = [
  { title: "Dashboard", description: "View your overview and stats", link: "/dashboard", category: "Pages", icon: LayoutDashboard },
  { title: "Tags Management", description: "Create and manage your tags", link: "/tags", category: "Pages", icon: Tag },
  { title: "Tag Board", description: "Visual board of all tags", link: "/board", category: "Pages", icon: Target },
  { title: "Customer Journey", description: "Visualize contact movements", link: "/customer-journey", category: "Pages", icon: GitBranch },
  { title: "Categories", description: "Organize tags into groups", link: "/categories", category: "Pages", icon: Target },
  { title: "Help Center", description: "Get answers to your questions", link: "/help", category: "Help", icon: HelpCircle },
  { title: "Documentation", description: "Comprehensive guides", link: "/docs", category: "Help", icon: BookOpen },
  { title: "FAQ", description: "Frequently asked questions", link: "/help", category: "Help", icon: FileText },
  { title: "Create Tag", description: "Create a new tag", link: "/tags", category: "Actions", icon: Tag },
  { title: "Subscription", description: "Manage your plan", link: "/dashboard", category: "Settings", icon: CreditCard },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const {
    connectionStatus,
    disconnect,
    disconnectionStatus,
    showDisconnectionModal,
    setShowDisconnectionModal,
    dismissDisconnectionNotice,
    showReconnectModal,
    setShowReconnectModal,
    reconnectReason,
    linkedPortals,
  } = useHubSpot();
  const { userEmail, activePortalId, switchPortal, clearSession } = useUserSession();
  const { planName, isLoading: isPlanLoading } = usePlanFeatures();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Determine if portal is effectively connected (connected AND not disconnected by uninstall)
  const isEffectivelyConnected = connectionStatus.isConnected && !disconnectionStatus.isDisconnected;

  // Filter search results based on query
  const filteredSearchResults = searchQuery.length > 0
    ? searchableItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleSearchSelect = (link: string) => {
    navigate(link);
    setSearchQuery("");
    setSearchFocused(false);
  };

  // Get portal settings from Convex (has the actual business domain)
  const portalSettings = useQuery(
    api.portalSettings.getPortalSettings,
    activePortalId ? { portalId: activePortalId } : "skip"
  );

  // Show loading skeleton while data is being fetched
  const isLoadingPortalData = connectionStatus.isConnected && activePortalId && portalSettings === undefined;

  // Only use the domain from Convex - no fallback chain that causes flashing
  const displayDomain = portalSettings?.domain || null;
  const displayPortalId = activePortalId || connectionStatus.portalId;

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('tagbase_notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed.map((n: Notification & { time: string }) => ({
        ...n,
        time: new Date(n.time)
      })));
    } else {
      if (connectionStatus.isConnected && displayDomain) {
        const initialNotifications: Notification[] = [
          {
            id: '1',
            title: 'Connected to HubSpot',
            message: `Successfully connected to ${displayDomain}`,
            time: new Date(),
            read: false,
            type: 'success'
          }
        ];
        setNotifications(initialNotifications);
      }
    }
  }, [connectionStatus.isConnected, displayDomain]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('tagbase_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = async () => {
    // Clear all localStorage and sessionStorage FIRST
    // This ensures ProtectedRoutes won't read stale cached data
    clearAllStorageData();
    
    // Disconnect HubSpot (resets context state)
    disconnect();
    
    // Clear user session from Convex
    await clearSession();
    
    // Force full page reload to reset all React state
    window.location.href = '/';
  };

  const handleAddAccount = () => {
    window.location.href = buildOAuthAuthorizationUrl();
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 lg:px-8 gap-4">
        {/* Left Section - Title */}
        <div className="flex items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {pageTitle}
          </h1>
        </div>

        {/* Center Section - Search Bar (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-[500px] mx-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search pages, help, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-12 pr-4 py-6 rounded-xl bg-muted/50 border-0 text-base placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />

            {/* Search Results Dropdown */}
            {searchFocused && filteredSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <ScrollArea className="max-h-[300px]">
                  {filteredSearchResults.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSearchSelect(item.link)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {item.category}
                        </Badge>
                      </button>
                    );
                  })}
                </ScrollArea>
              </div>
            )}

            {/* No results */}
            {searchFocused && searchQuery.length > 0 && filteredSearchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg p-4 text-center z-50">
                <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Connection Status - Hidden on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2 h-10 px-4 rounded-xl hover:bg-muted"
            onClick={() => setSettingsOpen(true)}
          >
            {disconnectionStatus.isDisconnected ? (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="hidden lg:inline text-sm font-medium text-orange-600 dark:text-orange-400">Disconnected</span>
              </>
            ) : connectionStatus.isConnected ? (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Link2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="hidden lg:inline text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                  <Link2Off className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="hidden lg:inline text-sm font-medium">Not Connected</span>
              </>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-muted"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-muted"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-900/30">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="currentColor" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-[11px] text-white flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time.toLocaleTimeString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3 rounded-xl hover:bg-muted">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold">
                    {isLoadingPortalData ? (
                      <div className="w-4 h-4 rounded bg-primary/20 animate-pulse" />
                    ) : displayDomain ? (
                      displayDomain.charAt(0).toUpperCase()
                    ) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  {isLoadingPortalData ? (
                    <>
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mt-1" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium">
                        {displayDomain || displayPortalId || 'User'}
                      </span>
                      <span className={`text-xs ${disconnectionStatus.isDisconnected ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                        {disconnectionStatus.isDisconnected
                          ? 'Disconnected'
                          : connectionStatus.isConnected
                            ? isPlanLoading ? 'Loading...' : planName
                            : 'Not Connected'}
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  {isLoadingPortalData ? (
                    <>
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        {displayDomain || displayPortalId || 'User'}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Portal ID: {displayPortalId || 'N/A'}
                      </p>
                    </>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddAccount}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Disconnection Modal - Shows when app is uninstalled from HubSpot */}
      <DisconnectionModal
        open={showDisconnectionModal}
        onOpenChange={setShowDisconnectionModal}
        onLater={dismissDisconnectionNotice}
        portalId={activePortalId || ''}
        portalName={displayDomain}
        isSingleAccount={true}
        disconnectedAt={disconnectionStatus.disconnectedAt}
      />

      {/* Reconnect Modal - Shows when HubSpot tokens expire but user is still logged in */}
      <ReconnectModal
        open={showReconnectModal}
        onOpenChange={setShowReconnectModal}
        onLogout={handleLogout}
        onSwitchAccount={async (portalId) => {
          try {
            await switchPortal(portalId);
          } catch (error) {
            console.error('Failed to switch portal:', error);
          }
        }}
        portalId={activePortalId || ''}
        portalName={displayDomain || undefined}
        linkedPortals={linkedPortals}
        reason={reconnectReason || 'token_expired'}
      />
    </>
  );
}
