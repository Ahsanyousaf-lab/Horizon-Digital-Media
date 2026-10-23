/**
 * Site Configuration & Global Settings Engine
 * Manages WhatsApp hotline, Promo/Coupon Deals, Urgent Delivery Advance Matrices,
 * and Client Reviews across Horizon Digital Media.
 */
import { ClientReview } from '../types';
import { HOMEPAGE_SERVICES, HOMEPAGE_CLIENT_REVIEWS } from '../data/websiteData';

export { HOMEPAGE_SERVICES, HOMEPAGE_CLIENT_REVIEWS };

export interface PromoConfig {
  enabled: boolean;
  // SECTION A: Promo Code & Approval Management
  primaryPromoCode: string;
  discountPercent: number;
  approvedCodes: string; // "Google Code / Code Approval Input Box"
  codes: string[]; // parsed uppercase approved code list

  // SECTION B: Pop-Up Deals & Banner Settings (4 Boxes)
  dealName: string; // 1. Deal Name
  timeDuration: string; // 2. Time Duration (e.g. formatted or derived)
  popupDiscountValue: string; // 3. Discount Value Box
  targetService: string; // 4. Service Selection Dropdown: 'all' or specific service
  popupEnabled: boolean; // STRICT TOGGLE: must be explicitly true

  // Live Digital Countdown Clock Watch Settings
  durationHours: number; // e.g. 12, 24, 48, 72 hours
  dealEndTime?: number; // target expiration timestamp in epoch ms

  // Section A enhancements
  autoApplyPromo?: boolean;
  promoExpiryNote?: string;

  // Compatibility fields
  offerName?: string;
  timerText?: string;
  regularPriceDisplay?: string;
  discountPriceDisplay?: string;
}

export interface ContactConfig {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  behance: string;
  tiktok: string;
  twitter: string;
  enableWhatsAppRouting: boolean;
  enableEmailRouting: boolean;
}

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  phone: '+92 324 4528683',
  email: 'ahsanyousaf683@gmail.com',
  address: 'Faisalabad / Lahore, Punjab, Pakistan • Global Digital Studio',
  workingHours: 'Mon - Sat: 9:00 AM - 9:00 PM PKT • 24/7 WhatsApp Hotline',
  instagram: 'https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp',
  youtube: 'https://youtube.com/@horizondigitalmedia',
  linkedin: 'https://www.linkedin.com/in/ahsan-yousaf-375494297',
  behance: 'https://www.behance.net/horizondigital',
  tiktok: 'https://tiktok.com/@horizondigitalmedia',
  twitter: 'https://twitter.com/horizondmedia',
  enableWhatsAppRouting: true,
  enableEmailRouting: true,
};

export interface UrgentServiceRate {
  serviceId: string;
  serviceTitle: string;
  advancePercent: number; // default 25%
}

export const DEFAULT_WHATSAPP_NUMBER = '923244528683';
export const DEFAULT_WHATSAPP_FORMATTED = '+92 324 4528683';

export const DEFAULT_PROMO_CONFIG: PromoConfig = {
  enabled: true,
  // Section A: Promo Code & Approval
  primaryPromoCode: 'HDM25',
  discountPercent: 25,
  approvedCodes: 'HDM25, GOOGLE100, EID2026, AHSAN10, HORIZON25, CREATIVE',
  codes: ['HDM25', 'GOOGLE100', 'EID2026', 'AHSAN10', 'HORIZON25', 'CREATIVE'],

  // Section B: Pop-up Deals & Banner (Strictly OFF by default until toggled ON in admin)
  dealName: 'Special 25% Off Creative Production Deal',
  timeDuration: '24 Hours Left • Limited Slots',
  popupDiscountValue: '25%',
  targetService: 'all',
  popupEnabled: false, // Strictly OFF by default
  durationHours: 24,

  // Fallbacks
  offerName: 'Special 25% Off Creative Production Deal',
  timerText: '24 Hours Left • Limited Slots',
  regularPriceDisplay: '$100',
  discountPriceDisplay: '$75',
};

export const DEFAULT_URGENT_RATES: UrgentServiceRate[] = HOMEPAGE_SERVICES.map((s) => ({
  serviceId: s.id,
  serviceTitle: s.title,
  advancePercent: 25, // 25% advance payment required
}));

// ==========================================
// WHATSAPP NUMBER MANAGER
// ==========================================

