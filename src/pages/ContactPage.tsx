import React, { useState, useEffect } from 'react';
import { ProjectInquiry } from '../types';
import { COUNTRY_CODES, SERVICE_OPTIONS, BUDGET_OPTIONS } from '../data/websiteData';
import { saveInquiryToFirestore } from '../lib/firebase';
import {
  validateInternationalPhone,
  validateProfessionalEmail,
  validatePromoCode,
  getUrgentAdvancePercentForService,
  getSiteWhatsApp,
} from '../utils/siteConfig';

interface ContactPageProps {
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  initialPromoCode?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onShowToast, initialPromoCode }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [budget, setBudget] = useState('$2,500');
  const [customBudget, setCustomBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [isRushDelivery, setIsRushDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBrief, setSubmittedBrief] = useState<ProjectInquiry | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // WhatsApp Dynamic Hotline
  const [waHotline, setWaHotline] = useState(() => getSiteWhatsApp());

  // Promo Code Engine State
  const [promoCodeInput, setPromoCodeInput] = useState(() => {
    return initialPromoCode || sessionStorage.getItem('horizon_claimed_promo') || '';
  });
  const [appliedPromo, setAppliedPromo] = useState<{
    isValid: boolean;
    discountPercent: number;
    offerName: string;
    message: string;
  } | null>(() => {
    const code = initialPromoCode || sessionStorage.getItem('horizon_claimed_promo');
    if (code) {
      const res = validatePromoCode(code);
      if (res.isValid) return res;
    }
    return null;
  });
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    const handleWaUpdate = () => setWaHotline(getSiteWhatsApp());
    window.addEventListener('horizon_whatsapp_updated', handleWaUpdate);
    window.addEventListener('storage', handleWaUpdate);
    return () => {
      window.removeEventListener('horizon_whatsapp_updated', handleWaUpdate);
      window.removeEventListener('storage', handleWaUpdate);
    };
  }, []);

  // Budget and Discounted Price Calculations
  const rawBudgetStr = budget === 'Customize' ? (customBudget ? `$${customBudget}` : '$250') : budget;
  const budgetNum = parseFloat(rawBudgetStr.replace(/[^0-9.]/g, '')) || 250;
  const discountPercent = appliedPromo?.isValid ? appliedPromo.discountPercent : 0;
  const discountedTotal = discountPercent > 0 ? budgetNum * (1 - discountPercent / 100) : budgetNum;

  // Urgent advance calculation (25% default or configured per service)
  const urgentAdvancePercent = getUrgentAdvancePercentForService(service);
  const advancePaymentRequired = isRushDelivery ? discountedTotal * (urgentAdvancePercent / 100) : 0;

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply !== undefined ? codeToApply : promoCodeInput).trim();
    if (!code) {
      setAppliedPromo(null);
      setPromoError('');
      sessionStorage.removeItem('horizon_claimed_promo');
      return;
    }
    const res = validatePromoCode(code, service);
    if (res.isValid) {
      setAppliedPromo(res);
      setPromoError('');
      sessionStorage.setItem('horizon_claimed_promo', code);
      onShowToast(`🎉 Promo applied: ${res.discountPercent}% discount! (${res.offerName})`, 'success');
    } else {
      setAppliedPromo(null);
      setPromoError(res.message);
      onShowToast(res.message, 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);

    const emailCheck = validateProfessionalEmail(email);
    const phoneCheck = validateInternationalPhone(countryCode, phone);
    const isMissingName = !fullName.trim();
    const isMissingService = !service;
    const isMissingBudget = !budget || (budget === 'Customize' && !customBudget.trim());
    const isMissingDescription = !description.trim();

    // Verify Genuine Email Structure
    if (!emailCheck.isValid) {
      onShowToast(`Email Error: ${emailCheck.message}`, 'info');
      return;
    }

    // Verify Genuine Country Phone Digits
    if (!phoneCheck.isValid) {
      onShowToast(`Phone Error: ${phoneCheck.message}`, 'info');
      return;
    }

    if (isMissingName || isMissingService || isMissingBudget || isMissingDescription) {
      onShowToast(
        'Please fill in all required fields: Name, Email, Phone, Service, Budget, and Project Description.',
        'info'
      );
      return;
    }

    setIsSubmitting(true);

    const inquiry: ProjectInquiry & { message: string; serviceType: string; createdAt: string } = {
      id: 'brief-' + Date.now(),
      fullName: fullName.trim(),
      email: email.trim(),
      countryCode,
      phone: phone.trim(),
      service,
      serviceType: service,
      budget: discountPercent > 0 ? `$${discountedTotal.toFixed(2)} (Was $${budgetNum})` : rawBudgetStr,
      customBudget: budget === 'Customize' ? customBudget : undefined,
      originalTotal: budgetNum,
      discountedTotal: discountedTotal,
      promoCode: appliedPromo?.isValid ? promoCodeInput.trim().toUpperCase() : undefined,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      advancePaymentRequired: isRushDelivery ? advancePaymentRequired : undefined,
      deadline: deadline || 'Flexible',
      description: description.trim(),
      message: description.trim(),
      isRushDelivery,
      referralSource: sessionStorage.getItem('horizon_active_referrer') || undefined,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save directly to Firestore Cloud Database for real-time Admin Panel
    try {
      await saveInquiryToFirestore({
        id: inquiry.id,
        fullName: inquiry.fullName,
        email: inquiry.email,
        phone: `${inquiry.countryCode} ${inquiry.phone}`.trim(),
        countryCode: inquiry.countryCode,
        serviceType: inquiry.service,
        budget: inquiry.budget,
        customBudget: inquiry.customBudget,
        originalTotal: inquiry.originalTotal,
        discountedTotal: inquiry.discountedTotal,
        promoCode: inquiry.promoCode,
        discountPercent: inquiry.discountPercent,
        advancePaymentRequired: inquiry.advancePaymentRequired,
        timeline: inquiry.deadline,
        message: inquiry.description,
        description: inquiry.description,
        isRushDelivery: inquiry.isRushDelivery,
        status: 'new',
        referralSource: inquiry.referralSource,
        createdAt: inquiry.createdAt,
      });
    } catch (fsErr) {
      console.warn('Firestore direct write notice:', fsErr);
    }

    // 2. Store in browser local storage as backup with normalized keys
    try {
      const stored = localStorage.getItem('horizon_inquiries');
      const list = stored ? JSON.parse(stored) : [];
      list.push(inquiry);
      localStorage.setItem('horizon_inquiries', JSON.stringify(list));
      window.dispatchEvent(new Event('horizon_inquiries_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Could not write to localStorage:', err);
    }

    setIsSubmitting(false);
    setSubmittedBrief(inquiry);
    setValidationAttempted(false);
    onShowToast(
      isRushDelivery
        ? `🔥 Urgent project brief submitted! ${urgentAdvancePercent}% advance deposit recorded ($${advancePaymentRequired.toFixed(2)}).`
        : 'Project brief successfully submitted to Horizon database! You can also dispatch via WhatsApp.',
      'success'
    );

    // Reset input form
    setFullName('');
    setEmail('');
    setPhone('');
    setDescription('');
    setCustomBudget('');
    setIsRushDelivery(false);
  };

  const generateWhatsAppInquiryUrl = (brief: ProjectInquiry) => {
    const text = `*New Project Inquiry - Horizon Digital Media*\n\n*Name:* ${brief.fullName}\n*Email:* ${brief.email}\n*Phone:* ${brief.countryCode} ${brief.phone}\n*Service:* ${brief.service}\n*Budget:* ${brief.budget}${brief.promoCode ? ` (Promo ${brief.promoCode}: -${brief.discountPercent}%)` : ''}\n*Deadline:* ${brief.deadline}\n*Rush Delivery:* ${brief.isRushDelivery ? `⚡ URGENT (${brief.advancePaymentRequired ? `$${brief.advancePaymentRequired.toFixed(2)}` : '25%'} Advance Deposit Required)` : 'Standard'}\n\n*Brief Details:* ${brief.description || 'Details to be discussed'}`;
    return `https://wa.me/${waHotline.clean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)] inline-block">
            Start A Project
          </span>
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="font-bold text-3xl sm:text-5xl text-[var(--text)] mt-2 tracking-tight"
          >
            Let’s Discuss Your Next Project
          </h1>
          <p className="text-[var(--muted)] text-base sm:text-lg mt-3 leading-relaxed">
            Fill out the project inquiry parameters below. We review all briefs within 12–24 hours and reply with a milestone roadmap or direct scheduling link.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Inquiry Form */}
          <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-6 sm:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all ${
                      validationAttempted && !fullName.trim()
                        ? 'border-2 border-red-500 bg-red-500/5'
                        : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                    }`}
                  />
                  {validationAttempted && !fullName.trim() && (
                    <p className="text-[11px] text-red-400 mt-1">Full Name is required</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Email Address <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all ${
                      validationAttempted && (!email.trim() || !email.includes('@'))
                        ? 'border-2 border-red-500 bg-red-500/5'
                        : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                    }`}
                  />
                  {validationAttempted && (!email.trim() || !email.includes('@')) && (
                    <p className="text-[11px] text-red-400 mt-1">Valid email address is required</p>
                  )}
                </div>
              </div>

              {/* Row 2: Phone / WhatsApp (Left) & Target Delivery Date (Right) in the SAME Line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone with Compact Country Code Box */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Phone / WhatsApp Number <span className="text-red-400 font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Compact Country Code Box */}
                    <div className="w-[108px] shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Code"
                        className="w-full px-2 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-bold text-[var(--text)] focus:outline-none focus:border-[var(--secondary)] cursor-pointer text-center"
                      >
                        {COUNTRY_CODES.map((c, idx) => (
                          <option key={idx} value={c.code} className="bg-[#070D18] text-white">
                            {c.iso} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Compact Phone Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0324 4528683"
                        className={`w-full px-3.5 py-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all ${
                          validationAttempted && !phone.trim()
                            ? 'border-2 border-red-500 bg-red-500/5'
                            : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                        }`}
                      />
                    </div>
                  </div>
                  {validationAttempted && !phone.trim() && (
                    <p className="text-[11px] text-red-400 mt-1">Phone / WhatsApp number is mandatory</p>
                  )}
                </div>

                {/* Target Delivery Date (Placed right next to Phone Number) */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Target Delivery Date</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal lowercase">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  />
                </div>
              </div>

              {/* Row 3: Primary Service Needed & Estimated Budget side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Primary Service Needed <span className="text-red-400 font-bold">*</span>
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)] cursor-pointer"
                  >
                    {SERVICE_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt} className="bg-[#070D18] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Estimated Budget (USD) <span className="text-red-400 font-bold">*</span>
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)] cursor-pointer"
                  >
                    {BUDGET_OPTIONS.map((b, idx) => (
                      <option key={idx} value={b} className="bg-[#070D18] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Budget Input (Shows only when 'Customize' is picked) */}
              {budget === 'Customize' && (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--secondary)] animate-in fade-in">
                  <label className="block text-xs font-semibold text-[var(--secondary)] uppercase tracking-wider mb-1.5">
                    Specify Custom Budget (USD) <span className="text-red-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="e.g. 7500"
                      className={`w-full pl-8 pr-4 py-2.5 rounded-lg bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none ${
                        validationAttempted && !customBudget.trim()
                          ? 'border-2 border-red-500 bg-red-500/5'
                          : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                      }`}
                    />
                  </div>
                  {validationAttempted && !customBudget.trim() && (
                    <p className="text-[11px] text-red-400 mt-1">Please specify your custom budget amount.</p>
                  )}
                </div>
              )}

              {/* Promo / Referral Code Box (Compact, matching Primary Service box width) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-ticket text-amber-400"></i>
                      <span>Promo / Referral Code</span>
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-normal lowercase">(Optional)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        placeholder="e.g. HDM25"
                        maxLength={12}
                        className={`w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] text-sm font-mono uppercase text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all ${
                          appliedPromo?.isValid
                            ? 'border-2 border-emerald-500 bg-emerald-500/5'
                            : promoError
                            ? 'border-2 border-red-500 bg-red-500/5'
                            : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                        }`}
                      />
                      {appliedPromo?.isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold">
                          <i className="fa-solid fa-circle-check"></i>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#070D18] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedPromo?.isValid && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <span className="flex items-center gap-1.5 font-medium text-[11px]">
                        <i className="fa-solid fa-circle-check text-emerald-400"></i>
                        <span>{appliedPromo.discountPercent}% Discount Applied</span>
                      </span>
                      <span className="font-bold font-mono text-[11px]">
                        <s className="text-white/40 mr-1">${budgetNum}</s>
                        <span className="text-emerald-400">${discountedTotal.toFixed(2)}</span>
                      </span>
                    </div>
                  )}

                  {promoError && (
                    <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-xmark"></i>
                      <span>{promoError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                  Project Description & Key Deliverables <span className="text-red-400 font-bold">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details of your request: video links, project goals, benchmark styles, target audience, deliverables..."
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all resize-y ${
                    validationAttempted && !description.trim()
                      ? 'border-2 border-red-500 bg-red-500/5'
                      : 'border border-[var(--line)] focus:border-[var(--secondary)]'
                  }`}
                />
                {validationAttempted && !description.trim() && (
                  <p className="text-[11px] text-red-400 mt-1">Project description is required so we understand your requirements</p>
                )}
              </div>

              {/* Urgent Rush Delivery: Interactive ON / OFF Slide Button with 25% Advance */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                      <i className="fa-solid fa-bolt text-amber-400"></i>
                      <span>Urgent Rush Delivery (24–48 Hours Turnaround)</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                        isRushDelivery
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {isRushDelivery ? `⚡ URGENT (${urgentAdvancePercent}% ADVANCE)` : 'STANDARD'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {isRushDelivery
                      ? `${urgentAdvancePercent}% advance payment required ($${advancePaymentRequired.toFixed(2)}) before commencing emergency rush pipeline work.`
                      : 'Toggle ON if you require overnight priority workstation rendering and express delivery.'}
                  </p>
                </div>

                {/* ON / OFF Switch Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsRushDelivery(!isRushDelivery)}
                  role="switch"
                  aria-checked={isRushDelivery}
                  className={`relative inline-flex items-center h-9 w-20 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-md ${
                    isRushDelivery
                      ? 'bg-gradient-to-r from-red-500 to-amber-500 shadow-red-500/25'
                      : 'bg-gray-700/80 hover:bg-gray-600/80'
                  }`}
                  title={isRushDelivery ? 'Click to Turn OFF Rush Delivery' : 'Click to Turn ON Rush Delivery'}
                >
                  <span
                    className={`absolute text-[10px] font-black tracking-wider select-none ${
                      isRushDelivery ? 'left-2.5 text-white' : 'right-2.5 text-gray-300'
                    }`}
                  >
                    {isRushDelivery ? 'ON' : 'OFF'}
                  </span>
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                      isRushDelivery ? 'translate-x-11' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isRushDelivery && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-300 text-xs font-medium animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-amber-400 text-sm"></i>
                    <span>
                      Urgent Rush Pipeline: <strong>{urgentAdvancePercent}% Advance Payment Required</strong> before work commences.
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-amber-400">
                    ${advancePaymentRequired.toFixed(2)} Advance Deposit
                  </span>
                </div>
              )}

              {/* Validation Warning Alert (Displayed when validation fails) */}
              {validationAttempted &&
                (!fullName.trim() ||
                  !email.trim() ||
                  !email.includes('@') ||
                  !phone.trim() ||
                  !service ||
                  (budget === 'Customize' && !customBudget.trim()) ||
                  !description.trim()) && (
                  <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-3 animate-in fade-in">
                    <i className="fa-solid fa-triangle-exclamation text-amber-400 text-base mt-0.5 shrink-0"></i>
                    <div className="space-y-1">
                      <div className="font-bold text-red-200">
                        Please fill in all required details before submitting
                      </div>
                      <p className="text-red-300/80 leading-relaxed">
                        Full Name, Email Address, Phone/WhatsApp Number, Service, Budget, and Project Description are mandatory to submit your order. Only the Target Delivery Date is optional.
                      </p>
                    </div>
                  </div>
                )}

              {/* Submission Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-base shadow-xl shadow-[var(--glow)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Recording Project Brief...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Project Brief</span>
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-[var(--muted)]">
                Note: Inquiries are stored in your browser's local session archive. Direct email/chat buttons are also available.
              </p>
            </form>

            {/* Display submitted brief confirmation */}
            {submittedBrief && (
              <div className="mt-6 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--secondary)] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--secondary)] flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check"></i>
                    Brief Successfully Saved Locally
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{submittedBrief.id}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Brief recorded for <strong>{submittedBrief.fullName}</strong> ({submittedBrief.service}, Budget: {submittedBrief.budget}).
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={generateWhatsAppInquiryUrl(submittedBrief)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#25D366] text-[#070D18] font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#20ba5a]"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Forward Brief to WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:horizondigitalmedia.official@gmail.com?subject=Project Inquiry - ${submittedBrief.service}&body=${encodeURIComponent(
                      `Name: ${submittedBrief.fullName}\nEmail: ${submittedBrief.email}\nPhone: ${submittedBrief.countryCode} ${submittedBrief.phone}\nService: ${submittedBrief.service}\nBudget: ${submittedBrief.budget}\nDetails: ${submittedBrief.description}`
                    )}`}
                    className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--line)] flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-envelope"></i>
                    <span>Send via Default Email App</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Cards */}
          <div className="lg:col-span-4 space-y-5">
            {/* WhatsApp Card with Single Large Prominent Button */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] text-2xl mb-4 shadow-sm">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1">
                WhatsApp Direct Hotline
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Chat directly on <strong>{waHotline.formatted}</strong> for instant responses, project quotes, asset exchanges, and priority consultations.
              </p>
              <a
                href={`https://wa.me/${waHotline.clean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20be5a] text-black font-extrabold text-sm shadow-lg shadow-[#25D366]/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Chat directly on WhatsApp"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                <span>Chat on WhatsApp ({waHotline.formatted})</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-80"></i>
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-xl mb-4">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1">
                Email Inquiries
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Send formal RFPs, asset folders, contracts, and bilateral NDA requests to our official studio inbox.
              </p>
              
              <div className="space-y-2.5">
                {/* Primary: Direct redirect to compose message */}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=horizondigitalmedia.official@gmail.com&su=Project%20Inquiry%20-%20Horizon%20Digital%20Media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
                  title="Click to Compose Email Message directly"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                    <span>Compose Email Message</span>
                  </span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>

                {/* Email address link (opens Gmail compose & copies) */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=horizondigitalmedia.official@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] sm:text-xs text-[var(--secondary)] hover:underline truncate"
                    title="Open Gmail Composer"
                  >
                    horizondigitalmedia.official@gmail.com
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText('horizondigitalmedia.official@gmail.com');
                        onShowToast('Email copied to clipboard: horizondigitalmedia.official@gmail.com', 'success');
                      } catch {}
                    }}
                    className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] cursor-pointer"
                    title="Copy Email"
                  >
                    Copy
                  </button>
                </div>

                {/* Default Mail App fallback */}
                <div className="pt-1">
                  <a
                    href="mailto:horizondigitalmedia.official@gmail.com"
                    className="text-[10px] text-[var(--muted)] hover:text-[var(--text)] underline inline-flex items-center gap-1"
                  >
                    <span>Or open in default device mail app (mailto)</span>
                    <i className="fa-solid fa-arrow-right text-[8px]"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* TikTok Card */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/15 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] text-xl mb-4">
                <i className="fa-brands fa-tiktok"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1">
                TikTok Channel
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Watch our viral video edits, hooks, sound design tests, and short-form reels.
              </p>
              <a
                href="https://vm.tiktok.com/ZS9DBEx7RqMWa-LXXM6/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#00F2FE] hover:underline cursor-pointer"
              >
                <span>Follow on TikTok</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Facebook Card */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] text-xl mb-4">
                <i className="fa-brands fa-facebook-f"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1">
                Facebook Page
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Connect on our official Facebook page for creative updates and portfolio announcements.
              </p>
              <a
                href="https://www.facebook.com/share/1cBv9dCK2S/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                <span>Visit Facebook Page</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Instagram Card */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 card-hover-glow">
              <div className="w-10 h-10 rounded-xl bg-[#E1306C]/15 border border-[#E1306C]/30 flex items-center justify-center text-[#E1306C] text-xl mb-4">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1">
                Instagram DM
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Follow our creative breakdowns, design reels, and direct message the studio.
              </p>
              <a
                href="https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#E1306C] hover:underline cursor-pointer"
              >
                <span>@horizon.digital.media</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            {/* Availability / Global Support */}
            <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-[var(--text)]">Production Pipeline Active</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Currently booking projects for Q4 2026 and Q1 2027. Dedicated slots allocated upon receipt of advance retainer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
