import React, { useState, useEffect } from 'react';
import { getPromoConfig, PromoConfig, HOMEPAGE_SERVICES } from '../utils/siteConfig';

interface PromoOfferModalProps {
  onClaimPromo: (code: string) => void;
  isLightMode?: boolean;
}

export const PromoOfferModal: React.FC<PromoOfferModalProps> = ({ onClaimPromo, isLightMode: isLightModeProp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<PromoConfig>(() => getPromoConfig());
  const [isLight, setIsLight] = useState<boolean>(() => {
    return isLightModeProp ?? (localStorage.getItem('horizon_theme_mode') === 'light');
  });

  useEffect(() => {
    if (typeof isLightModeProp === 'boolean') {
      setIsLight(isLightModeProp);
    }
  }, [isLightModeProp]);

  useEffect(() => {
    const handleModeSync = () => {
      setIsLight(localStorage.getItem('horizon_theme_mode') === 'light' || document.documentElement.getAttribute('data-theme-mode') === 'light');
    };
    window.addEventListener('storage', handleModeSync);
    window.addEventListener('horizon_theme_changed', handleModeSync);
    return () => {
      window.removeEventListener('storage', handleModeSync);
      window.removeEventListener('horizon_theme_changed', handleModeSync);
    };
  }, []);

  // Live Digital Countdown Clock Watch state (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Strict listener for admin updates
  useEffect(() => {
    const handleUpdate = () => {
      const latest = getPromoConfig();
      setConfig(latest);

      // STRICT TOGGLE: only show if explicitly enabled
      if (latest.enabled === true && latest.popupEnabled === true) {
        try {
          sessionStorage.removeItem('horizon_promo_popup_dismissed');
          localStorage.removeItem('horizon_promo_popup_dismissed');
        } catch {}
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('horizon_promo_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('horizon_promo_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Strict check on mount/config change: ONLY show if popupEnabled is explicitly true
  useEffect(() => {
    if (config.enabled !== true || config.popupEnabled !== true) {
      setIsOpen(false);
      return;
    }

    const isDismissed = sessionStorage.getItem('horizon_promo_popup_dismissed');
    if (isDismissed) {
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [config.enabled, config.popupEnabled, config.dealName]);

  // Live ticking digital watch countdown timer
  useEffect(() => {
    if (!isOpen || config.popupEnabled !== true) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      let target = config.dealEndTime;

      // If target is missing or past, generate a future window based on durationHours
      if (!target || target <= now) {
        const hours = config.durationHours || 24;
        target = now + hours * 3600 * 1000;
      }

      const diff = Math.max(0, target - now);
      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [isOpen, config.dealEndTime, config.durationHours, config.popupEnabled]);

  // STRICT GUARD: Must never render if popupEnabled is false or enabled is false
  if (!isOpen || config.enabled !== true || config.popupEnabled !== true) {
    return null;
  }

  const activeCode = config.primaryPromoCode || config.codes[0] || 'HDM25';
  const discountPct = Number(String(config.popupDiscountValue || config.discountPercent || '25').replace(/[^0-9]/g, '')) || 25;
  const regularPrice = config.regularPriceDisplay || '$100';
  const discountPrice =
    config.discountPriceDisplay || `$${Math.round(100 * (1 - discountPct / 100))}`;

  const serviceNameDisplay = () => {
    if (!config.targetService || config.targetService === 'all') return 'All Creative Services';
    const s = HOMEPAGE_SERVICES.find((srv: { id: string; title: string }) => srv.id === config.targetService);
    return s ? s.title : config.targetService;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('horizon_promo_popup_dismissed', 'true');
    setIsOpen(false);
  };

  const handleClaim = () => {
    sessionStorage.setItem('horizon_promo_popup_dismissed', 'true');
    setIsOpen(false);
    onClaimPromo(activeCode);
  };

  // Helper for digital watch digit display
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Sleek, Compact, Non-Intrusive floating modal card */}
      <div
        className="relative w-full max-w-[310px] sm:max-w-[325px] border-2 rounded-2xl p-3.5 sm:p-4 shadow-2xl transition-colors duration-300 overflow-hidden transform animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: isLight ? '#ffffff' : 'var(--surface)',
          color: isLight ? '#081220' : '#f6fbff',
          borderColor: 'var(--secondary)',
          boxShadow: isLight
            ? '0 16px 40px rgba(0,0,0,0.18), 0 0 20px var(--glow)'
            : '0 12px 40px var(--glow), 0 0 20px var(--glow)',
        }}
      >
        {/* Ambient color glow matching active theme */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-xl opacity-35 pointer-events-none"
          style={{ background: 'var(--secondary)' }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-xl opacity-25 pointer-events-none"
          style={{ background: 'var(--primary)' }}
        />

        {/* Top Header: Badge, Title & Close Button */}
        <div className="flex items-start justify-between gap-1.5 relative z-10 mb-2">
          <div className="space-y-1 pr-4 min-w-0">
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-[var(--secondary)]/40 text-[var(--secondary)] shadow-xs"
              style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'var(--surface-2)' }}
            >
              <i className="fa-solid fa-bolt text-[8px] animate-pulse"></i>
              <span>Live Promotional Deal</span>
            </div>
            <h3
              className="font-display font-extrabold text-sm sm:text-base leading-tight truncate transition-colors"
              style={{ color: isLight ? '#081220' : '#FFFFFF' }}
            >
              {config.dealName || config.offerName || 'Special Discount Deal'}
            </h3>
          </div>

          {/* Close button on top-right */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Promo"
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0 border border-transparent hover:border-black/10"
            style={{
              backgroundColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.1)',
              color: isLight ? '#081220' : '#FFFFFF',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Target Service info */}
        <p
          className="text-[10px] leading-snug relative z-10 mb-2.5 transition-colors"
          style={{ color: isLight ? '#475569' : 'var(--muted)' }}
        >
          Limited-time offer on{' '}
          <strong className="text-[var(--secondary)] font-semibold">
            {serviceNameDisplay()}
          </strong>
          . Apply coupon at checkout for instant savings.
        </p>

        {/* ========================================================================= */}
        {/* LIVE DIGITAL COUNTDOWN CLOCK WATCH (Hours, Minutes, Seconds Ticking Live) */}
        {/* ========================================================================= */}
        <div
          className="relative z-10 mb-2.5 p-2 rounded-xl border text-center transition-colors"
          style={{
            backgroundColor: isLight ? '#f8fafc' : 'rgba(0,0,0,0.6)',
            borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'var(--secondary)',
            boxShadow: isLight
              ? 'inset 0 1px 3px rgba(0,0,0,0.05), 0 0 8px var(--glow)'
              : 'inset 0 0 12px rgba(0,0,0,0.5), 0 0 8px var(--glow)',
          }}
        >
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-[var(--secondary)] tracking-wider mb-1.5">
            <i className="fa-regular fa-clock animate-spin text-[8px]" style={{ animationDuration: '4s' }}></i>
            <span>Deal Expiration Watch</span>
          </div>

          {/* Digital Clock Display: HH : MM : SS */}
          <div className="flex items-center justify-center gap-1.5">
            {/* Hours Block */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 sm:w-11 h-8 sm:h-8.5 rounded-lg border flex items-center justify-center font-mono font-black text-base sm:text-lg shadow-inner transition-colors"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'var(--surface-2)',
                  borderColor: isLight ? '#cbd5e1' : 'var(--line)',
                  color: isLight ? '#081220' : '#FFFFFF',
                }}
              >
                {pad(timeLeft.hours)}
              </div>
              <span
                className="text-[8px] font-mono uppercase font-semibold mt-0.5"
                style={{ color: isLight ? '#64748b' : 'var(--muted)' }}
              >
                Hours
              </span>
            </div>

            {/* Pulsing Colon */}
            <span className="font-mono font-black text-sm text-[var(--secondary)] -mt-3 animate-pulse select-none">:</span>

            {/* Minutes Block */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 sm:w-11 h-8 sm:h-8.5 rounded-lg border flex items-center justify-center font-mono font-black text-base sm:text-lg shadow-inner transition-colors"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'var(--surface-2)',
                  borderColor: isLight ? '#cbd5e1' : 'var(--line)',
                  color: isLight ? '#081220' : '#FFFFFF',
                }}
              >
                {pad(timeLeft.minutes)}
              </div>
              <span
                className="text-[8px] font-mono uppercase font-semibold mt-0.5"
                style={{ color: isLight ? '#64748b' : 'var(--muted)' }}
              >
                Mins
              </span>
            </div>

            {/* Pulsing Colon */}
            <span className="font-mono font-black text-sm text-[var(--secondary)] -mt-3 animate-pulse select-none">:</span>

            {/* Seconds Block */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 sm:w-11 h-8 sm:h-8.5 rounded-lg border-2 border-[var(--secondary)] flex items-center justify-center font-mono font-black text-base sm:text-lg text-[var(--secondary)] shadow-inner transition-colors"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'var(--surface-2)',
                  boxShadow: '0 0 8px var(--glow)',
                }}
              >
                {pad(timeLeft.seconds)}
              </div>
              <span className="text-[8px] font-mono text-[var(--secondary)] uppercase font-bold mt-0.5">Secs</span>
            </div>
          </div>
        </div>

        {/* Compact Comparison Cards (Regular vs Discount Rate) */}
        <div className="grid grid-cols-2 gap-1.5 relative z-10 mb-2.5">
          {/* Regular Box */}
          <div
            className="rounded-lg p-1.5 text-center flex flex-col justify-between border transition-colors"
            style={{
              backgroundColor: isLight ? '#f8fafc' : 'var(--surface-2)',
              borderColor: isLight ? '#e2e8f0' : 'var(--line)',
            }}
          >
            <span
              className="text-[8px] uppercase font-bold tracking-wider"
              style={{ color: isLight ? '#64748b' : 'var(--muted)' }}
            >
              Standard
            </span>
            <div
              className="font-mono font-bold text-xs line-through my-0.5"
              style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }}
            >
              {regularPrice}
            </div>
            <span
              className="text-[8px] font-mono"
              style={{ color: isLight ? '#64748b' : 'var(--muted)' }}
            >
              Regular
            </span>
          </div>

          {/* Deal Box with active theme glow */}
          <div
            className="rounded-lg p-1.5 text-center flex flex-col justify-between border border-[var(--secondary)] relative transition-colors"
            style={{
              backgroundColor: isLight ? '#f0fdf4' : 'rgba(17,28,46,0.9)',
              boxShadow: '0 0 10px var(--glow)',
            }}
          >
            <span className="text-[8px] uppercase font-black tracking-wider text-[var(--secondary)]">
              {discountPct}% OFF
            </span>
            <div className="font-mono font-black text-sm text-[var(--secondary)] my-0.5">
              {discountPrice}
            </div>
            <span className="text-[8px] text-emerald-500 font-bold font-mono">Deal Price</span>
          </div>
        </div>

        {/* Coupon Code Pill with 1-Click Copy */}
        <div
          className="border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs relative z-10 mb-2.5 transition-colors"
          style={{
            backgroundColor: isLight ? '#f8fafc' : 'rgba(0,0,0,0.6)',
            borderColor: isLight ? '#cbd5e1' : 'var(--line)',
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <i className="fa-solid fa-ticket text-amber-500 text-[10px]"></i>
            <span
              className="font-mono font-extrabold text-[11px] truncate select-all tracking-wide"
              style={{ color: isLight ? '#081220' : '#FFFFFF' }}
            >
              {activeCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 px-1.5 py-0.5 rounded border border-transparent hover:border-black/10"
            style={{
              backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
              color: isLight ? '#081220' : 'var(--secondary)',
            }}
          >
            <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Button: Dynamic Theme Gradient "Grab Now!" */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={handleClaim}
            className="w-full py-2.5 px-3 rounded-xl text-[#070D18] font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
              boxShadow: '0 3px 14px var(--glow)',
            }}
          >
            <span>Grab Deal & Book Brief</span>
            <i className="fa-solid fa-arrow-right text-[9px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
