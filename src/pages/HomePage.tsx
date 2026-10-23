import React, { useState, useEffect, useRef } from 'react';
import { PageId, PortfolioCard, ClientReview } from '../types';
import { HOMEPAGE_SERVICES, HOMEPAGE_CLIENT_REVIEWS, PORTFOLIO_ITEMS } from '../data/websiteData';
import { removeWhiteBackground, idbGet } from '../utils/imageUtils';
import { getStoredCustomReviews, addCustomReview, getSiteWhatsApp } from '../utils/siteConfig';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  customProfilePic: string | null;
  onUploadProfilePic: (url: string) => void;
  onResetProfilePic?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  customProfilePic,
  onUploadProfilePic,
  onResetProfilePic,
}) => {
  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [customReviews, setCustomReviews] = useState<ClientReview[]>(() => getStoredCustomReviews());
  const allReviews: ClientReview[] = React.useMemo(() => {
    const map = new Map<string, ClientReview>();
    customReviews.forEach((r, idx) => {
      if (r) {
        const cleanId = String(r.id || `custom-rev-${idx}`);
        map.set(cleanId, { ...r, id: cleanId });
      }
    });
    HOMEPAGE_CLIENT_REVIEWS.forEach((r, idx) => {
      if (r) {
        const cleanId = String(r.id || `preset-rev-${idx}`);
        if (!map.has(cleanId)) {
          map.set(cleanId, { ...r, id: cleanId });
        }
      }
    });
    return Array.from(map.values());
  }, [customReviews]);
  const totalReviews = allReviews.length;
  const [recentProjects, setRecentProjects] = useState<PortfolioCard[]>([]);

  // WhatsApp number dynamic state
  const [waHotline, setWaHotline] = useState(() => getSiteWhatsApp());

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewCountry, setReviewCountry] = useState('Pakistan');
  const [reviewRole, setReviewRole] = useState('');
  const [reviewCompany, setReviewCompany] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewService, setReviewService] = useState('video-editing');
  const [reviewQuote, setReviewQuote] = useState('');
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState('');

  useEffect(() => {
    const handleWaUpdate = () => setWaHotline(getSiteWhatsApp());
    const handleRevUpdate = () => setCustomReviews(getStoredCustomReviews());
    window.addEventListener('horizon_whatsapp_updated', handleWaUpdate);
    window.addEventListener('horizon_reviews_updated', handleRevUpdate);
    window.addEventListener('storage', handleWaUpdate);
    return () => {
      window.removeEventListener('horizon_whatsapp_updated', handleWaUpdate);
      window.removeEventListener('horizon_reviews_updated', handleRevUpdate);
      window.removeEventListener('storage', handleWaUpdate);
    };
  }, []);

  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('horizon_deleted_project_ids') || '[]');
        const customList = (await idbGet<PortfolioCard[]>('horizon_user_projects')) || [];
        const combined = [...customList, ...PORTFOLIO_ITEMS].filter((p) => !deleted.includes(p.id));
        setRecentProjects(combined.slice(0, 3));
      } catch {
        setRecentProjects(PORTFOLIO_ITEMS.slice(0, 3));
      }
    };
    loadRecentProjects();
    window.addEventListener('horizon_projects_updated', loadRecentProjects);
    window.addEventListener('storage', loadRecentProjects);
    return () => {
      window.removeEventListener('horizon_projects_updated', loadRecentProjects);
      window.removeEventListener('storage', loadRecentProjects);
    };
  }, []);

  // Mouse drag-to-scroll state for manual desktop interaction
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  // Sync active indicator dot with manual scroll position
  const handleReviewsScroll = () => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    setActiveReviewIndex(Math.min(totalReviews - 1, Math.max(0, newIdx)));
  };

  const scrollToIndex = (idx: number) => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const cards = el.children;
    const targetCard = cards[idx] as HTMLElement;
    if (targetCard) {
      el.scrollTo({
        left: targetCard.offsetLeft - el.offsetLeft,
        behavior: 'smooth',
      });
      setActiveReviewIndex(idx);
    }
  };

  const handlePrevReview = () => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth : 320;
    if (el.scrollLeft <= 10) {
      scrollToIndex(totalReviews - 1);
    } else {
      el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleNextReview = () => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth : 320;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 10) {
      scrollToIndex(0);
    } else {
      el.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll handlers for manual mouse control
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const el = reviewsTrackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.3;
    el.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const activePortrait = customProfilePic || '/ahsan-yousaf-portrait.png';

  return (
    <div className="w-full">
      {/* =========================================================================
          SECTION A: HERO SECTION (Clean pixel-accurate reproduction of Capture.PNG)
          ========================================================================= */}
      <section className="relative w-full pt-10 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Subtle dot matrix background */}
        <div className="absolute inset-0 hero-dot-grid pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Eyebrow, Main Headline, Paragraph, CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[var(--secondary)]"></span>
                <span className="text-[var(--secondary)] text-xs sm:text-sm font-bold tracking-widest uppercase">
                  PAKISTAN-BASED CREATIVE PARTNER FOR GLOBAL BRANDS
                </span>
              </div>

              {/* Main Headline (Styled with Georgia serif as requested) */}
              <h1
                style={{ fontFamily: 'Georgia, serif' }}
                className="font-bold text-3xl sm:text-4xl md:text-[44px] lg:text-[50px] leading-[1.15] tracking-tight text-[var(--text)] max-w-xl"
              >
                Hi, I’m{' '}
                <span className="text-[var(--secondary)]">
                  Ahsan Yousaf,
                </span>
                <br />
                Founder of Horizon
                <br />
                Digital Media
              </h1>

              {/* Supporting Paragraph */}
              <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                <strong className="text-[var(--text)] font-bold">4+ Years</strong> Transforming Ideas into High-Converting Digital Media. I combine visual storytelling, post-production, design, UGC, CGI and AI workflows to help brands communicate with clarity and impact.
              </p>

              {/* Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('contact')}
                  className="relative group overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-base shadow-xl shadow-[var(--glow)] hover:shadow-2xl hover:shadow-[var(--glow)] transition-all duration-300 flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  {/* Subtle shine glint across the button on hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                  <span className="relative z-10">Start a Project</span>
                  <i className="fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1.5 relative z-10"></i>
                </button>

                <button
                  onClick={() => onNavigate('services')}
                  className="px-7 py-4 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] font-semibold text-base border border-[var(--line)] hover:border-[var(--secondary)] hover:shadow-lg hover:shadow-[var(--glow)] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                >
                  Explore Portfolio
                </button>
              </div>

              {/* Quick Credentials / KPI Indicators (Space Grotesk Bold Metrics) */}
              <div className="pt-8 border-t border-[var(--line)] grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--text)]"
                  >
                    4+
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-bold">
                    Years Experience
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--secondary)]"
                  >
                    150+
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-bold">
                    Delivered Projects
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--text)]"
                  >
                    99%
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-bold">
                    Client Satisfaction
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--primary)] flex items-center gap-2"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]"></span>
                    </span>
                    <span>24/7</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-bold">
                    Global Agility
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Founder Presentation Frame with Theme Lighting & Shining Aura */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
              {/* Dynamic Theme Backlight Shining Aura */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                <div
                  className="w-[300px] sm:w-[400px] lg:w-[440px] h-[300px] sm:h-[400px] lg:h-[440px] rounded-full blur-[75px] sm:blur-[95px] opacity-75 transition-all duration-700 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, var(--secondary) 0%, var(--primary) 40%, transparent 70%)',
                  }}
                />
              </div>

              {/* Founder Frame with Glowing Theme Lighting Border & Outer Glow */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center">
                <div
                  className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] aspect-[4/5] rounded-3xl p-[3px] transition-all duration-500 relative group"
                  style={{
                    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 50%, var(--secondary) 100%)',
                    boxShadow: '0 0 25px var(--glow), 0 0 50px var(--glow), inset 0 0 15px var(--glow)',
                  }}
                >
                  {/* Subtle inner border line */}
                  <div className="w-full h-full rounded-[21px] overflow-hidden bg-[var(--surface-2)] relative flex items-center justify-center shadow-inner">
                    <img
                      src={activePortrait}
                      alt="Ahsan Yousaf - Founder of Horizon Digital Media"
                      className="w-full h-full object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {/* Subtle ambient gradient overlay at bottom of frame */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-2)]/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Glassmorphic Presentation Badge (Clean, without front-end camera or reset buttons) */}
                <div className="w-full max-w-sm px-2 pt-4 flex items-center justify-center relative z-20">
                  <div className="w-full bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                        <span>Ahsan Yousaf</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--secondary)] border border-[var(--line)] font-medium">Founder</span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)]">Horizon Digital Media</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] font-semibold text-emerald-400">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: EXPERIENCE & EXPERTISE
          ========================================================================= */}
      <section className="w-full py-16 bg-[var(--surface)] border-y border-[var(--line)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
              Core Competencies
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mt-2">
              Proven expertise across the digital creative spectrum.
            </h2>
            <p className="text-[var(--muted)] text-base mt-3 leading-relaxed">
              Every production is approached with an obsession for retention, visual hierarchy, and measurable conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-xl mb-4">
                <i className="fa-solid fa-film"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Post-Production
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                4 years mastering cinematic rhythm, retention pacing, multi-track audio soundscapes, and color grading.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--primary)] text-xl mb-4">
                <i className="fa-solid fa-palette"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Brand & Graphic Design
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                High-CTR thumbnail architecture, typography systems, vector branding, and investor-ready presentation decks.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-xl mb-4">
                <i className="fa-solid fa-cubes"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                UGC & 3D CGI Ads
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Paid acquisition creatives that stop thumbs within 1.5s using physics dynamics and authentic hook angles.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--primary)] text-xl mb-4">
                <i className="fa-solid fa-code"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                AI & Web Architecture
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Generative AI prompt engines, custom web applications, responsive architectures, and intelligent workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: RECENT CREATIVE PROJECTS (Synced with Admin Settings & Services)
          ========================================================================= */}
      <section className="w-full py-16 bg-[var(--surface-2)]/40 border-y border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
                Latest Production Drops
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mt-1">
                Recent Projects & Deliverables
              </h2>
              <p className="text-[var(--muted)] text-sm mt-1 max-w-xl">
                Freshly finished video cuts, brand identity kits, 3D CGI spots, and high-CTR YouTube suites.
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-bold text-[var(--secondary)] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore All Work in Showcase</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((p, pIdx) => {
              const cover = p.customImage || (p.images && p.images[0]);
              return (
                <div
                  key={`hp-project-${p.id || pIdx}-${pIdx}`}
                  onClick={() => onNavigate('services')}
                  className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--secondary)]/60 rounded-2xl overflow-hidden card-hover-glow cursor-pointer group flex flex-col justify-between transition-all"
                >
                  <div className="aspect-video bg-[var(--surface-2)] relative overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                        <i className="fa-solid fa-layer-group text-3xl opacity-50"></i>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                      {p.category}
                    </span>
                    {p.videoUrl && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-[#38BDF8] text-[#070D18] font-bold text-[10px] flex items-center gap-1">
                        <i className="fa-solid fa-play text-[8px]"></i>
                        <span>Video Playback</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-base text-[var(--text)] group-hover:text-[var(--secondary)] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: OUR SERVICES (Comprehensive categories)
          ========================================================================= */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
                Our Services
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mt-2">
                Creative Production & Digital Solutions
              </h2>
              <p className="text-[var(--muted)] text-base mt-2 max-w-xl">
                End-to-end creative capabilities engineered for creators, direct-to-consumer brands, and forward-thinking enterprises.
              </p>
            </div>

            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] text-sm font-semibold text-[var(--text)] transition-colors self-start md:self-auto flex items-center gap-2"
            >
              <span>View All Portfolio Cards</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-xs text-[var(--secondary)]"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HOMEPAGE_SERVICES.map((srv, idx) => (
              <div
                key={`hp-srv-${srv.id || idx}-${idx}`}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-7 card-hover-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-xl">
                      <i className={`fa-solid ${srv.icon}`}></i>
                    </div>
                    <span className="text-xs font-mono text-[var(--muted)]">
                      0{idx + 1}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--secondary)]">
                    {srv.category}
                  </span>
                  <h3 className="font-display font-bold text-xl text-[var(--text)] mt-1 mb-3">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                    {srv.description}
                  </p>

                  <ul className="space-y-2 border-t border-[var(--line)] pt-4 mb-6">
                    {srv.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-xs text-[var(--muted)] flex items-center gap-2">
                        <i className="fa-solid fa-check text-[var(--primary)] text-[10px]"></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate('services')}
                  className="w-full py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--text)] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Explore Portfolio Samples</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: PRODUCTION PIPELINE
          ========================================================================= */}
      <section className="w-full py-20 bg-[var(--surface)] border-y border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
              Workflow Architecture
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mt-2">
              A creative operator who understands the production pipeline.
            </h2>
            <p className="text-[var(--muted)] text-base mt-3 leading-relaxed">
              We eliminate creative bottlenecks through structured checkpoints, clear milestones, and rapid iteration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 relative">
              <span className="font-display font-bold text-3xl text-[var(--secondary)] opacity-80 block mb-3">
                01
              </span>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Strategic Brief
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Deconstruct target demographics, core conversion hooks, aspect ratios, brand guidelines, and benchmark references.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 relative">
              <span className="font-display font-bold text-3xl text-[var(--secondary)] opacity-80 block mb-3">
                02
              </span>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Concept & Script
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pacing architectures, visual storyboarding, generative prompt framing, and initial wireframes.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 relative">
              <span className="font-display font-bold text-3xl text-[var(--secondary)] opacity-80 block mb-3">
                03
              </span>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Production & Assembly
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Precision cutting, multi-cam assembly, Foley sound mastering, color timing, 3D elements, or modern frontend build.
              </p>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6 relative">
              <span className="font-display font-bold text-3xl text-[var(--secondary)] opacity-80 block mb-3">
                04
              </span>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-2">
                Review & Delivery
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Frame.io / Cloud review with timecoded annotations, up to 2 rounds of polish, and master deliverables package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H: WHAT CLIENTS SAY (Curated & Real Client Reviews, Square Box Carousel)
          ========================================================================= */}
      <section className="w-full py-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Navigation Controls & Leave Review Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--secondary)]" />
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
                  Client Feedback & Social Proof
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mt-1">
                Verified Client Collaborations & Reviews
              </h2>
              <p className="text-[var(--muted)] text-sm sm:text-base mt-2">
                Real feedback from Pakistani and international brands. Leave your own feedback or browse verified client reviews with smooth swipe, drag, or arrow controls.
              </p>
            </div>

            {/* Controls: Leave a Review Button & Carousel Arrows */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md hover:opacity-95 cursor-pointer"
              >
                <i className={`fa-solid ${showReviewForm ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
                <span>{showReviewForm ? 'Close Review Form' : 'Leave a Client Review'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevReview}
                  aria-label="Previous review"
                  title="Previous review"
                  className="w-10 h-10 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--secondary)] text-[var(--text)] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  onClick={handleNextReview}
                  aria-label="Next review"
                  title="Next review"
                  className="w-10 h-10 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--secondary)] text-[var(--text)] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Review Submission Success Notice */}
          {reviewSubmittedNotice && (
            <div className="mb-8 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <i className="fa-solid fa-circle-check text-base text-emerald-400"></i>
              <span>{reviewSubmittedNotice}</span>
            </div>
          )}

          {/* Interactive Review Submission Box (Placed Above Reviews as Requested) */}
          {showReviewForm && (
            <div className="mb-10 bg-[var(--surface)] border-2 border-[var(--secondary)]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--secondary)] mb-1">
                  <i className="fa-solid fa-star text-amber-400"></i>
                  <span>Submit Client Feedback & Star Rating</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-[var(--text)] mb-1">
                  Share Your Experience With Horizon Digital Media
                </h3>
                <p className="text-xs text-[var(--muted)] mb-6">
                  Your feedback helps global clients discover our production standards. Reviews are published directly to the portfolio.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reviewName.trim() || !reviewQuote.trim()) return;

                    const countryLower = reviewCountry.toLowerCase();
                    let originType: 'pakistani' | 'american' | 'international' = 'international';
                    if (countryLower.includes('pakistan')) originType = 'pakistani';
                    else if (countryLower.includes('usa') || countryLower.includes('united states')) originType = 'american';

                    const uniqueReviewId = `rev-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                    const newRev: ClientReview = {
                      id: uniqueReviewId,
                      name: reviewName.trim(),
                      origin: originType,
                      location: reviewCompany.trim() ? `${reviewCompany.trim()}, ${reviewCountry}` : reviewCountry,
                      role: reviewRole.trim() || 'Verified Client',
                      company: reviewCompany.trim() || undefined,
                      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewName.trim())}&background=0D1424&color=38BDF8&bold=true`,
                      rating: reviewRating,
                      quote: reviewQuote.trim(),
                      serviceCategory: reviewService,
                    };

                    addCustomReview(newRev);
                    setCustomReviews(getStoredCustomReviews());
                    setReviewSubmittedNotice('Thank you! Your verified client review has been published live.');
                    setReviewName('');
                    setReviewRole('');
                    setReviewCompany('');
                    setReviewQuote('');
                    setReviewRating(5);
                    setShowReviewForm(false);
                    setTimeout(() => setReviewSubmittedNotice(''), 6000);
                  }}
                  className="space-y-4"
                >
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          title={`${star} Star`}
                        >
                          <i
                            className={`fa-solid fa-star ${
                              star <= reviewRating
                                ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-white/20'
                            }`}
                          ></i>
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2">
                        {reviewRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Row 1: Name & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                        Your Full Name <span className="text-red-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Bilal Ahmed / Sarah Miller"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--secondary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                        Country <span className="text-red-400 font-bold">*</span>
                      </label>
                      <select
                        value={reviewCountry}
                        onChange={(e) => setReviewCountry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)] cursor-pointer"
                      >
                        <option value="Pakistan" className="bg-[#070D18]">🇵🇰 Pakistan</option>
                        <option value="USA" className="bg-[#070D18]">🇺🇸 United States</option>
                        <option value="United Kingdom" className="bg-[#070D18]">🇬🇧 United Kingdom</option>
                        <option value="Canada" className="bg-[#070D18]">🇨🇦 Canada</option>
                        <option value="United Arab Emirates" className="bg-[#070D18]">🇦🇪 United Arab Emirates</option>
                        <option value="Saudi Arabia" className="bg-[#070D18]">🇸🇦 Saudi Arabia</option>
                        <option value="Malaysia" className="bg-[#070D18]">🇲🇾 Malaysia</option>
                        <option value="India" className="bg-[#070D18]">🇮🇳 India</option>
                        <option value="Australia" className="bg-[#070D18]">🇦🇺 Australia</option>
                        <option value="Germany" className="bg-[#070D18]">🇩🇪 Germany</option>
                        <option value="International" className="bg-[#070D18]">🌐 International</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Role / Brand & Service */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                        Role & Company / Brand
                      </label>
                      <input
                        type="text"
                        value={reviewCompany}
                        onChange={(e) => setReviewCompany(e.target.value)}
                        placeholder="e.g. Founder, Peak Media"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--secondary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                        Service Received
                      </label>
                      <select
                        value={reviewService}
                        onChange={(e) => setReviewService(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)] cursor-pointer"
                      >
                        <option value="video-editing" className="bg-[#070D18]">Video Editing & Post-Production</option>
                        <option value="graphic-designing" className="bg-[#070D18]">Brand Identity & Graphic Design</option>
                        <option value="ugc-cgi" className="bg-[#070D18]">UGC Performance Ads & CGI</option>
                        <option value="web-development" className="bg-[#070D18]">Modern Web Development</option>
                        <option value="prompt-engineering" className="bg-[#070D18]">AI & Creative Production</option>
                      </select>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                      Your Review / Feedback <span className="text-red-400 font-bold">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewQuote}
                      onChange={(e) => setReviewQuote(e.target.value)}
                      placeholder="Write your honest feedback regarding delivery speed, communication, and creative output..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--secondary)]"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 cursor-pointer"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Manual Scroll & Drag Track (3 Visible Cards on Desktop, Square 1:1 Boxes) */}
          <div
            ref={reviewsTrackRef}
            onScroll={handleReviewsScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 -mx-3 [&::-webkit-scrollbar]:hidden ${
              isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {allReviews.map((rev, index) => (
              <div
                key={`home-rev-card-${rev.id || index}-${index}`}
                className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-3 snap-start select-none"
              >
                {/* Square Box Card (1:1 Aspect Ratio) */}
                <div className="w-full aspect-square max-w-[340px] mx-auto bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--secondary)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 card-hover-glow flex flex-col justify-between relative overflow-hidden group select-none shadow-xl transition-all duration-300">
                  {/* Top ambient glow blob */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--glow)] rounded-full blur-2xl opacity-30 group-hover:opacity-75 transition-opacity pointer-events-none" />

                  {/* Card Top: Stars Rating & Country Badge */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1 text-xs">
                      {[...Array(rev.rating)].map((_, i) => (
                        <i
                          key={i}
                          className="fa-solid fa-star text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                        ></i>
                      ))}
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)] flex items-center gap-1">
                      <span>
                        {rev.location.includes('Pakistan')
                          ? '🇵🇰'
                          : rev.location.includes('USA')
                          ? '🇺🇸'
                          : '🇬🇧'}
                      </span>
                      <span>
                        {rev.origin === 'pakistani'
                          ? 'Pakistan'
                          : rev.origin === 'american'
                          ? 'USA'
                          : 'UK'}
                      </span>
                    </span>
                  </div>

                  {/* Card Middle: Quote with icon */}
                  <div className="my-auto py-2 relative z-10">
                    <i className="fa-solid fa-quote-left text-[var(--secondary)] opacity-30 text-lg mb-1 block"></i>
                    <p className="text-xs sm:text-[13px] text-[var(--text)] leading-relaxed italic line-clamp-4 font-normal">
                      “{rev.quote}”
                    </p>
                  </div>

                  {/* Card Bottom: Client Info & Avatar with verified badge */}
                  <div className="border-t border-[var(--line)] pt-3 flex items-center gap-3 relative z-10">
                    <div className="relative shrink-0">
                      <img
                        src={rev.avatarUrl}
                        alt={rev.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[var(--secondary)]/70 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--surface)] flex items-center justify-center text-[7px] text-white"
                        title="Verified Client"
                      >
                        <i className="fa-solid fa-check"></i>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                        {rev.name}
                      </h4>
                      <p className="text-[11px] text-[var(--secondary)] font-medium truncate">
                        {rev.role}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] truncate">
                        {rev.company ? `${rev.company} • ` : ''}
                        {rev.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {allReviews.map((rev, dotIdx) => {
              const isActive = activeReviewIndex === dotIdx;
              return (
                <button
                  key={`home-rev-dot-${rev.id || dotIdx}-${dotIdx}`}
                  onClick={() => scrollToIndex(dotIdx)}
                  aria-label={`Go to review ${dotIdx + 1} (${rev.name})`}
                  title={`Review ${dotIdx + 1}: ${rev.name}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-7 h-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-sm shadow-[var(--glow)]'
                      : 'w-2.5 h-2.5 bg-[var(--surface-2)] border border-[var(--line)] hover:bg-[var(--muted)]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION I: CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="w-full py-16 bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] border-t border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
            Ready To Launch?
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-[var(--text)]">
            Let’s build high-converting media for your brand.
          </h2>
          <p className="text-[var(--muted)] text-base max-w-xl mx-auto">
            From single hero commercials to full monthly production pipelines. Schedule your project inquiry or reach out via WhatsApp today.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-base shadow-xl shadow-[var(--glow)] hover:opacity-95 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Submit Project Inquiry</span>
              <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </button>

            <a
              href={`https://wa.me/${waHotline.clean}`}
              target="_blank"
              rel="noreferrer"
              className="px-7 py-4 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-base transition-all flex items-center gap-2.5"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
