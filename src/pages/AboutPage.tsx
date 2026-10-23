import React from 'react';
import { PageId } from '../types';
import { ABOUT_EXPERIENCE, TOOLS_AND_TECH } from '../data/websiteData';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  customProfilePic: string | null;
  onUploadProfilePic?: (url: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  customProfilePic,
  onShowToast,
}) => {
  const handleEmailClick = () => {
    const email = 'horizondigitalmedia.official@gmail.com';
    try {
      navigator.clipboard.writeText(email);
      if (onShowToast) {
        onShowToast('Email copied to clipboard: ' + email, 'success');
      }
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className="w-full py-12 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)] inline-block">
              Founder & Creative Director
            </span>
            <h1
              style={{ fontFamily: 'Georgia, serif' }}
              className="font-bold text-3xl sm:text-5xl lg:text-[54px] leading-tight text-[var(--text)] tracking-tight"
            >
              Ahsan Yousaf{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                creative direction with an AI edge
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
              At Horizon Digital Media, we combine classical cinematic post-production principles with modern generative AI workflows. We believe that technology should amplify taste, not replace it.
            </p>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Based in Pakistan and serving high-growth brands globally, I manage end-to-end media pipelines from initial strategic brief to final multi-platform delivery. Whether engineering direct-response UGC hooks, high-end CGI commercials, or AI-accelerated web experiences, the focus remains constant: clarity, engagement, and conversion.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('contact')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-sm shadow-xl shadow-[var(--glow)] hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Start a Project with Ahsan</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>

              <button
                onClick={() => onNavigate('services')}
                className="px-6 py-3.5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] font-semibold text-sm border border-[var(--line)] transition-all cursor-pointer"
              >
                View Services & Work
              </button>
            </div>
          </div>

          {/* Profile Card (Syncs with Hero Portrait) */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-8 shadow-2xl relative overflow-hidden text-center">
              {/* Photo Box (Clean, non-editable from front end) */}
              <div className="relative w-32 h-32 mx-auto mb-5 rounded-2xl bg-[var(--surface-2)] border-2 border-[var(--secondary)] flex items-center justify-center overflow-hidden shadow-lg">
                {customProfilePic ? (
                  <img
                    src={customProfilePic}
                    alt="Ahsan Yousaf - Founder"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/ahsan-yousaf-portrait.png"
                    alt="Ahsan Yousaf - Founder"
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>

              <h2 className="font-display font-bold text-2xl text-[var(--text)]">
                Ahsan Yousaf
              </h2>
              <p className="text-xs text-[var(--secondary)] font-semibold uppercase tracking-wider mt-1 mb-4">
                Founder • Horizon Digital Media
              </p>

              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm mx-auto mb-6">
                Specializing in post-production direction, generative diffusion pipelines, prompt architecture, and full-stack digital media solutions.
              </p>

              <div className="pt-4 border-t border-[var(--line)] grid grid-cols-2 gap-4 text-left mb-5">
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="text-[11px] text-[var(--muted)]">Location</div>
                  <div className="text-xs font-semibold text-[var(--text)] mt-0.5">Pakistan (Remote Global)</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="text-[11px] text-[var(--muted)]">Status</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">Active Turnarounds</div>
                </div>
              </div>

              {/* Direct Working Social Channels Row */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-[var(--line)]">
                <a
                  href="https://wa.me/923244528683"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[#25D366] hover:text-[#070D18] text-[var(--muted)] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="WhatsApp: 03244528683"
                  aria-label="WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=horizondigitalmedia.official@gmail.com&su=Inquiry%20-%20Horizon%20Digital%20Media"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleEmailClick}
                  className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--secondary)] hover:text-[#070D18] text-[var(--muted)] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Email: horizondigitalmedia.official@gmail.com (Opens Email Composer)"
                  aria-label="Email"
                >
                  <i className="fa-solid fa-envelope"></i>
                </a>
                <a
                  href="https://vm.tiktok.com/ZS9DBEx7RqMWa-LXXM6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[#00F2FE] hover:text-[#070D18] text-[var(--muted)] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Official TikTok Channel"
                  aria-label="TikTok"
                >
                  <i className="fa-brands fa-tiktok"></i>
                </a>
                <a
                  href="https://www.facebook.com/share/1cBv9dCK2S/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[#1877F2] hover:text-white text-[var(--muted)] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Official Facebook Page"
                  aria-label="Facebook"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a
                  href="https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[#E1306C] hover:text-white text-[var(--muted)] flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Official Instagram @horizon.digital.media"
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Cards (Exact displayed ranges from Prompt Section 9) */}
        <div className="mb-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
              Verified Experience
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[var(--text)] mt-1">
              Production Experience & Tenure
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Exact demonstrated experience across critical creative disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ABOUT_EXPERIENCE.map((exp, idx) => (
              <div
                key={idx}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-lg">
                      <i className={`fa-solid ${exp.icon}`}></i>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--primary)] text-[var(--secondary)] font-bold text-xs">
                      {exp.years}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                    {exp.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-[var(--primary)]"></i>
                  <span>Active production capacity</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools and Technology Section (Prompt Section 9) */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
              Production Toolkit
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[var(--text)] mt-1">
              Tools & Technology
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Industry-standard non-linear editors, motion graphics engines, generative diffusion tools, and modern web frameworks utilized across our pipelines.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TOOLS_AND_TECH.map((tool, idx) => (
              <div
                key={idx}
                className="bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--secondary)] rounded-xl p-4 text-center transition-all hover:-translate-y-1"
              >
                <div className="font-display font-bold text-sm text-[var(--text)] mb-1">
                  {tool.name}
                </div>
                <div className="text-[10px] text-[var(--muted)] font-mono">
                  {tool.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
