import React, { useState, useEffect } from 'react';
import { PageId, ThemeColor } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Toast } from './components/Toast';
import { ZipExporterModal } from './components/ZipExporterModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { PromoOfferModal } from './components/PromoOfferModal';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [colorTheme, setColorTheme] = useState<ThemeColor>('teal');
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isExporterOpen, setIsExporterOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [projectsRefreshKey, setProjectsRefreshKey] = useState<number>(0);
  const [claimedPromoCode, setClaimedPromoCode] = useState<string>('');

  // Custom persistent user branding (Logo & Profile Picture)
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('horizon_custom_logo') || null;
  });
  const [customProfilePic, setCustomProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('horizon_custom_profile_pic') || null;
  });

  // Initialize theme and navigation from localStorage & hash
  useEffect(() => {
    const rawTheme = localStorage.getItem('horizon_color_theme');
    const validThemes: ThemeColor[] = ['teal', 'dark-blue', 'dark-yellow', 'dark-red', 'dark-purple'];
    const savedTheme: ThemeColor = validThemes.includes(rawTheme as ThemeColor) ? (rawTheme as ThemeColor) : 'teal';
    const savedMode = localStorage.getItem('horizon_theme_mode') === 'light';

    setColorTheme(savedTheme);
    setIsLightMode(savedMode);
    document.documentElement.setAttribute('data-color-theme', savedTheme);
    document.documentElement.setAttribute('data-theme-mode', savedMode ? 'light' : 'dark');

    // Handle hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      if (['home', 'services', 'about', 'contact', 'terms'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    // Real Social Referral & Traffic Source Tracking
    try {
      const params = new URLSearchParams(window.location.search);
      let refSource = params.get('ref') || params.get('utm_source');
      if (!refSource && document.referrer) {
        const refUrl = document.referrer.toLowerCase();
        if (refUrl.includes('tiktok.com') || refUrl.includes('vm.tiktok.com')) refSource = 'tiktok';
        else if (refUrl.includes('instagram.com')) refSource = 'instagram';
        else if (refUrl.includes('facebook.com') || refUrl.includes('fb.me') || refUrl.includes('fb.com')) refSource = 'facebook';
        else if (refUrl.includes('wa.me') || refUrl.includes('whatsapp.com')) refSource = 'whatsapp';
        else if (refUrl.includes('youtube.com') || refUrl.includes('youtu.be')) refSource = 'youtube';
      }

      if (refSource) {
        const cleanSource = refSource.toLowerCase();
        sessionStorage.setItem('horizon_active_referrer', cleanSource);
        const stored = localStorage.getItem('horizon_traffic_analytics');
        const counts = stored ? JSON.parse(stored) : { tiktok: 0, instagram: 0, facebook: 0, whatsapp: 0, youtube: 0, direct: 0 };
        counts[cleanSource] = (counts[cleanSource] || 0) + 1;
        localStorage.setItem('horizon_traffic_analytics', JSON.stringify(counts));
      } else {
        const stored = localStorage.getItem('horizon_traffic_analytics');
        const counts = stored ? JSON.parse(stored) : { tiktok: 0, instagram: 0, facebook: 0, whatsapp: 0, youtube: 0, direct: 0 };
        counts.direct = (counts.direct || 0) + 1;
        localStorage.setItem('horizon_traffic_analytics', JSON.stringify(counts));
      }
    } catch (e) {
      console.warn('Traffic tracking init note:', e);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update theme color
  const handleSelectTheme = (theme: ThemeColor) => {
    setColorTheme(theme);
    localStorage.setItem('horizon_color_theme', theme);
    document.documentElement.setAttribute('data-color-theme', theme);
  };

  // Toggle light/dark mode
  const handleToggleLightMode = () => {
    const nextMode = !isLightMode;
    setIsLightMode(nextMode);
    localStorage.setItem('horizon_theme_mode', nextMode ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme-mode', nextMode ? 'light' : 'dark');
  };

  // Upload/change custom logo (Header & Footer)
  const handleUploadLogo = (url: string) => {
    setCustomLogo(url);
    try {
      localStorage.setItem('horizon_custom_logo', url);
    } catch (e) {
      console.warn('Storage quota warning:', e);
    }
    showToast('Logo updated successfully!', 'success');
  };

  // Upload/change profile picture (Home & About synchronization)
  const handleUploadProfilePic = (url: string) => {
    setCustomProfilePic(url);
    try {
      localStorage.setItem('horizon_custom_profile_pic', url);
    } catch (e) {
      console.warn('Storage quota warning:', e);
    }
    showToast('Photo updated successfully! Synced across Home & About pages.', 'success');
  };

  // Navigate to page
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaimPromo = (code: string) => {
    setClaimedPromoCode(code);
    sessionStorage.setItem('horizon_claimed_promo', code);
    handleNavigate('contact');
    showToast(`🎉 Promo code ${code} activated! Complete your project brief below.`, 'success');
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 relative overflow-x-hidden">
      {/* Background Motion & Particle Animation */}
      <BackgroundAnimation colorTheme={colorTheme} isLightMode={isLightMode} />

      {/* Front Page Special Promo / Discount Offer Popup */}
      <PromoOfferModal onClaimPromo={handleClaimPromo} isLightMode={isLightMode} />

      {/* Shared Header with logo upload & navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        colorTheme={colorTheme}
        onSelectTheme={handleSelectTheme}
        isLightMode={isLightMode}
        onToggleLightMode={handleToggleLightMode}
        onOpenExporter={() => setIsExporterOpen(true)}
        customLogo={customLogo}
        onUploadLogo={handleUploadLogo}
      />

      {/* Main Page Content */}
      <main className="flex-1 relative z-10">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            customProfilePic={customProfilePic}
            onUploadProfilePic={handleUploadProfilePic}
            onResetProfilePic={() => {
              setCustomProfilePic(null);
              localStorage.removeItem('horizon_custom_profile_pic');
              showToast('Reset to original portrait.', 'info');
            }}
          />
        )}
        {currentPage === 'services' && (
          <ServicesPage key={projectsRefreshKey} onNavigate={handleNavigate} />
        )}
        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            customProfilePic={customProfilePic}
            onUploadProfilePic={handleUploadProfilePic}
            onShowToast={showToast}
          />
        )}
        {currentPage === 'contact' && (
          <ContactPage onShowToast={showToast} initialPromoCode={claimedPromoCode} />
        )}
        {currentPage === 'terms' && <TermsPage />}
      </main>

      {/* Shared Footer with logo upload, quick links, verified social channels, and admin access */}
      <Footer
        onNavigate={handleNavigate}
        customLogo={customLogo}
        onUploadLogo={handleUploadLogo}
        onShowToast={showToast}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating WhatsApp Button (hidden on Contact page to leave only single large prominent button) */}
      {currentPage !== 'contact' && <WhatsAppButton />}

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* ZIP Exporter Modal */}
      <ZipExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        onShowToast={showToast}
      />

      {/* Admin Panel Modal (Aura Store Dark Dashboard with Firebase & Settings) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onShowToast={showToast}
        onProjectsUpdated={() => setProjectsRefreshKey((k) => k + 1)}
        customProfilePic={customProfilePic}
        onUploadProfilePic={handleUploadProfilePic}
        onResetProfilePic={() => {
          setCustomProfilePic(null);
          localStorage.removeItem('horizon_custom_profile_pic');
          showToast('Reset to default portrait.', 'info');
        }}
        customLogo={customLogo}
        onUploadLogo={handleUploadLogo}
        onResetLogo={() => {
          setCustomLogo(null);
          localStorage.removeItem('horizon_custom_logo');
          showToast('Reset to default logo.', 'info');
        }}
        colorTheme={colorTheme}
        onSelectTheme={handleSelectTheme}
        isLightMode={isLightMode}
        onToggleLightMode={handleToggleLightMode}
      />
    </div>
  );
}
