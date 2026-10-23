import React, { useState } from 'react';
import { PageId, DynamicSocialLink } from '../types';
import { getStoredSocialLinks } from '../data/socialLinksData';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  customLogo?: string | null;
  onUploadLogo?: (url: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  customLogo,
  onUploadLogo,
  onShowToast,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Dynamic social links from settings (Reactive to custom additions & deletions)
  const [socialLinksList, setSocialLinksList] = useState<DynamicSocialLink[]>(getStoredSocialLinks);

  React.useEffect(() => {
    const handleUpdate = () => {
      setSocialLinksList(getStoredSocialLinks());
    };
    window.addEventListener('horizon_social_links_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('horizon_social_links_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadLogo) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUploadLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmailClick = () => {
    const email = 'horizondigitalmedia.official@gmail.com';
    try {
      navigator.clipboard.writeText(email);
      if (onShowToast) {
        onShowToast('Email copied to clipboard: ' + email, 'success');
      }
    } catch {
      // Clipboard write fallback
    }
  };

  return (
    <>
      <footer className="w-full bg-[var(--surface)] border-t border-[var(--line)] pt-16 pb-12 transition-colors duration-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
            {/* Brand Column with Logo Upload Support */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[#070D18] font-bold text-xl shadow-md overflow-hidden"
                >
                  {customLogo ? (
                    <img src={customLogo} alt="Horizon Digital Media Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>H</span>
                  )}
                </div>
                <span className="font-display font-bold text-lg text-[var(--text)] tracking-tight">
                  Horizon Digital Media
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Transforming ideas into high-converting digital media through post-production, visual identity, UGC & CGI ads, AI video, and modern web architectures.
              </p>
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>Accepting Q4 / Q1 Global Projects</span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--text)] mb-4">
                Quick Navigation
              </h3>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <button
                    onClick={() => handleNav('home')}
                    className="hover:text-[var(--secondary)] transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors"
                  >
                    Services & Portfolio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('about')}
                    className="hover:text-[var(--secondary)] transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('contact')}
                    className="hover:text-[var(--secondary)] transition-colors"
                  >
                    Contact & Inquiry
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('terms')}
                    className="hover:text-[var(--secondary)] transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>

            {/* Services Overview */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--text)] mb-4">
                Services Overview
              </h3>
              <ul className="space-y-2.5 text-sm text-[var(--muted)]">
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    Video Editing & Post-Production
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    Graphic Design & Brand Systems
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    UGC & Direct-Response CGI
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    AI Video Editing & FX Generation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    Prompt Engineering Libraries
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('services')}
                    className="hover:text-[var(--secondary)] transition-colors text-left"
                  >
                    Web Development & AI Sites
                  </button>
                </li>
              </ul>
            </div>

            {/* Social Hub */}
            <div>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--text)] mb-4">
                Social Hub
              </h3>
              <p className="text-xs text-[var(--muted)] mb-4">
                Connect directly with Ahsan Yousaf and the Horizon creative studio team across channels:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {socialLinksList.map((item) => {
                  const isEmail = item.platform === 'email' || item.url.startsWith('mailto:');
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target={isEmail ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      onClick={isEmail ? handleEmailClick : undefined}
                      className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] transition-all cursor-pointer hover:scale-110 shadow-sm"
                      title={item.title}
                      aria-label={item.title}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = item.color || 'var(--secondary)';
                        e.currentTarget.style.borderColor = item.color || 'var(--secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.borderColor = '';
                      }}
                    >
                      <i className={`${item.icon} text-sm`}></i>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Horizon Digital Media. All Rights Reserved.</span>
              <span className="text-[var(--line)]">|</span>
              <span>Founder: Ahsan Yousaf</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span className="text-[11px] font-medium">SSL Encrypted</span>
              </div>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-[var(--text)] transition-colors underline decoration-[var(--line)] underline-offset-4 cursor-pointer"
              >
                Privacy Policy
              </button>
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--line)] border border-[var(--line)] text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer group shadow-sm"
                  title="Admin Dashboard (Client Inquiries & Projects)"
                >
                  <i className="fa-solid fa-lock text-[10px] text-[var(--secondary)] group-hover:scale-110 transition-transform"></i>
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] text-lg"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="font-display font-bold text-lg text-[var(--text)] mb-3 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-[var(--secondary)]"></i>
              Privacy Policy & Data Handling
            </h3>
            <div className="text-xs text-[var(--muted)] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                Horizon Digital Media treats all submitted project briefs, email inquiries, WhatsApp correspondence, and project files with strict confidentiality.
              </p>
              <p>
                <strong>Information Collected:</strong> Name, business email, contact number, project requirements, budget selections, and deadline constraints submitted through our inquiry forms.
              </p>
              <p>
                <strong>Usage:</strong> Contact data is utilized solely for communicating project quotations, scheduling kickoff calls, and delivering commissioned digital assets. We never sell, rent, or distribute client contact records to third-party brokers.
              </p>
              <p>
                <strong>Client Confidentiality:</strong> Non-disclosure agreements (NDAs) are routinely honored upon request prior to the transfer of proprietary media assets.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[var(--line)] text-right">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
