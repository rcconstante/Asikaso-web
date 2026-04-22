import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LifeStageSelector from './components/LifeStageSelector';
import AIAssistant from './components/AIAssistant';
import Features from './components/Features';
import Pricing from './components/Pricing';
import CookieConsent from './components/CookieConsent';
import { SEO } from './seo/SEO';
import { Footer7 } from './components/ui/footer-7';
import { Component as LoginPage } from './components/ui/animated-characters-login-page';
import Dashboard from './components/Dashboard';
import GuidesPage from './pages/GuidesPage';
import GuidePreviewPage from './pages/GuidePreviewPage';
import RemindersPage from './pages/RemindersPage';
import PdfFormsPage from './pages/PdfFormsPage';
import ForumPage from './pages/ForumPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './admin/AdminLayout';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function MainLayout() {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Home"
        description="Asikaso helps Filipinos complete real-life tasks step-by-step—from government IDs to taxes and travel—using guides, automation, and AI assistance."
        keywords="Philippines, PH adulting, government ID, taxes PH"
      />
      <Navbar />
      <main className="p-4 md:p-6 space-y-6 max-w-[1024px] mx-auto">
        <Hero />
        
        <LifeStageSelector />
        
        <AIAssistant />

        <Features />

        <Pricing />
      </main>

      <CookieConsent />

      <Footer7 
        logo={{
          url: "/",
          src: "/assets/logo-header.png",
          alt: "Asikaso",
          title: ""
        }}
        description="Hindi ka na maghahanap — gagawin mo na lang. Your all-in-one assistant for Philippine government processes, adulting, and life management."
        copyright={`© ${new Date().getFullYear()} Asikaso. All rights reserved.`}
        sections={[
          {
            title: "Platform",
            links: [
              { name: "Guides", href: "#guides" },
              { name: "AI Assistant", href: "#ai" },
              { name: "Pricing", href: "#pricing" },
              { name: "Features", href: "#features" },
            ],
          },
          {
            title: "Support",
            links: [
              { name: "FAQ", href: "#" },
              { name: "Contact Us", href: "#" },
              { name: "Community", href: "#" },
            ],
          },
          {
            title: "Company",
            links: [
              { name: "About Us", href: "#" },
              { name: "Blog", href: "#" },
              { name: "Careers", href: "#" },
            ],
          },
        ]}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/guides" element={<GuidesPage />} />
      <Route path="/guide/:id" element={<GuidePreviewPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/reminders" element={<RemindersPage />} />
      <Route path="/pdf-forms" element={<PdfFormsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  );
}