export function getSiteWhatsApp(): { clean: string; formatted: string } {
  try {
    const stored = localStorage.getItem('horizon_whatsapp_number');
    if (stored && stored.trim()) {
      const clean = stored.replace(/[^0-9]/g, '');
      return {
        clean: clean || DEFAULT_WHATSAPP_NUMBER,
        formatted: stored.trim(),
      };
    }
  } catch {}
  return {
    clean: DEFAULT_WHATSAPP_NUMBER,
    formatted: DEFAULT_WHATSAPP_FORMATTED,
  };
}

export function saveSiteWhatsApp(newNumber: string): boolean {
  try {
    const clean = newNumber.replace(/[^0-9]/g, '');
    if (clean.length < 8) return false;
    localStorage.setItem('horizon_whatsapp_number', newNumber.trim());
    window.dispatchEvent(new Event('horizon_whatsapp_updated'));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// PROMO & COUPON CODE ENGINE
// ==========================================

export function getPromoConfig(): PromoConfig {
  try {
    const raw = localStorage.getItem('horizon_promo_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      const approvedStr = typeof parsed.approvedCodes === 'string'
        ? parsed.approvedCodes
        : Array.isArray(parsed.codes) ? parsed.codes.join(', ') : DEFAULT_PROMO_CONFIG.approvedCodes;

      // Parse approved codes string strictly
      const parsedApproved = approvedStr
        .split(/[\n,;]+/)
        .map((c: string) => c.trim().toUpperCase())
        .filter(Boolean);

      const primary = (parsed.primaryPromoCode || parsed.codes?.[0] || 'HDM25').trim().toUpperCase();
      if (!parsedApproved.includes(primary)) {
        parsedApproved.unshift(primary);
      }

      const isPopupExplicitlyOn = parsed.popupEnabled === true;
      const durationHours = typeof parsed.durationHours === 'number' && parsed.durationHours > 0 ? parsed.durationHours : 24;
      let dealEndTime = typeof parsed.dealEndTime === 'number' ? parsed.dealEndTime : 0;
      if (isPopupExplicitlyOn && (!dealEndTime || dealEndTime <= Date.now())) {
        dealEndTime = Date.now() + durationHours * 3600 * 1000;
      }

      return {
        ...DEFAULT_PROMO_CONFIG,
        ...parsed,
        primaryPromoCode: primary,
        approvedCodes: approvedStr,
        codes: parsedApproved,
        dealName: parsed.dealName || parsed.offerName || DEFAULT_PROMO_CONFIG.dealName,
        timeDuration: parsed.timeDuration || parsed.timerText || DEFAULT_PROMO_CONFIG.timeDuration,
        popupDiscountValue: parsed.popupDiscountValue || `${parsed.discountPercent || 25}%`,
        targetService: parsed.targetService || 'all',
        popupEnabled: isPopupExplicitlyOn, // STRICT TOGGLE: strictly true only when admin explicitly enabled it
        durationHours,
        dealEndTime,
      };
    }
  } catch {}
  return DEFAULT_PROMO_CONFIG;
}

export function savePromoConfig(config: PromoConfig): void {
  try {
    // Parse and synchronize approved codes
    const approvedList = (config.approvedCodes || '')
      .split(/[\n,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const primary = (config.primaryPromoCode || 'HDM25').trim().toUpperCase();
    if (primary && !approvedList.includes(primary)) {
      approvedList.unshift(primary);
    }

    const durationHours = typeof config.durationHours === 'number' && config.durationHours > 0 ? config.durationHours : 24;
    let dealEndTime = typeof config.dealEndTime === 'number' ? config.dealEndTime : 0;
    if (config.popupEnabled && (!dealEndTime || dealEndTime <= Date.now())) {
      dealEndTime = Date.now() + durationHours * 3600 * 1000;
    }

    const normalized: PromoConfig = {
      ...config,
      enabled: config.enabled !== false,
      primaryPromoCode: primary,
      codes: approvedList.length > 0 ? approvedList : [primary],
      dealName: config.dealName || config.offerName || 'Special Discount Deal',
      offerName: config.dealName || config.offerName || 'Special Discount Deal',
      timeDuration: config.timeDuration || config.timerText || `${durationHours} Hours Left • Live Digital Countdown`,
      timerText: config.timeDuration || config.timerText || `${durationHours} Hours Left • Live Digital Countdown`,
      popupDiscountValue: config.popupDiscountValue || `${config.discountPercent}%`,
      popupEnabled: config.popupEnabled === true, // STRICT TOGGLE: explicitly boolean
      durationHours,
      dealEndTime,
      targetService: config.targetService || 'all',
    };

    localStorage.setItem('horizon_promo_config', JSON.stringify(normalized));

    // Reset session dismissal so newly configured pop-up deal is shown immediately on front-end
    try {
      sessionStorage.removeItem('horizon_promo_popup_dismissed');
    } catch {}

    window.dispatchEvent(new Event('horizon_promo_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error saving promo config:', err);
  }
}

// ==========================================
// CONTACT US CONFIGURATION ENGINE
// ==========================================

export function getContactConfig(): ContactConfig {
  try {
    const raw = localStorage.getItem('horizon_contact_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONTACT_CONFIG,
        ...parsed,
      };
    }
  } catch {}
  return DEFAULT_CONTACT_CONFIG;
}

export function saveContactConfig(config: ContactConfig): void {
  try {
    localStorage.setItem('horizon_contact_config', JSON.stringify(config));
    if (config.phone) {
      saveSiteWhatsApp(config.phone);
    }
    if (config.email) {
      localStorage.setItem('horizon_contact_email', config.email.trim());
    }
    window.dispatchEvent(new Event('horizon_contact_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error saving contact config:', err);
  }
}

/**
 * Validate customer coupon code against backend approved authorization codes
 * Approval Logic: ONLY validates and approves codes that strictly match the manually listed codes in backend field.
 */
export function validatePromoCode(
  inputCode: string,
  selectedService?: string
): { isValid: boolean; discountPercent: number; offerName: string; message: string } {
  const config = getPromoConfig();
  if (!config.enabled) {
    return {
      isValid: false,
      discountPercent: 0,
      offerName: '',
      message: 'No promo discounts are currently active.',
    };
  }

  const cleanInput = inputCode.trim().toUpperCase();
  if (!cleanInput) {
    return {
      isValid: false,
      discountPercent: 0,
      offerName: '',
      message: 'Please enter a promo code.',
    };
  }

  // Strict check: only validate codes matching the backend approval list
  const approvedList = config.codes.map((c) => c.trim().toUpperCase());
  const isMatch = approvedList.includes(cleanInput);

  if (!isMatch) {
    return {
      isValid: false,
      discountPercent: 0,
      offerName: '',
      message: 'Invalid promo code. Code not approved in backend authorization system.',
    };
  }

  // Check service restriction if deal is tied to a specific service
  if (config.targetService && config.targetService !== 'all' && selectedService) {
    const targetSlug = config.targetService.toLowerCase();
    const currentService = selectedService.toLowerCase();

    if (!currentService.includes(targetSlug) && !targetSlug.includes(currentService)) {
      const serviceObj = HOMEPAGE_SERVICES.find((s) => s.id === config.targetService);
      const serviceName = serviceObj?.title || config.targetService;
      return {
        isValid: false,
        discountPercent: 0,
        offerName: config.dealName || config.offerName || 'Promo Deal',
        message: `This promo code is only approved for ${serviceName}.`,
      };
    }
  }

  const discountVal = Number(config.discountPercent) || 25;
  return {
    isValid: true,
    discountPercent: discountVal,
    offerName: config.dealName || config.offerName || 'Special Promo',
    message: `Promo code "${cleanInput}" verified & approved! ${discountVal}% discount applied.`,
  };
}

// ==========================================
// URGENT ADVANCE PAYMENT MATRIX
// ==========================================

export function getUrgentRates(): UrgentServiceRate[] {
  try {
    const raw = localStorage.getItem('horizon_urgent_rates');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_URGENT_RATES;
}

export function saveUrgentRates(rates: UrgentServiceRate[]): void {
  try {
    localStorage.setItem('horizon_urgent_rates', JSON.stringify(rates));
    window.dispatchEvent(new Event('horizon_urgent_rates_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error saving urgent rates:', err);
  }
}

export function getUrgentAdvancePercentForService(serviceTitle: string): number {
  const rates = getUrgentRates();
  const matched = rates.find(
    (r) =>
      r.serviceTitle.toLowerCase().trim() === serviceTitle.toLowerCase().trim() ||
      serviceTitle.toLowerCase().includes(r.serviceTitle.toLowerCase()) ||
      r.serviceTitle.toLowerCase().includes(serviceTitle.toLowerCase())
  );
  return matched ? matched.advancePercent : 25;
}

// ==========================================
// CLIENT REVIEWS (FIRESTORE & LOCAL MERGED)
// ==========================================

export function getStoredCustomReviews(): ClientReview[] {
  try {
    const raw = localStorage.getItem('horizon_client_reviews');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const uniqueList: ClientReview[] = [];
        let hadDuplicates = false;
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i];
          if (item) {
            const cleanId = String(item.id || `rev-user-${Date.now()}-${i}`);
            if (!seen.has(cleanId)) {
              seen.add(cleanId);
              uniqueList.push({ ...item, id: cleanId });
            } else {
              hadDuplicates = true;
            }
          }
        }
        if (hadDuplicates) {
          localStorage.setItem('horizon_client_reviews', JSON.stringify(uniqueList));
        }
        return uniqueList;
      }
    }
  } catch {}
  return [];
}

export function addCustomReview(review: ClientReview): void {
  try {
    const existing = getStoredCustomReviews().filter((r) => r.id !== review.id);
    const updated = [review, ...existing];
    localStorage.setItem('horizon_client_reviews', JSON.stringify(updated));
    window.dispatchEvent(new Event('horizon_reviews_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error adding custom review:', err);
  }
}

// ==========================================
// INTERNATIONAL PHONE & EMAIL VALIDATORS
// ==========================================

export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
}

export function validateInternationalPhone(countryCode: string, phoneNumber: string): PhoneValidationResult {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  if (!cleanPhone) {
    return {
      isValid: false,
      message: 'Phone / WhatsApp number is mandatory',
    };
  }

  // Pakistan (+92)
  if (countryCode === '+92') {
    // Normal mobile: 3XXXXXXXXX (10 digits) or with leading 0: 03XXXXXXXXX (11 digits)
    if (cleanPhone.startsWith('0')) {
      if (cleanPhone.length !== 11) {
        return {
          isValid: false,
          message: 'Pakistani phone starting with 0 must be exactly 11 digits (e.g. 03244528683)',
        };
      }
    } else {
      if (cleanPhone.length !== 10) {
        return {
          isValid: false,
          message: 'Pakistani phone number must be 10 digits after +92 (e.g. 3244528683)',
        };
      }
    }
    return { isValid: true, message: 'Valid Pakistani phone format' };
  }

  // USA & Canada (+1)
  if (countryCode === '+1') {
    if (cleanPhone.length !== 10) {
      return {
        isValid: false,
        message: 'US/Canada phone number must be exactly 10 digits (e.g. 2125551234)',
      };
    }
    return { isValid: true, message: 'Valid US/Canada phone format' };
  }

  // India (+91)
  if (countryCode === '+91') {
    if (cleanPhone.length !== 10) {
      return {
        isValid: false,
        message: 'Indian phone number must be exactly 10 digits (e.g. 9876543210)',
      };
    }
    return { isValid: true, message: 'Valid Indian phone format' };
  }

  // UAE (+971)
  if (countryCode === '+971') {
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      return {
        isValid: false,
        message: 'UAE phone number must be 9 digits (e.g. 501234567)',
      };
    }
    return { isValid: true, message: 'Valid UAE phone format' };
  }

  // Saudi Arabia (+966)
  if (countryCode === '+966') {
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      return {
        isValid: false,
        message: 'Saudi phone number must be 9 digits (e.g. 512345678)',
      };
    }
    return { isValid: true, message: 'Valid Saudi phone format' };
  }

  // Malaysia (+60)
  if (countryCode === '+60') {
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      return {
        isValid: false,
        message: 'Malaysian phone number must be 9–10 digits (e.g. 123456789)',
      };
    }
    return { isValid: true, message: 'Valid Malaysian phone format' };
  }

  // UK (+44)
  if (countryCode === '+44') {
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return {
        isValid: false,
        message: 'UK phone number must be 10–11 digits (e.g. 7911123456)',
      };
    }
    return { isValid: true, message: 'Valid UK phone format' };
  }

  // General international check (E.164: 7 to 15 digits)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return {
      isValid: false,
      message: `Invalid phone length (${cleanPhone.length} digits). Standard length is 7 to 15 digits.`,
    };
  }

  return { isValid: true, message: 'Valid phone format' };
}

export function validateProfessionalEmail(email: string): { isValid: boolean; message: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, message: 'Email address is mandatory' };
  }

  // Comprehensive RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a complete and valid email address (e.g. name@domain.com)' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email structure' };
  }

  const [local, domain] = parts;
  if (local.length < 2) {
    return { isValid: false, message: 'Email username is too short' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, message: 'Email domain extension must be valid (e.g. .com, .org, .net, .pk)' };
  }

  // Reject dummy placeholder inputs
  const blacklisted = ['test@test.com', 'fake@fake.com', 'abc@abc.com', 'asdf@asdf.com', '123@123.com'];
  if (blacklisted.includes(trimmed)) {
    return { isValid: false, message: 'Please enter a genuine, reachable email address' };
  }

  return { isValid: true, message: 'Valid email address' };
}
