import React, { useState } from 'react';
import { PageId, ThemeColor } from '../types';
import { THEMES } from '../data/websiteData';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  colorTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  isLightMode: boolean;
  onToggleLightMode: () => void;
  onOpenExporter: () => void;
  customLogo: string | null;
  onUploadLogo: (url: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  colorTheme,
  onSelectTheme,
  isLightMode,
  onToggleLightMode,
  onOpenExporter,
  customLogo,
  onUploadLogo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'terms', label: 'Terms' },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[72px] bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--line)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Lockup (Clean logo, no front-end camera) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[#070D18] font-bold text-xl shadow-md transition-transform hover:scale-105 overflow-hidden focus:outline-none cursor-pointer"
            aria-label="Horizon Digital Media Home"
          >
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>H</span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('home')}
            className="font-display font-bold text-lg sm:text-xl text-[var(--text)] tracking-tight hover:text-[var(--secondary)] transition-colors text-left focus:outline-none cursor-pointer"
          >
            Horizon Digital Media
          </button>
        </div>

        {/* Desktop Navigation & Controls */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-xl ${
                    isActive
                      ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Theme Palette Dots (Matching Capture.PNG) */}
          <div
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1.5 rounded-full"
            title="Select Accent Theme"
          >
            {(Object.keys(THEMES) as ThemeColor[]).map((tKey) => {
              const theme = THEMES[tKey];
              const isSelected = colorTheme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => onSelectTheme(tKey)}
                  aria-label={`Switch theme to ${theme.name}`}
                  className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 focus:outline-none ${
                    isSelected ? 'ring-2 ring-[var(--secondary)] ring-offset-1 ring-offset-[var(--surface)] scale-110' : ''
                  }`}
                  style={{ backgroundColor: theme.primary }}
                />
              );
            })}
          </div>

          {/* Light/Dark Toggle */}
          <button
            onClick={onToggleLightMode}
            aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors focus:outline-none"
            title={isLightMode ? 'Dark Mode' : 'Light Mode'}
          >
            {isLightMode ? (
              <i className="fa-solid fa-sun text-sm text-[var(--secondary)]"></i>
            ) : (
              <i className="fa-solid fa-moon text-sm"></i>
            )}
          </button>

          {/* Export Source ZIP */}
          <button
            onClick={onOpenExporter}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-all flex items-center gap-1.5"
            title="Download Standalone HTML/CSS/JS Package"
          >
            <i className="fa-solid fa-file-zipper text-[var(--secondary)]"></i>
            <span>Export ZIP</span>
          </button>
        </div>

        {/* Mobile controls & hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Theme Dot Quick Selector */}
          <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--line)] px-2 py-1 rounded-full">
            {(Object.keys(THEMES) as ThemeColor[]).map((tKey) => {
              const theme = THEMES[tKey];
              const isSelected = colorTheme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => onSelectTheme(tKey)}
                  aria-label={`Switch theme to ${theme.name}`}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${isSelected ? 'ring-2 ring-[var(--secondary)] scale-110' : ''}`}
                  style={{ backgroundColor: theme.primary }}
                  title={theme.name}
                />
              );
            })}
          </div>

          <button
            onClick={onToggleLightMode}
            className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--text)]"
          >
            <i className={`fa-solid ${isLightMode ? 'fa-sun text-[var(--secondary)]' : 'fa-moon'} text-xs`}></i>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--text)] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--surface)] border-b border-[var(--line)] px-4 py-5 shadow-2xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2 mb-5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-2)] text-[var(--secondary)] font-semibold border border-[var(--line)]'
                      : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Color theme selectors inside mobile drawer */}
          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
            <span className="text-xs text-[var(--muted)] font-medium">Color Theme</span>
            <div className="flex items-center gap-2">
              {(Object.keys(THEMES) as ThemeColor[]).map((tKey) => {
                const theme = THEMES[tKey];
                const isSelected = colorTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => onSelectTheme(tKey)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      isSelected ? 'ring-2 ring-[var(--secondary)] ring-offset-2 ring-offset-[var(--surface)] scale-110' : ''
                    }`}
                    style={{ backgroundColor: theme.primary }}
                    title={theme.name}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)]">
            <button
              onClick={() => {
                onOpenExporter();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-file-zipper text-[var(--secondary)]"></i>
              <span>Download Website Source ZIP</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
