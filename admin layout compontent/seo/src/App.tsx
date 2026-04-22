import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/theme-provider";
import { HubSpotProvider, useHubSpot } from "./contexts/HubSpotContext";
import { UserSessionProvider, useUserSession } from "./contexts/UserSessionContext";
import { AdminProvider, useAdmin } from "./contexts/AdminContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import TagsPage from "./pages/TagsPage";
import LandingPage from "./pages/LandingPage";
import { TagBoardPage } from "./pages/TagBoardPage";
import SankeyPage from "./pages/SankeyPage";
import CategoriesPage from "./pages/CategoriesPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import DocsPage from "./pages/DocsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiesPage from "./pages/CookiesPage";
import SetupGuidePage from "./pages/SetupGuidePage";
import SupportPage from "./pages/SupportPage";
import BlogPage from "./pages/BlogPage";
import { CookieConsent } from "./components/ui/CookieConsent";
import BlogViewPage from "./pages/BlogViewPage";
import BlogPreviewPage from "./pages/BlogPreviewPage";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/auth/OAuthCallback";
import { AIAgentButton } from "./components/ai";
import { FeatureGate, TrialBanner } from "./components/subscription";
import {
  AdminLogin,
  AdminDashboard,
  AdminBlogList,
  AdminBlogEditor,
  AdminSettings,
  AdminLifecycleLogs,
  AdminRedeemCodes,
} from "./pages/admin";
import { ADMIN_PATH } from "./lib/adminConfig";

const queryClient = new QueryClient();

// Convex URL must be set in environment variables
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error('VITE_CONVEX_URL environment variable is not set. Please configure it in your .env file.');
}
const convex = new ConvexReactClient(convexUrl || '');

function ProtectedRoutes() {
  const { connectionStatus, isConnecting, disconnectionStatus, authError } = useHubSpot();
  const { isAuthenticated, isLoading: isSessionLoading, sessionToken } = useUserSession();

  // Show loading spinner while connection is being established
  // This prevents premature redirect to landing page during initial load
  if (isConnecting || isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow access to dashboard if:
  // 1. User is authenticated (has valid session), OR
  // 2. HubSpot is connected (has valid tokens) - even without website session
  // This handles the case where session expired but HubSpot tokens are still valid
  if (isAuthenticated || connectionStatus.isConnected) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/board" element={<TagBoardPage />} />
              {/* Pro only - Customer Journey */}
              <Route
                path="/customer-journey"
                element={
                  <FeatureGate requiredPlan="pro" feature="customerJourney">
                    <SankeyPage />
                  </FeatureGate>
                }
              />
              {/* Basic+ only - Categories */}
              <Route
                path="/categories"
                element={
                  <FeatureGate requiredPlan="basic" feature="categories">
                    <CategoriesPage />
                  </FeatureGate>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        {/* AI Agent Chatbot Button */}
        <AIAgentButton />
        {/* Trial Banner */}
        <TrialBanner className="fixed bottom-0 left-0 right-0 z-50" />
      </div>
    );
  }

  // If user has a session token but connection isn't established yet, wait for DB to confirm
  // This handles the case where user just logged in and we're waiting for Convex to sync
  if (sessionToken && !connectionStatus.isConnected && !connectionStatus.error && !authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Connecting to HubSpot...</p>
        </div>
      </div>
    );
  }

  // Only redirect to landing if truly not connected and not authenticated
  return <Navigate to="/" replace />;
}

function AdminProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${ADMIN_PATH}/login`} replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminBlogList />} />
        <Route path="posts/new" element={<AdminBlogEditor />} />
        <Route path="posts/edit/:postId" element={<AdminBlogEditor />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="lifecycle-logs" element={<AdminLifecycleLogs />} />
        <Route path="redeem-codes" element={<AdminRedeemCodes />} />
        <Route path="*" element={<Navigate to={ADMIN_PATH} replace />} />
      </Routes>
    </AdminLayout>
  );
}

const App = () => {
  // Note: OAuth callback is now handled through normal routing
  // This prevents refresh loops when state validation fails

  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="system">
            <UserSessionProvider>
              <HubSpotProvider initialTags={[]}>
                <AdminProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/cookies" element={<CookiesPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogViewPage />} />
                        <Route path="/blog/preview/:postId" element={<BlogPreviewPage />} />
                        <Route path="/help" element={<HelpCenterPage />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/setup-guide" element={<SetupGuidePage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/auth/callback" element={<OAuthCallback />} />
                        {/* Admin Routes - Uses obscure path for security */}
                        <Route path={`${ADMIN_PATH}/login`} element={<AdminLogin />} />
                        <Route path={`${ADMIN_PATH}/*`} element={<AdminProtectedRoutes />} />
                        {/* Protected User Routes */}
                        <Route path="/*" element={<ProtectedRoutes />} />
                      </Routes>
                      {/* Cookie Consent Banner - Shows on first visit */}
                      <CookieConsent />
                    </BrowserRouter>
                  </TooltipProvider>
                </AdminProvider>
              </HubSpotProvider>
            </UserSessionProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ConvexProvider>
  );
};

export default App;
