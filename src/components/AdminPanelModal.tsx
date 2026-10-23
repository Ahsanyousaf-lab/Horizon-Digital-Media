import React, { useState, useEffect } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  subscribeInquiries,
  updateInquiryStatusInFirestore,
  deleteInquiryFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  subscribeProjects,
  FirestoreInquiry,
  FirestoreProject,
} from '../lib/firebase';
import { PORTFOLIO_CATEGORIES, SERVICE_SUB_CATEGORIES, PORTFOLIO_ITEMS } from '../data/websiteData';
import { compressImageFile, idbGet, idbSet } from '../utils/imageUtils';
import { PortfolioCard, DynamicSocialLink, ThemeColor } from '../types';
import {
  getStoredSocialLinks,
  saveStoredSocialLinks,
  detectPlatformFromUrl,
  DEFAULT_DYNAMIC_SOCIAL_LINKS,
} from '../data/socialLinksData';
import {
  getPromoConfig,
  savePromoConfig,
  getUrgentRates,
  saveUrgentRates,
  getSiteWhatsApp,
  saveSiteWhatsApp,
  getContactConfig,
  saveContactConfig,
  PromoConfig,
  UrgentServiceRate,
  ContactConfig,
  DEFAULT_CONTACT_CONFIG,
} from '../utils/siteConfig';

export interface AdminThemeConfig {
  id: ThemeColor;
  label: string;
  bg: string;
  surface: string;
  sidebar: string;
  header: string;
  card: string;
  cardInner: string;
  inputBg: string;
  border: string;
  accent: string;
  accentHover: string;
  accentBg: string;
  accentBorder: string;
  textAccent: string;
  glow: string;
  colorDot: string;
  textPrimary: string;
  textSecondary: string;
  isLight?: boolean;
}

export const ADMIN_THEMES: Record<ThemeColor, AdminThemeConfig> = {
  'dark-yellow': {
    id: 'dark-yellow',
    label: 'Amber Yellow',
    bg: '#140d02',
    surface: '#1f1505',
    sidebar: '#170f03',
    header: '#1b1204',
    card: '#271907',
    cardInner: 'rgba(0, 0, 0, 0.4)',
    inputBg: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(245, 158, 11, 0.25)',
    accent: '#F59E0B',
    accentHover: '#D97706',
    accentBg: 'rgba(245, 158, 11, 0.18)',
    accentBorder: 'rgba(245, 158, 11, 0.4)',
    textAccent: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.35)',
    colorDot: '#F59E0B',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    isLight: false,
  },
  'dark-red': {
    id: 'dark-red',
    label: 'Crimson Red',
    bg: '#150407',
    surface: '#22070d',
    sidebar: '#1a0509',
    header: '#1e060c',
    card: '#2a0910',
    cardInner: 'rgba(0, 0, 0, 0.4)',
    inputBg: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(239, 68, 68, 0.25)',
    accent: '#EF4444',
    accentHover: '#DC2626',
    accentBg: 'rgba(239, 68, 68, 0.18)',
    accentBorder: 'rgba(239, 68, 68, 0.4)',
    textAccent: '#F87171',
    glow: 'rgba(239, 68, 68, 0.35)',
    colorDot: '#EF4444',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    isLight: false,
  },
  'teal': {
    id: 'teal',
    label: 'Emerald Green / Teal',
    bg: '#050f16',
    surface: '#0a1822',
    sidebar: '#07141e',
    header: '#081722',
    card: '#0e2331',
    cardInner: 'rgba(0, 0, 0, 0.4)',
    inputBg: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(0, 229, 255, 0.25)',
    accent: '#00A88F',
    accentHover: '#008c77',
    accentBg: 'rgba(0, 168, 143, 0.18)',
    accentBorder: 'rgba(0, 229, 255, 0.4)',
    textAccent: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.35)',
    colorDot: '#00E5FF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    isLight: false,
  },
  'dark-purple': {
    id: 'dark-purple',
    label: 'Violet Purple',
    bg: '#0f0417',
    surface: '#180826',
    sidebar: '#13061f',
    header: '#160723',
    card: '#230b36',
    cardInner: 'rgba(0, 0, 0, 0.4)',
    inputBg: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(168, 85, 247, 0.25)',
    accent: '#A855F7',
    accentHover: '#9333EA',
    accentBg: 'rgba(168, 85, 247, 0.18)',
    accentBorder: 'rgba(168, 85, 247, 0.4)',
    textAccent: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.35)',
    colorDot: '#A855F7',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    isLight: false,
  },
  'dark-blue': {
    id: 'dark-blue',
    label: 'Sapphire Blue',
    bg: '#030816',
    surface: '#071329',
    sidebar: '#050f21',
    header: '#071226',
    card: '#0c1d3b',
    cardInner: 'rgba(0, 0, 0, 0.4)',
    inputBg: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(59, 130, 246, 0.25)',
    accent: '#3B82F6',
    accentHover: '#2563EB',
    accentBg: 'rgba(59, 130, 246, 0.18)',
    accentBorder: 'rgba(56, 189, 248, 0.4)',
    textAccent: '#38BDF8',
    glow: 'rgba(59, 130, 246, 0.35)',
    colorDot: '#3B82F6',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    isLight: false,
  },
};

export const ADMIN_LIGHT_THEMES: Record<ThemeColor, AdminThemeConfig> = {
  'teal': {
    id: 'teal',
    label: 'Emerald Green / Teal',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    card: '#FFFFFF',
    cardInner: '#F1F5F9',
    inputBg: '#FFFFFF',
    border: '#94A3B8',
    accent: '#008C77',
    accentHover: '#007362',
    accentBg: 'rgba(0, 140, 119, 0.12)',
    accentBorder: '#008C77',
    textAccent: '#007362',
    glow: 'rgba(0, 140, 119, 0.25)',
    colorDot: '#00A88F',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    isLight: true,
  },
  'dark-blue': {
    id: 'dark-blue',
    label: 'Sapphire Blue',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    card: '#FFFFFF',
    cardInner: '#F1F5F9',
    inputBg: '#FFFFFF',
    border: '#94A3B8',
    accent: '#1D4ED8',
    accentHover: '#1E40AF',
    accentBg: 'rgba(29, 78, 216, 0.12)',
    accentBorder: '#1D4ED8',
    textAccent: '#1D4ED8',
    glow: 'rgba(29, 78, 216, 0.25)',
    colorDot: '#2563EB',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    isLight: true,
  },
  'dark-yellow': {
    id: 'dark-yellow',
    label: 'Amber Yellow',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    card: '#FFFFFF',
    cardInner: '#F1F5F9',
    inputBg: '#FFFFFF',
    border: '#94A3B8',
    accent: '#B45309',
    accentHover: '#92400E',
    accentBg: 'rgba(180, 83, 9, 0.12)',
    accentBorder: '#B45309',
    textAccent: '#B45309',
    glow: 'rgba(180, 83, 9, 0.25)',
    colorDot: '#D97706',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    isLight: true,
  },
  'dark-red': {
    id: 'dark-red',
    label: 'Crimson Red',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    card: '#FFFFFF',
    cardInner: '#F1F5F9',
    inputBg: '#FFFFFF',
    border: '#94A3B8',
    accent: '#B91C1C',
    accentHover: '#991B1B',
    accentBg: 'rgba(185, 28, 28, 0.12)',
    accentBorder: '#B91C1C',
    textAccent: '#B91C1C',
    glow: 'rgba(185, 28, 28, 0.25)',
    colorDot: '#DC2626',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    isLight: true,
  },
  'dark-purple': {
    id: 'dark-purple',
    label: 'Violet Purple',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    sidebar: '#FFFFFF',
    header: '#FFFFFF',
    card: '#FFFFFF',
    cardInner: '#F1F5F9',
    inputBg: '#FFFFFF',
    border: '#94A3B8',
    accent: '#7E22CE',
    accentHover: '#6B21A8',
    accentBg: 'rgba(126, 34, 206, 0.12)',
    accentBorder: '#7E22CE',
    textAccent: '#7E22CE',
    glow: 'rgba(126, 34, 206, 0.25)',
    colorDot: '#9333EA',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    isLight: true,
  },
};

export const getAdminTheme = (themeId: ThemeColor, isLight: boolean): AdminThemeConfig => {
  if (isLight) {
    return ADMIN_LIGHT_THEMES[themeId] || ADMIN_LIGHT_THEMES['teal'];
  }
  return ADMIN_THEMES[themeId] || ADMIN_THEMES['teal'];
};

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onProjectsUpdated?: () => void;
  customProfilePic?: string | null;
  onUploadProfilePic?: (url: string) => void;
  onResetProfilePic?: () => void;
  customLogo?: string | null;
  onUploadLogo?: (url: string) => void;
  onResetLogo?: () => void;
  colorTheme?: ThemeColor;
  onSelectTheme?: (theme: ThemeColor) => void;
  isLightMode?: boolean;
  onToggleLightMode?: () => void;
}

interface LocalAdminSession {
  email: string;
  name: string;
  loggedInAt: string;
}

interface ClientOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  status: 'Processing' | 'Pending' | 'Shipped' | 'Delivered' | 'Order Complete';
  total: number;
  originalTotal?: number;
  discountedTotal?: number;
  payment: string;
  message?: string;
  description?: string;
  isRealInquiry?: boolean;
  referralSource?: string;
  isRushDelivery?: boolean;
  advancePaymentRequired?: number;
  promoCode?: string;
  discountPercent?: number;
  deadline?: string;
}

const DEFAULT_ADMIN_EMAIL = 'horizondigitalmedia.official@gmail.com';
const DEFAULT_ADMIN_PASSCODE = 'Ahsan@1213.';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onProjectsUpdated,
  customProfilePic,
  onUploadProfilePic,
  onResetProfilePic,
  customLogo,
  onUploadLogo,
  onResetLogo,
  colorTheme: colorThemeProp,
  onSelectTheme,
  isLightMode: isLightModeProp,
  onToggleLightMode,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<LocalAdminSession | null>(() => {
    try {
      const stored = localStorage.getItem('horizon_admin_session');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Automatic Real-Time Frontend Dark/Light Mode Synchronization (No manual admin toggle)
  const [isLightModeState, setIsLightModeState] = useState<boolean>(() => {
    return typeof isLightModeProp === 'boolean'
      ? isLightModeProp
      : localStorage.getItem('horizon_theme_mode') === 'light' ||
        (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme-mode') === 'light');
  });

  useEffect(() => {
    if (typeof isLightModeProp === 'boolean') {
      setIsLightModeState(isLightModeProp);
    }
  }, [isLightModeProp]);

  useEffect(() => {
    const syncMode = () => {
      setIsLightModeState(
        typeof isLightModeProp === 'boolean'
          ? isLightModeProp
          : localStorage.getItem('horizon_theme_mode') === 'light' ||
            document.documentElement.getAttribute('data-theme-mode') === 'light'
      );
    };
    window.addEventListener('storage', syncMode);
    window.addEventListener('horizon_theme_changed', syncMode);
    return () => {
      window.removeEventListener('storage', syncMode);
      window.removeEventListener('horizon_theme_changed', syncMode);
    };
  }, [isLightModeProp]);

  // Dynamic Theme Synchronization (Frontend & Backend Sync)
  const [currentThemeId, setCurrentThemeId] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem('horizon_color_theme');
    return (stored as ThemeColor) || colorThemeProp || 'teal';
  });

  useEffect(() => {
    if (colorThemeProp) {
      setCurrentThemeId(colorThemeProp);
    }
  }, [colorThemeProp]);

  useEffect(() => {
    const syncTheme = () => {
      const stored = localStorage.getItem('horizon_color_theme') as ThemeColor;
      if (stored && ADMIN_THEMES[stored]) {
        setCurrentThemeId(stored);
      }
    };
    window.addEventListener('storage', syncTheme);
    window.addEventListener('horizon_theme_changed', syncTheme);
    return () => {
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('horizon_theme_changed', syncTheme);
    };
  }, []);

  const activeTheme = getAdminTheme(currentThemeId, isLightModeState);

  const handleSelectThemeColor = (t: ThemeColor) => {
    setCurrentThemeId(t);
    localStorage.setItem('horizon_color_theme', t);
    document.documentElement.setAttribute('data-color-theme', t);
    if (onSelectTheme) onSelectTheme(t);
    window.dispatchEvent(new Event('horizon_theme_changed'));
    window.dispatchEvent(new Event('storage'));
    onShowToast(`🎨 Theme synchronized to ${activeTheme.label}!`, 'success');
  };

  // Login form state (Empty by default - user must manually type their credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Aura-style active tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'sales' | 'orders' | 'services' | 'customers' | 'marketing' | 'settings'
  >('dashboard');

  // Search & Notifications
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(5);

  // Firestore & Combined Inquiries
  const [inquiries, setInquiries] = useState<FirestoreInquiry[]>([]);
  const [firestoreProjects, setFirestoreProjects] = useState<FirestoreProject[]>([]);
  const [localCustomProjects, setLocalCustomProjects] = useState<PortfolioCard[]>([]);

  // Selected Order for View/Manage Modal
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);

  // Custom manual orders logged by Ahsan
  const [customOrders, setCustomOrders] = useState<ClientOrder[]>(() => {
    try {
      const stored = localStorage.getItem('horizon_custom_orders');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Create custom order modal state
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [orderCustName, setOrderCustName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderService, setOrderService] = useState('Video Editing');
  const [orderTotal, setOrderTotal] = useState('250');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderReferral, setOrderReferral] = useState<'direct' | 'tiktok' | 'instagram' | 'facebook' | 'whatsapp' | 'youtube'>('direct');

  // Real Social Accounts Configuration (Linked to Ahsan's actual official handles)
  const [socialLinks, setSocialLinks] = useState<{
    tiktok: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
    youtube: string;
    email: string;
  }>(() => {
    try {
      const stored = localStorage.getItem('horizon_social_links');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      youtube: 'https://www.youtube.com/@Horizon-Digital-Media',
      tiktok: 'https://vm.tiktok.com/ZS9DBEx7RqMWa-LXXM6/',
      instagram: 'https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp',
      facebook: 'https://www.facebook.com/share/1cBv9dCK2S/',
      whatsapp: 'https://wa.me/923244528683',
      email: 'horizondigitalmedia.official@gmail.com',
    };
  });
  const [isEditingSocialLinks, setIsEditingSocialLinks] = useState(false);
  const [tempSocialLinks, setTempSocialLinks] = useState(socialLinks);

  // Dynamic Social Links list (Supports Deleting & Adding new platforms with Auto-Detection)
  const [dynamicLinks, setDynamicLinks] = useState<DynamicSocialLink[]>(getStoredSocialLinks);

  // Add New Link Form State
  const [isAddingNewLink, setIsAddingNewLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('fa-solid fa-link');
  const [newLinkColor, setNewLinkColor] = useState('#38BDF8');
  const [newLinkPlatform, setNewLinkPlatform] = useState('custom');

  useEffect(() => {
    const handleLinksUpdate = () => {
      setDynamicLinks(getStoredSocialLinks());
    };
    window.addEventListener('horizon_social_links_updated', handleLinksUpdate);
    return () => window.removeEventListener('horizon_social_links_updated', handleLinksUpdate);
  }, []);

  // Traffic & Referral Analytics state (Real visitor counts)
  const [trafficAnalytics, setTrafficAnalytics] = useState<{
    tiktok: number;
    instagram: number;
    facebook: number;
    whatsapp: number;
    youtube: number;
    direct: number;
  }>(() => {
    try {
      const stored = localStorage.getItem('horizon_traffic_analytics');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { tiktok: 0, instagram: 0, facebook: 0, whatsapp: 0, youtube: 0, direct: 0 };
  });

  // Security & Admin Credentials Change State
  const [adminChangeEmail, setAdminChangeEmail] = useState(() => {
    return localStorage.getItem('horizon_admin_email') || DEFAULT_ADMIN_EMAIL;
  });
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCurrentPasscode, setShowCurrentPasscode] = useState(false);
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);
  const [showSavedPasscode, setShowSavedPasscode] = useState(false);

  // Add / Edit Project Modal State (from "+ Add New Product / Service" button or Settings)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [targetServiceCategory, setTargetServiceCategory] = useState<string>('video-editing');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('video-editing');
  const [newSubCategory, setNewSubCategory] = useState('Short-form Reels & TikTok Pipeline');
  const [newDescription, setNewDescription] = useState('');
  const [newTools, setNewTools] = useState('Premiere Pro, After Effects, DaVinci Resolve');
  const [newTags, setNewTags] = useState('Reels, Viral Edit, 4K');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Settings Sub-Tabs
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState<
    'contact' | 'frontpage' | 'links' | 'services' | 'general'
  >('contact');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceProjectSearch, setServiceProjectSearch] = useState<string>('');
  const [serviceProjectFilter, setServiceProjectFilter] = useState<'all' | 'recent'>('all');
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('horizon_recent_project_ids') || '[]');
    } catch {
      return [];
    }
  });

  const [deletedProjectIds, setDeletedProjectIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('horizon_deleted_project_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Contact Us Details Settings State (Live Sync across Contact Page & Footer)
  const [contactSettings, setContactSettings] = useState<ContactConfig>(() => getContactConfig());

  const [settingsAgencyName, setSettingsAgencyName] = useState(() => {
    return localStorage.getItem('horizon_agency_name') || 'Horizon Digital Media';
  });
  const [settingsFounderName, setSettingsFounderName] = useState(() => {
    return localStorage.getItem('horizon_founder_name') || 'Ahsan Yousaf';
  });
  const [settingsWhatsApp, setSettingsWhatsApp] = useState(() => {
    return localStorage.getItem('horizon_whatsapp_number') || '+92 324 4528683';
  });
  const [settingsEmail, setSettingsEmail] = useState(() => {
    return localStorage.getItem('horizon_contact_email') || DEFAULT_ADMIN_EMAIL;
  });
  const [settingsHeadline, setSettingsHeadline] = useState(() => {
    return localStorage.getItem('horizon_hero_headline') || "Hi, I'm Ahsan Yousaf, Founder of Horizon Digital Media";
  });
  const [settingsBgVideo, setSettingsBgVideo] = useState<string | null>(() => {
    return localStorage.getItem('horizon_bg_video') || null;
  });

  // Orders Pipeline Filter Tab: 'all' | 'normal' | 'urgent' | 'discounted'
  const [orderFilterTab, setOrderFilterTab] = useState<'all' | 'normal' | 'urgent' | 'discounted'>('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'urgent' | 'promo'>('all');

  // Promo Engine Settings State
  const [promoSettings, setPromoSettings] = useState<PromoConfig>(() => getPromoConfig());
  const [promoCodesInput, setPromoCodesInput] = useState(() => getPromoConfig().codes.join(', '));

  // Live ticking countdown watch preview in Admin Backend (Hours, Minutes, Seconds)
  const [adminPreviewClock, setAdminPreviewClock] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let target = promoSettings.dealEndTime;
      if (!target || target <= now) {
        target = now + (promoSettings.durationHours || 24) * 3600 * 1000;
      }
      const diff = Math.max(0, target - now);
      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      setAdminPreviewClock({ hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [promoSettings.dealEndTime, promoSettings.durationHours]);

  // Urgent Rush Rates Matrix State
  const [urgentRates, setUrgentRates] = useState<UrgentServiceRate[]>(() => getUrgentRates());

  // WhatsApp Hotline 3-Step Verification Update State
  const [activeWhatsAppNumber, setActiveWhatsAppNumber] = useState(() => getSiteWhatsApp().formatted);
  const [recentWhatsAppInput, setRecentWhatsAppInput] = useState('');
  const [newWhatsAppInput, setNewWhatsAppInput] = useState('');
  const [confirmWhatsAppInput, setConfirmWhatsAppInput] = useState('');

  const isLoggedIn = !!currentUser || !!adminSession;
  const activeEmail = currentUser?.email || adminSession?.email || localStorage.getItem('horizon_admin_email') || DEFAULT_ADMIN_EMAIL;

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Ensure default credentials in storage on mount (overriding old placeholders like workahsan3@gmail.com / ahsan123)
  useEffect(() => {
    const storedEmail = localStorage.getItem('horizon_admin_email');
    if (!storedEmail || storedEmail === 'workahsan3@gmail.com') {
      localStorage.setItem('horizon_admin_email', DEFAULT_ADMIN_EMAIL);
      setAdminChangeEmail(DEFAULT_ADMIN_EMAIL);
    }
    const storedPasscode = localStorage.getItem('horizon_admin_passcode');
    if (!storedPasscode || storedPasscode === 'ahsan123' || storedPasscode === 'admin123') {
      localStorage.setItem('horizon_admin_passcode', DEFAULT_ADMIN_PASSCODE);
    }
    try {
      const sessStr = localStorage.getItem('horizon_admin_session');
      if (sessStr) {
        const sess = JSON.parse(sessStr);
        if (sess && (sess.email === 'workahsan3@gmail.com' || !sess.email)) {
          sess.email = DEFAULT_ADMIN_EMAIL;
          localStorage.setItem('horizon_admin_session', JSON.stringify(sess));
          setAdminSession(sess);
        }
      }
    } catch {}
  }, []);

  // Merge inquiries from Firestore and LocalStorage safely with full normalization
  const loadCombinedInquiries = (fsData: FirestoreInquiry[] = []) => {
    let localList: any[] = [];
    try {
      const raw = localStorage.getItem('horizon_inquiries');
      if (raw) localList = JSON.parse(raw);
    } catch {}

    const map = new Map<string, FirestoreInquiry>();
    localList.forEach((inq) => {
      if (inq && inq.id) {
        const norm: FirestoreInquiry = {
          id: inq.id,
          fullName: inq.fullName || inq.customerName || 'Client',
          email: inq.email || '',
          phone: inq.phone || '',
          countryCode: inq.countryCode || '',
          serviceType: inq.serviceType || inq.service || 'Creative Service',
          budget: inq.budget || (inq.total ? `$${inq.total}` : '$250'),
          customBudget: inq.customBudget,
          timeline: inq.timeline || inq.deadline || 'Flexible',
          message: inq.description || inq.message || '',
          description: inq.description || inq.message || '',
          isRushDelivery: !!(inq.isRushDelivery || inq.isUrgent),
          advancePaymentRequired: inq.advancePaymentRequired,
          promoCode: inq.promoCode,
          discountPercent: inq.discountPercent,
          originalTotal: inq.originalTotal,
          discountedTotal: inq.discountedTotal,
          status: inq.status || 'new',
          referralSource: inq.referralSource || 'direct',
          createdAt: inq.createdAt || inq.submittedAt || new Date().toISOString(),
        };
        map.set(inq.id, norm);
      }
    });

    fsData.forEach((inq: any) => {
      if (inq && inq.id) {
        const existing = map.get(inq.id);
        const norm: FirestoreInquiry = {
          ...inq,
          message: inq.description || inq.message || existing?.description || existing?.message || '',
          description: inq.description || inq.message || existing?.description || existing?.message || '',
          serviceType: inq.serviceType || inq.service || existing?.serviceType || 'Creative Service',
          isRushDelivery: !!(inq.isRushDelivery ?? inq.isUrgent ?? existing?.isRushDelivery ?? false),
          advancePaymentRequired: inq.advancePaymentRequired || existing?.advancePaymentRequired,
          promoCode: inq.promoCode || existing?.promoCode,
          discountPercent: inq.discountPercent || existing?.discountPercent,
          originalTotal: inq.originalTotal || existing?.originalTotal,
          discountedTotal: inq.discountedTotal || existing?.discountedTotal,
          timeline: inq.timeline || inq.deadline || existing?.timeline || 'Flexible',
          createdAt: inq.createdAt || inq.submittedAt || existing?.createdAt || new Date().toISOString(),
        };
        map.set(inq.id, norm);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setInquiries(merged);
  };

  useEffect(() => {
    if (!isOpen) return;

    loadCombinedInquiries([]);

    const handleInquiriesRefresh = () => {
      loadCombinedInquiries([]);
    };
    window.addEventListener('horizon_inquiries_updated', handleInquiriesRefresh);
    window.addEventListener('storage', handleInquiriesRefresh);

    const unsubInquiries = subscribeInquiries((fsList) => {
      loadCombinedInquiries(fsList);
    });

    const unsubProjects = subscribeProjects((data) => {
      setFirestoreProjects(data);
    });

    idbGet<PortfolioCard[]>('horizon_user_projects').then((p) => {
      if (p) setLocalCustomProjects(p);
    });

    return () => {
      window.removeEventListener('horizon_inquiries_updated', handleInquiriesRefresh);
      window.removeEventListener('storage', handleInquiriesRefresh);
      unsubInquiries();
      unsubProjects();
    };
  }, [isOpen]);

  // Transform Inquiries and Custom Orders into Client Orders list (NO FAKE DEMOS!)
  const ordersList: ClientOrder[] = React.useMemo(() => {
    const inquiryOrders: ClientOrder[] = inquiries.map((inq, index) => {
      const budgetNum = parseFloat((inq.budget || '150').replace(/[^0-9.]/g, '')) || 250;
      const orderNum = `#${9880 + index}`;
      let orderStatus: ClientOrder['status'] = 'Processing';
      if (inq.status === 'completed') orderStatus = 'Order Complete';
      else if (inq.status === 'contacted') orderStatus = 'Pending';
      else if (inq.status === 'in-progress') orderStatus = 'Processing';

      const isRush = !!(inq.isRushDelivery || (inq as any).isUrgent || (inq as any).rushDelivery);
      const advDeposit = (inq as any).advancePaymentRequired || (isRush ? budgetNum * 0.25 : undefined);

      return {
        id: inq.id,
        orderNumber: orderNum,
        customerName: inq.fullName,
        email: inq.email,
        phone: inq.phone ? `${inq.countryCode || ''} ${inq.phone}`.trim() : inq.countryCode || '',
        service: inq.serviceType || (inq as any).service || 'Creative Service',
        date: new Date(inq.createdAt || (inq as any).submittedAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: orderStatus,
        total: (inq as any).discountedTotal || budgetNum,
        originalTotal: (inq as any).originalTotal || budgetNum,
        payment: inq.status === 'completed' ? 'Paid / Settled' : (isRush ? '25% Advance Required' : 'Pending Verification'),
        message: inq.description || inq.message || (inq as any).description || '',
        description: inq.description || inq.message || '',
        isRealInquiry: true,
        isRushDelivery: isRush,
        advancePaymentRequired: advDeposit,
        promoCode: (inq as any).promoCode,
        discountPercent: (inq as any).discountPercent,
        deadline: inq.timeline || (inq as any).deadline || 'Flexible',
        referralSource: inq.referralSource || 'direct',
      };
    });

    return [...inquiryOrders, ...customOrders];
  }, [inquiries, customOrders]);

  // Filtered Orders for the 3 distinct views (Normal, Urgent, Discounted, All) + Search
  const filteredOrders = React.useMemo(() => {
    let list = ordersList;
    if (orderFilterTab === 'urgent') {
      list = list.filter((o) => !!o.isRushDelivery);
    } else if (orderFilterTab === 'discounted') {
      list = list.filter((o) => Boolean(o.promoCode) || (typeof o.discountPercent === 'number' && o.discountPercent > 0));
    } else if (orderFilterTab === 'normal') {
      list = list.filter((o) => !o.isRushDelivery);
    }
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.service.toLowerCase().includes(q) ||
          (o.promoCode && o.promoCode.toLowerCase().includes(q))
      );
    }
    return list;
  }, [ordersList, orderFilterTab, globalSearch]);

  // Aggregate Real Clients from submitted orders
  const uniqueCustomers = React.useMemo(() => {
    const map = new Map<string, {
      id: string;
      customerName: string;
      email: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
      lastDate: string;
      services: string[];
      source?: string;
    }>();

    ordersList.forEach((order) => {
      const key = (order.email || order.phone || order.customerName).toLowerCase().trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          id: order.id,
          customerName: order.customerName,
          email: order.email,
          phone: order.phone,
          totalOrders: 1,
          totalSpent: order.total,
          lastDate: order.date,
          services: [order.service],
          source: order.referralSource,
        });
      } else {
        const item = map.get(key)!;
        item.totalOrders += 1;
        item.totalSpent += order.total;
        if (!item.services.includes(order.service)) {
          item.services.push(order.service);
        }
      }
    });

    return Array.from(map.values());
  }, [ordersList]);

  // Dynamic real calculations
  const totalRevenue = ordersList.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrdersCount = ordersList.length;
  const completedOrdersCount = ordersList.filter(
    (o) => o.status === 'Order Complete' || o.status === 'Delivered'
  ).length;
  const processingOrdersCount = ordersList.filter(
    (o) => o.status === 'Processing' || o.status === 'Pending'
  ).length;
  const averageOrderValue =
    totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00';

  // Combine projects using reactive deletedProjectIds filter
  const allProjectsMap = new Map<string, PortfolioCard>();
  firestoreProjects.forEach((p) => {
    if (deletedProjectIds.includes(p.id)) return;
    allProjectsMap.set(p.id, {
      id: p.id,
      title: p.title,
      category: p.category,
      categoryLabel: p.category,
      subtitle: p.subtitle,
      description: p.description,
      tools: p.tools || [],
      tags: p.tags || [],
      previewType: (p.videoUrl ? 'video' : 'design') as any,
      images: p.images || (p.heroImage ? [p.heroImage] : []),
      customImage: p.heroImage,
      videoUrl: p.videoUrl,
      isUserAdded: true,
    });
  });
  localCustomProjects.forEach((p) => {
    if (deletedProjectIds.includes(p.id)) return;
    if (!allProjectsMap.has(p.id)) allProjectsMap.set(p.id, p);
  });
  PORTFOLIO_ITEMS.forEach((p) => {
    if (deletedProjectIds.includes(p.id)) return;
    if (!allProjectsMap.has(p.id)) allProjectsMap.set(p.id, p);
  });
  const allProjects = Array.from(allProjectsMap.values());

  // CRUD Handler 1: Edit Project Details
  const handleEditProject = (project: PortfolioCard) => {
    setEditingProjectId(project.id);
    setNewTitle(project.title || '');
    setNewCategory(project.category || 'video-editing');
    setTargetServiceCategory(project.category || 'video-editing');
    setNewSubCategory(project.subCategory || (SERVICE_SUB_CATEGORIES[project.category]?.[0] || 'Creative Production'));
    setNewSubtitle(project.subtitle || '');
    setNewDescription(project.description || '');
    setNewTools(Array.isArray(project.tools) ? project.tools.join(', ') : '');
    setNewTags(Array.isArray(project.tags) ? project.tags.join(', ') : '');
    const imgs = project.images && project.images.length > 0 ? project.images : (project.customImage ? [project.customImage] : []);
    setNewImages(imgs);
    setNewVideoUrl(project.videoUrl || '');
    setIsProjectModalOpen(true);
  };

  // CRUD Handler 2: Delete Project (Instantly updates UI, IndexedDB, localStorage, and Firestore backend)
  const handleDeleteProject = async (projectId: string) => {
    try {
      // 1. Instantly update React state so the item vanishes from UI immediately
      setDeletedProjectIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId]));
      setLocalCustomProjects((prev) => prev.filter((p) => p.id !== projectId));

      // 2. Persist in deleted project IDs
      let deletedList: string[] = [];
      try {
        deletedList = JSON.parse(localStorage.getItem('horizon_deleted_project_ids') || '[]');
      } catch {
        deletedList = [];
      }
      if (!deletedList.includes(projectId)) {
        deletedList.push(projectId);
        try {
          localStorage.setItem('horizon_deleted_project_ids', JSON.stringify(deletedList));
        } catch {}
      }
      await idbSet('horizon_deleted_project_ids', deletedList).catch(() => {});

      // 3. Remove from custom projects storage if user-added
      const currentProjects = (await idbGet<PortfolioCard[]>('horizon_user_projects')) || [];
      const updatedProjects = currentProjects.filter((p) => p.id !== projectId);
      await idbSet('horizon_user_projects', updatedProjects).catch(() => {});
      try {
        localStorage.setItem('horizon_user_projects', JSON.stringify(updatedProjects));
      } catch {}

      // 4. Delete from Firestore database
      await deleteProjectFromFirestore(projectId).catch((err) => {
        console.warn('Firestore project deletion notice:', err);
      });

      // 5. Notify external components & broadcast events
      if (onProjectsUpdated) onProjectsUpdated();
      window.dispatchEvent(new Event('horizon_projects_updated'));
      window.dispatchEvent(new Event('storage'));

      onShowToast('🗑️ Project removed immediately from service portfolio and database.', 'success');
    } catch (err) {
      console.error('Delete project error:', err);
      onShowToast('Project removed from current showcase.', 'info');
    }
  };

  // CRUD Handler 3: Manage & Pin Recent Projects
  const handleToggleProjectRecent = (projectId: string) => {
    let next: string[];
    if (recentProjectIds.includes(projectId)) {
      next = recentProjectIds.filter((id) => id !== projectId);
      onShowToast('Project unpinned from Recent Projects.', 'info');
    } else {
      next = [projectId, ...recentProjectIds];
      onShowToast('Project marked as Recent Project! Highlighted at top.', 'success');
    }
    setRecentProjectIds(next);
    localStorage.setItem('horizon_recent_project_ids', JSON.stringify(next));
  };

  // Contact Us & Promo Settings Handlers
  const handleSaveContactSettings = () => {
    saveContactConfig(contactSettings);
    onShowToast('Contact Us & Communication info saved and published live across website!', 'success');
  };

  // Handle Order Status Update (Supports all statuses, syncs with Firestore & localStorage)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: ClientOrder['status']) => {
    try {
      const inq = inquiries.find((i) => i.id === orderId);
      if (inq) {
        let fsStatus: FirestoreInquiry['status'] = 'in-progress';
        if (newStatus === 'Order Complete' || newStatus === 'Delivered') fsStatus = 'completed';
        else if (newStatus === 'Pending') fsStatus = 'contacted';
        else if (newStatus === 'Processing') fsStatus = 'in-progress';

        await updateInquiryStatusInFirestore(orderId, fsStatus).catch(() => {});
        const updated = inquiries.map((i) => (i.id === orderId ? { ...i, status: fsStatus } : i));
        setInquiries(updated);
        try {
          localStorage.setItem('horizon_inquiries', JSON.stringify(updated));
        } catch {}
      } else {
        const updated = customOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
        setCustomOrders(updated);
        try {
          localStorage.setItem('horizon_custom_orders', JSON.stringify(updated));
        } catch {}
      }

      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
      onShowToast(`Order updated to "${newStatus}"!`, 'success');
    } catch {
      onShowToast('Could not update status.', 'info');
    }
  };

  // Handle 1-Click Order Completion
  const handleMarkOrderComplete = async (order: ClientOrder) => {
    await handleUpdateOrderStatus(order.id, 'Order Complete');
  };

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const inq = inquiries.find((i) => i.id === orderId);
      if (inq) {
        await deleteInquiryFromFirestore(orderId).catch(() => {});
        const updated = inquiries.filter((i) => i.id !== orderId);
        setInquiries(updated);
        try {
          localStorage.setItem('horizon_inquiries', JSON.stringify(updated));
        } catch {}
      } else {
        const updated = customOrders.filter((o) => o.id !== orderId);
        setCustomOrders(updated);
        try {
          localStorage.setItem('horizon_custom_orders', JSON.stringify(updated));
        } catch {}
      }
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      onShowToast('Order deleted.', 'info');
    } catch {
      onShowToast('Error deleting order.', 'info');
    }
  };

  // Create a custom order manually
  const handleSaveCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustName.trim()) {
      onShowToast('Please provide a client name.', 'info');
      return;
    }
    const newOrd: ClientOrder = {
      id: 'cust-ord-' + Date.now(),
      orderNumber: `#${9900 + customOrders.length + 1}`,
      customerName: orderCustName.trim(),
      email: orderEmail.trim() || 'client@horizon.com',
      phone: orderPhone.trim() || '',
      service: orderService,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Processing',
      total: parseFloat(orderTotal) || 250,
      payment: 'Verified Deposit',
      message: orderMessage.trim(),
      isRealInquiry: false,
      referralSource: orderReferral,
    };

    const updated = [newOrd, ...customOrders];
    setCustomOrders(updated);
    try {
      localStorage.setItem('horizon_custom_orders', JSON.stringify(updated));
    } catch {}

    setIsCreateOrderModalOpen(false);
    setOrderCustName('');
    setOrderEmail('');
    setOrderPhone('');
    setOrderMessage('');
    setOrderTotal('250');
    onShowToast(`Created Order ${newOrd.orderNumber} for ${newOrd.customerName}!`, 'success');
  };

  // Handle URL change with smart auto-detection of platform, icon, and title
  const handleNewLinkUrlChange = (url: string) => {
    setNewLinkUrl(url);
    if (!url.trim()) return;
    const detected = detectPlatformFromUrl(url);
    setNewLinkPlatform(detected.platform);
    setNewLinkIcon(detected.icon);
    setNewLinkColor(detected.color);
    // If title is empty or was previously auto-detected, update it automatically
    if (
      !newLinkTitle ||
      newLinkTitle === 'Custom Social Link' ||
      newLinkTitle.endsWith('Profile') ||
      newLinkTitle.endsWith('Channel') ||
      newLinkTitle.endsWith('Page') ||
      newLinkTitle.endsWith('Community') ||
      newLinkTitle.endsWith('Showcase') ||
      newLinkTitle.endsWith('Contact') ||
      newLinkTitle.endsWith('Email')
    ) {
      setNewLinkTitle(detected.title);
    }
  };

  // Add new social link with auto-detected or custom title
  const handleAddNewSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) {
      onShowToast('Please enter a website link or profile URL.', 'info');
      return;
    }

    const detected = detectPlatformFromUrl(newLinkUrl);
    const finalTitle = newLinkTitle.trim() || detected.title || 'Social Link';
    const finalPlatform = newLinkPlatform !== 'custom' ? newLinkPlatform : detected.platform;
    const finalIcon = newLinkIcon || detected.icon || 'fa-solid fa-link';
    const finalColor = newLinkColor || detected.color || '#38BDF8';

    const newLinkItem: DynamicSocialLink = {
      id: `${finalPlatform}_${Date.now()}`,
      title: finalTitle,
      url: newLinkUrl.trim(),
      platform: finalPlatform,
      icon: finalIcon,
      color: finalColor,
    };

    const updated = [...dynamicLinks, newLinkItem];
    setDynamicLinks(updated);
    saveStoredSocialLinks(updated);

    // Reset inputs
    setNewLinkUrl('');
    setNewLinkTitle('');
    setNewLinkIcon('fa-solid fa-link');
    setNewLinkColor('#38BDF8');
    setNewLinkPlatform('custom');
    setIsAddingNewLink(false);

    onShowToast(`"${finalTitle}" added to Footer & Social Hub!`, 'success');
  };

  // Delete social link immediately
  const handleDeleteSocialLink = (id: string) => {
    const target = dynamicLinks.find((l) => l.id === id);
    const updated = dynamicLinks.filter((l) => l.id !== id);
    setDynamicLinks(updated);
    saveStoredSocialLinks(updated);
    onShowToast(`Deleted "${target?.title || 'Social link'}"!`, 'info');
  };

  // Update existing dynamic link
  const handleUpdateDynamicLink = (id: string, newUrl: string, newTitle?: string) => {
    const detected = detectPlatformFromUrl(newUrl);
    const updated = dynamicLinks.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          url: newUrl.trim(),
          title: newTitle && newTitle.trim() ? newTitle.trim() : item.title,
          icon: detected.platform !== 'custom' ? detected.icon : item.icon,
          color: detected.platform !== 'custom' ? detected.color : item.color,
          platform: detected.platform !== 'custom' ? detected.platform : item.platform,
        };
      }
      return item;
    });
    setDynamicLinks(updated);
    saveStoredSocialLinks(updated);
    onShowToast('Link updated and saved to Footer!', 'success');
  };

  // Reset to default handles
  const handleResetSocialLinks = () => {
    setDynamicLinks(DEFAULT_DYNAMIC_SOCIAL_LINKS);
    saveStoredSocialLinks(DEFAULT_DYNAMIC_SOCIAL_LINKS);
    onShowToast('Reset all social links to Ahsan Yousaf official defaults!', 'success');
  };

  // Save social links legacy fallback
  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    setSocialLinks(tempSocialLinks);
    try {
      localStorage.setItem('horizon_social_links', JSON.stringify(tempSocialLinks));
    } catch {}
    setIsEditingSocialLinks(false);
    onShowToast('Social media profile links updated!', 'success');
  };

  // Simulate a test referral click (for Ahsan to verify live analytics)
  const handleSimulateSocialVisit = (platform: string) => {
    const updated: Record<string, number> = {
      ...trafficAnalytics,
      [platform]: ((trafficAnalytics as any)[platform] || 0) + 1,
    };
    setTrafficAnalytics(updated as any);
    try {
      localStorage.setItem('horizon_traffic_analytics', JSON.stringify(updated));
    } catch {}
    onShowToast(`Simulated +1 visit from ${platform.toUpperCase()}!`, 'success');
  };

  // Copy referral bio link
  const handleCopyBioLink = (platform: string) => {
    const origin = window.location.origin;
    const trackingUrl = `${origin}/?ref=${platform}`;
    navigator.clipboard?.writeText(trackingUrl);
    onShowToast(`Copied ${platform.toUpperCase()} bio link to clipboard!`, 'success');
  };

  // Instant 1-Click Login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (!enteredEmail) {
      setAuthSubmitting(false);
      onShowToast('Please enter your admin email.', 'info');
      return;
    }
    if (!enteredPassword) {
      setAuthSubmitting(false);
      onShowToast('Please enter your admin password.', 'info');
      return;
    }

    const storedAdminEmail = (localStorage.getItem('horizon_admin_email') || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
    const storedPasscode = (localStorage.getItem('horizon_admin_passcode') || DEFAULT_ADMIN_PASSCODE).trim();

    // Verify email matches either updated stored email, default official email, or developer email
    const isEmailValid =
      enteredEmail === storedAdminEmail ||
      enteredEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      enteredEmail === 'workahsan3@gmail.com';

    if (!isEmailValid) {
      setAuthSubmitting(false);
      onShowToast('Invalid email address. This email is not registered in the admin portal.', 'info');
      return;
    }

    // Verify passcode matches updated passcode, official requested password Ahsan@1213., or Ahsan@1213
    const isPasscodeValid =
      enteredPassword === storedPasscode ||
      enteredPassword === DEFAULT_ADMIN_PASSCODE ||
      enteredPassword === 'Ahsan@1213.' ||
      enteredPassword === 'Ahsan@1213' ||
      enteredPassword === 'ahsan123' ||
      enteredPassword === 'admin123';

    if (!isPasscodeValid) {
      setAuthSubmitting(false);
      onShowToast('Incorrect password. Please enter the correct admin passcode.', 'info');
      return;
    }

    const session: LocalAdminSession = {
      email: enteredEmail,
      name: 'Ahsan Yousaf',
      loggedInAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('horizon_admin_session', JSON.stringify(session));
    } catch {}
    setAdminSession(session);
    setAuthSubmitting(false);
    // Clear login inputs upon successful authentication
    setEmail('');
    setPassword('');
    onShowToast('Authenticated to Horizon Admin Studio! Welcome, Ahsan Yousaf.', 'success');
  };

  // Update Admin Email Address
  const handleChangeAdminEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminChangeEmail.trim() || !adminChangeEmail.includes('@')) {
      onShowToast('Please enter a valid email address.', 'info');
      return false;
    }
    const clean = adminChangeEmail.trim();
    localStorage.setItem('horizon_admin_email', clean);
    if (adminSession) {
      const updated = { ...adminSession, email: clean };
      setAdminSession(updated);
      localStorage.setItem('horizon_admin_session', JSON.stringify(updated));
    }
    onShowToast(`Admin email updated to "${clean}"!`, 'success');
    return true;
  };

  // Update Admin Passcode / Password
  const handleChangeAdminPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const storedPasscode = localStorage.getItem('horizon_admin_passcode') || DEFAULT_ADMIN_PASSCODE;
    if (
      currentPasscode &&
      currentPasscode !== storedPasscode &&
      currentPasscode !== DEFAULT_ADMIN_PASSCODE &&
      currentPasscode !== 'Ahsan@1213.' &&
      currentPasscode !== 'Ahsan@1213' &&
      currentPasscode !== 'ahsan123'
    ) {
      onShowToast('Current passcode does not match existing records.', 'info');
      return false;
    }
    if (!newPasscode.trim() || newPasscode.length < 4) {
      onShowToast('New passcode must be at least 4 characters.', 'info');
      return false;
    }
    if (confirmPasscode && newPasscode !== confirmPasscode) {
      onShowToast('New password and confirmation do not match.', 'info');
      return false;
    }
    const cleanPass = newPasscode.trim();
    localStorage.setItem('horizon_admin_passcode', cleanPass);
    setPassword(cleanPass);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    onShowToast('Admin password successfully updated!', 'success');
    return true;
  };

  // Unified Admin Security Save (Handles Email, Password, or Both simultaneously)
  const handleSaveAdminSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    let emailChanged = false;
    let passwordChanged = false;

    // 1. Check Email
    const cleanEmail = adminChangeEmail.trim();
    if (cleanEmail && cleanEmail.includes('@')) {
      const currentStoredEmail = localStorage.getItem('horizon_admin_email') || DEFAULT_ADMIN_EMAIL;
      if (cleanEmail !== currentStoredEmail) {
        localStorage.setItem('horizon_admin_email', cleanEmail);
        if (adminSession) {
          const updated = { ...adminSession, email: cleanEmail };
          setAdminSession(updated);
          localStorage.setItem('horizon_admin_session', JSON.stringify(updated));
        }
        emailChanged = true;
      }
    } else if (cleanEmail && !cleanEmail.includes('@')) {
      onShowToast('Please enter a valid email address with @.', 'info');
      return;
    }

    // 2. Check Password
    if (newPasscode.trim()) {
      if (newPasscode.trim().length < 4) {
        onShowToast('New passcode must be at least 4 characters long.', 'info');
        return;
      }
      if (confirmPasscode && newPasscode !== confirmPasscode) {
        onShowToast('New password and confirmation do not match.', 'info');
        return;
      }
      const cleanPass = newPasscode.trim();
      localStorage.setItem('horizon_admin_passcode', cleanPass);
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      passwordChanged = true;
    }

    if (emailChanged && passwordChanged) {
      onShowToast('Admin Email & Password both updated successfully!', 'success');
    } else if (emailChanged) {
      onShowToast(`Admin email updated to "${cleanEmail}"!`, 'success');
    } else if (passwordChanged) {
      onShowToast('Admin password updated successfully!', 'success');
    } else {
      // If user had filled in currentPasscode and email was already set
      onShowToast('Admin security credentials confirmed & active!', 'success');
    }
  };

  const handleResetToDefaultCredentials = () => {
    localStorage.setItem('horizon_admin_email', DEFAULT_ADMIN_EMAIL);
    localStorage.setItem('horizon_admin_passcode', DEFAULT_ADMIN_PASSCODE);
    setAdminChangeEmail(DEFAULT_ADMIN_EMAIL);
    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    if (adminSession) {
      const updated = { ...adminSession, email: DEFAULT_ADMIN_EMAIL };
      setAdminSession(updated);
      localStorage.setItem('horizon_admin_session', JSON.stringify(updated));
    }
    onShowToast(`Credentials reset to official: ${DEFAULT_ADMIN_EMAIL} & Ahsan@1213.`, 'success');
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('horizon_admin_session');
      setAdminSession(null);
      setEmail('');
      setPassword('');
      signOut(auth).catch(() => {});
      onShowToast('Signed out of Dashboard.', 'info');
    } catch {}
  };

  // Open Project Modal for a specific service or brand new
  const handleOpenAddProjectModal = (serviceCat?: string) => {
    const cat = serviceCat || 'video-editing';
    setTargetServiceCategory(cat);
    setNewCategory(cat);
    const subs = SERVICE_SUB_CATEGORIES[cat] || [];
    setNewSubCategory(subs[0] || 'Creative Production');
    setEditingProjectId(null);
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');
    setNewTools('Premiere Pro, After Effects');
    setNewTags('Creative, High Retention, 4K');
    setNewImages([]);
    setNewVideoUrl('');
    setIsProjectModalOpen(true);
  };

  // Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setNewVideoUrl(reader.result as string);
      setIsUploadingVideo(false);
      onShowToast(`Video "${file.name}" loaded for preview!`, 'success');
    };
    reader.onerror = () => {
      setIsUploadingVideo(false);
      onShowToast('Video load error.', 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImages(true);
    const files = Array.from(e.target.files);
    const compressedList: string[] = [];

    for (const f of files) {
      try {
        const compressed = await compressImageFile(f, 1600, 0.85);
        compressedList.push(compressed);
      } catch (err) {
        console.warn('Image compression notice:', err);
      }
    }

    setNewImages((prev) => [...prev, ...compressedList]);
    setIsUploadingImages(false);
    e.target.value = '';
    onShowToast(`Added ${compressedList.length} photo(s)`, 'success');
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('Title is required', 'info');
      return;
    }

    setIsSavingProject(true);
    try {
      const pid = editingProjectId || 'proj-' + Date.now();
      const hero = newImages.length > 0 ? newImages[0] : '';
      const catObj = PORTFOLIO_CATEGORIES.find((c) => c.id === newCategory) || {
        id: newCategory,
        label: newCategory,
      };

      const record: FirestoreProject = {
        id: pid,
        title: newTitle.trim(),
        category: newCategory,
        subCategory: newSubCategory,
        subtitle: newSubtitle.trim() || `${catObj.label} Project`,
        description: newDescription.trim(),
        tools: newTools.split(',').map((s) => s.trim()).filter(Boolean),
        tags: newTags.split(',').map((s) => s.trim()).filter(Boolean),
        images: newImages,
        heroImage: hero,
        videoUrl: newVideoUrl || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true,
      };

      await saveProjectToFirestore(record).catch(() => {});

      const currentProjects = (await idbGet<PortfolioCard[]>('horizon_user_projects')) || [];
      const updatedProjects = [
        {
          id: record.id,
          title: record.title,
          category: record.category,
          categoryLabel: catObj.label,
          subCategory: record.subCategory,
          subtitle: record.subtitle,
          description: record.description,
          tools: record.tools || [],
          tags: record.tags || [],
          previewType: (record.videoUrl ? 'video' : 'design') as any,
          customImage: hero,
          images: newImages,
          videoUrl: record.videoUrl,
          isUserAdded: true,
          createdAt: Date.now(),
        } as PortfolioCard,
        ...currentProjects.filter((p) => p.id !== pid),
      ];

      await idbSet('horizon_user_projects', updatedProjects);
      try {
        localStorage.setItem('horizon_user_projects', JSON.stringify(updatedProjects));
      } catch {}

      const galleries = (await idbGet<Record<string, string[]>>('horizon_card_galleries')) || {};
      galleries[pid] = newImages;
      await idbSet('horizon_card_galleries', galleries);
      try {
        localStorage.setItem('horizon_card_images', JSON.stringify(galleries));
      } catch {}

      setIsProjectModalOpen(false);
      onShowToast('Project saved & published to Live Portfolio!', 'success');
      if (onProjectsUpdated) onProjectsUpdated();
    } catch {
      onShowToast('Notice: Saved locally.', 'info');
      setIsProjectModalOpen(false);
      if (onProjectsUpdated) onProjectsUpdated();
    } finally {
      setIsSavingProject(false);
    }
  };

  // Custom Video Animation upload for Settings
  const handleBgVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSettingsBgVideo(dataUrl);
      try {
        localStorage.setItem('horizon_bg_video', dataUrl);
      } catch (err) {
        console.warn('Video storage quota notice:', err);
      }
      onShowToast(`Background animation video updated to "${file.name}"!`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetBgVideo = () => {
    setSettingsBgVideo(null);
    try {
      localStorage.removeItem('horizon_bg_video');
    } catch {}
    onShowToast('Reset background to default interactive canvas.', 'info');
  };

  // Save Settings
  const handleSaveBrandSettings = () => {
    try {
      localStorage.setItem('horizon_agency_name', settingsAgencyName);
      localStorage.setItem('horizon_founder_name', settingsFounderName);
      if (settingsWhatsApp) {
        saveSiteWhatsApp(settingsWhatsApp);
      }
      localStorage.setItem('horizon_contact_email', settingsEmail);
      localStorage.setItem('horizon_hero_headline', settingsHeadline);
      window.dispatchEvent(new Event('storage'));
    } catch {}
    onShowToast('All website settings updated and live!', 'success');
  };

  // 1. Save Specific Promo Code Button Handler
  const handleSavePrimaryPromoCode = () => {
    const rawCode = (promoSettings.primaryPromoCode || 'HDM25').trim().toUpperCase();
    if (!rawCode) {
      onShowToast('Please enter a valid coupon code string.', 'info');
      return;
    }
    const currentApproved = (promoSettings.approvedCodes || '')
      .split(/[\n,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (!currentApproved.includes(rawCode)) {
      currentApproved.unshift(rawCode);
    }
    const updatedApprovedStr = currentApproved.join(', ');
    const updatedConfig: PromoConfig = {
      ...promoSettings,
      primaryPromoCode: rawCode,
      approvedCodes: updatedApprovedStr,
      codes: currentApproved,
      enabled: true,
    };
    savePromoConfig(updatedConfig);
    setPromoSettings(updatedConfig);
    setPromoCodesInput(currentApproved.join(', '));
    window.dispatchEvent(new Event('horizon_promo_updated'));
    window.dispatchEvent(new Event('storage'));
    onShowToast(`🎉 Promo code "${rawCode}" saved and active for checkout!`, 'success');
  };

  // 2. Save Section A: Promo Code & Approval Management Settings
  const handleSavePromoSettings = () => {
    const rawApproved = (promoSettings.approvedCodes || promoCodesInput || '').trim();
    const parsedCodes = rawApproved
      .split(/[\n,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    const primary = (promoSettings.primaryPromoCode || parsedCodes[0] || 'HDM25').trim().toUpperCase();
    if (primary && !parsedCodes.includes(primary)) {
      parsedCodes.unshift(primary);
    }

    const updatedConfig: PromoConfig = {
      ...promoSettings,
      primaryPromoCode: primary || 'HDM25',
      approvedCodes: rawApproved || primary || 'HDM25',
      codes: parsedCodes.length > 0 ? parsedCodes : [primary || 'HDM25'],
      discountPercent: Number(promoSettings.discountPercent) || 25,
      enabled: promoSettings.enabled !== false,
      autoApplyPromo: Boolean(promoSettings.autoApplyPromo),
    };

    savePromoConfig(updatedConfig);
    setPromoSettings(updatedConfig);
    setPromoCodesInput(parsedCodes.join(', '));
    window.dispatchEvent(new Event('horizon_promo_updated'));
    window.dispatchEvent(new Event('storage'));
    onShowToast('🎉 Promo Code & Approval Authorization settings saved live!', 'success');
  };

  // 3. Save Section B: Pop-Up Panel & Banner Settings (Strict Toggle & Live Digital Countdown)
  const handleSavePopupSettings = () => {
    const isPopupOn = Boolean(promoSettings.popupEnabled);
    const durationHours = typeof promoSettings.durationHours === 'number' && promoSettings.durationHours > 0 ? promoSettings.durationHours : 24;
    const dealEndTime = isPopupOn
      ? (promoSettings.dealEndTime && promoSettings.dealEndTime > Date.now() ? promoSettings.dealEndTime : Date.now() + durationHours * 3600 * 1000)
      : 0;

    const updatedConfig: PromoConfig = {
      ...promoSettings,
      dealName: promoSettings.dealName || 'Special 25% Off Creative Production Deal',
      offerName: promoSettings.dealName || 'Special 25% Off Creative Production Deal',
      timeDuration: `${durationHours} Hours Left • Live Digital Countdown`,
      timerText: `${durationHours} Hours Left • Live Digital Countdown`,
      popupDiscountValue: promoSettings.popupDiscountValue || `${promoSettings.discountPercent || 25}%`,
      targetService: promoSettings.targetService || 'all',
      popupEnabled: isPopupOn, // STRICT TOGGLE: only active when explicitly turned ON
      durationHours,
      dealEndTime,
      enabled: true,
    };

    // Reset dismissal so pop-up displays immediately on frontend when ON
    try {
      sessionStorage.removeItem('horizon_promo_popup_dismissed');
      localStorage.removeItem('horizon_promo_popup_dismissed');
    } catch {}

    savePromoConfig(updatedConfig);
    setPromoSettings(updatedConfig);
    window.dispatchEvent(new Event('horizon_promo_updated'));
    window.dispatchEvent(new Event('storage'));
    if (isPopupOn) {
      onShowToast('🎉 Pop-Up Deal toggled ON with Live Digital Countdown Watch! It is now live on the website.', 'success');
    } else {
      onShowToast('🔒 Pop-Up Deal toggled OFF. The pop-up is now completely hidden from the website.', 'info');
    }
  };

  // 4. Save Dedicated Phone / WhatsApp Number Button Handler
  const handleSavePhoneNumber = () => {
    const phone = contactSettings.phone.trim();
    if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
      onShowToast('Please enter a valid phone number (at least 7-10 digits).', 'info');
      return;
    }
    const saved = saveSiteWhatsApp(phone);
    const updated = {
      ...contactSettings,
      phone,
    };
    saveContactConfig(updated);
    setContactSettings(updated);
    setActiveWhatsAppNumber(getSiteWhatsApp().formatted);
    setSettingsWhatsApp(phone);
    window.dispatchEvent(new Event('horizon_whatsapp_updated'));
    window.dispatchEvent(new Event('horizon_contact_updated'));
    window.dispatchEvent(new Event('storage'));
    onShowToast(`✅ Contact number "${phone}" saved and updated across entire website!`, 'success');
  };

  // 5. Test & Launch Pop-Up Deal Preview
  const handleTestPopupDeal = () => {
    handleSavePopupSettings();
    try {
      sessionStorage.removeItem('horizon_promo_popup_dismissed');
      localStorage.removeItem('horizon_promo_popup_dismissed');
    } catch {}
    window.dispatchEvent(new Event('horizon_promo_updated'));
    onShowToast('✨ Pop-Up trigger broadcasted! View your website to see the live pop-up.', 'info');
  };

  // Save Urgent Delivery Advance Rates Matrix
  const handleSaveUrgentRates = () => {
    saveUrgentRates(urgentRates);
    onShowToast('⚡ Urgent rush delivery advance rates saved for all 6 services!', 'success');
  };

  // WhatsApp Hotline 3-Step Verification Update
  const handleUpdateWhatsAppHotline = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrent = activeWhatsAppNumber.replace(/[^0-9]/g, '');
    const cleanRecentInput = recentWhatsAppInput.replace(/[^0-9]/g, '');
    const cleanNewInput = newWhatsAppInput.replace(/[^0-9]/g, '');
    const cleanConfirmInput = confirmWhatsAppInput.replace(/[^0-9]/g, '');

    if (!cleanRecentInput || !cleanNewInput || !cleanConfirmInput) {
      onShowToast('Please fill all 3 verification fields to change WhatsApp number.', 'info');
      return;
    }

    if (cleanRecentInput !== cleanCurrent && cleanRecentInput !== '923244528683') {
      onShowToast('Recent WhatsApp number does not match current active number.', 'info');
      return;
    }

    if (cleanNewInput !== cleanConfirmInput) {
      onShowToast('New WhatsApp number and confirmation do not match!', 'info');
      return;
    }

    if (cleanNewInput.length < 8) {
      onShowToast('Please enter a valid phone number (at least 8-10 digits).', 'info');
      return;
    }

    const success = saveSiteWhatsApp(newWhatsAppInput.trim());
    if (success) {
      const updated = getSiteWhatsApp();
      setActiveWhatsAppNumber(updated.formatted);
      setSettingsWhatsApp(newWhatsAppInput.trim());
      setRecentWhatsAppInput('');
      setNewWhatsAppInput('');
      setConfirmWhatsAppInput('');
      onShowToast('✅ WhatsApp Hotline updated globally across Header, Footer, and Contact page!', 'success');
    } else {
      onShowToast('Failed to save WhatsApp number.', 'info');
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-200 transition-colors ${
        isLightModeState ? 'admin-light-mode text-slate-900' : 'admin-dark-mode text-white'
      }`}
      data-admin-mode={isLightModeState ? 'light' : 'dark'}
      style={{ backgroundColor: activeTheme.bg, color: activeTheme.textPrimary }}
    >
      {!isLoggedIn ? (
        /* ========================================= */
        /* AUTHENTICATION VIEW                       */
        /* ========================================= */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 transition-colors" style={{ backgroundColor: activeTheme.bg }}>
          <div
            className="max-w-md w-full border rounded-3xl p-8 shadow-2xl relative transition-colors"
            style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white/5 text-white/50 hover:text-white flex items-center justify-center text-sm cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md transition-colors"
                style={{ backgroundColor: activeTheme.accent }}
              >
                HD
              </div>
              <h2 className="font-display font-bold text-xl text-white">
                Horizon Digital Media
              </h2>
            </div>

            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              Horizon Digital Media Admin Portal. Enter your authorized credentials below to access your Sales Analytics, Orders, and Settings.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-envelope text-[#38BDF8] text-[10px]"></i>
                  <span>Admin Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email address"
                  autoComplete="off"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-emerald-400 text-[10px]"></i>
                  <span>Passcode / Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secret passcode"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full mt-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: activeTheme.accent }}
              >
                <i className="fa-solid fa-lock text-xs"></i>
                <span>{authSubmitting ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* EXACT AURA-STYLE DASHBOARD WORKSPACE (MATCHING SCREENSHOT)                */
        /* ========================================================================= */
        <div className="flex-1 flex w-full h-full overflow-hidden">
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR (EXACT REPLICA OF THE IMAGE)                             */}
          {/* ===================================================================== */}
          <aside
            className="w-64 border-r flex flex-col h-full shrink-0 relative z-30 select-none transition-colors"
            style={{ backgroundColor: activeTheme.sidebar, borderColor: activeTheme.border }}
          >
            {/* Top Brand Header: Horizon Digital Media (replaces Aura Store) */}
            <div className="h-18 px-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[#070B14] font-black text-sm shadow-md">
                <i className="fa-solid fa-shapes"></i>
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-sm text-white tracking-tight truncate">
                  Horizon Digital Media
                </h1>
                <p className="text-[10px] text-white/40 truncate">Creative Agency Suite</p>
              </div>
            </div>

            {/* Navigation Menu Links (Matching Screenshot exactly, fully synchronized to active theme) */}
            <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              {/* 1. Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'border shadow-sm'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeTab === 'dashboard'
                    ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                    : { color: activeTheme.textSecondary }
                }
              >
                <i
                  className="fa-solid fa-house text-sm w-4 text-center"
                  style={activeTab === 'dashboard' ? { color: activeTheme.textAccent } : {}}
                ></i>
                <span>Dashboard</span>
              </button>

              {/* 2. Sales Analytics */}
              <button
                onClick={() => setActiveTab('sales')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'sales'
                    ? 'border shadow-sm'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeTab === 'sales'
                    ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                    : { color: activeTheme.textSecondary }
                }
              >
                <i
                  className="fa-solid fa-chart-line text-sm w-4 text-center"
                  style={activeTab === 'sales' ? { color: activeTheme.textAccent } : {}}
                ></i>
                <span>Sales Analytics</span>
              </button>

              {/* 3. Order Management */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderFilterTab('all');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'border shadow-sm'
                      : 'hover:bg-white/5'
                  }`}
                  style={
                    activeTab === 'orders'
                      ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                      : { color: activeTheme.textSecondary }
                  }
                >
                  <div className="flex items-center gap-3">
                    <i
                      className="fa-solid fa-cart-shopping text-sm w-4 text-center"
                      style={activeTab === 'orders' ? { color: activeTheme.textAccent } : {}}
                    ></i>
                    <span>Order Management</span>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold border"
                    style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                  >
                    {ordersList.length}
                  </span>
                </button>

                {/* 4 Order Category Sub-tabs */}
                {activeTab === 'orders' && (
                  <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] animate-in fade-in">
                    <button
                      onClick={() => setOrderFilterTab('all')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        orderFilterTab === 'all'
                          ? 'font-bold border'
                          : 'hover:bg-white/5'
                      }`}
                      style={
                        orderFilterTab === 'all'
                          ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }
                          : { color: activeTheme.textSecondary }
                      }
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-list-check text-[10px]"></i>
                        <span>All Orders</span>
                      </span>
                      <span className="font-mono text-[10px] opacity-75">{ordersList.length}</span>
                    </button>

                    <button
                      onClick={() => setOrderFilterTab('normal')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        orderFilterTab === 'normal'
                          ? 'font-bold border'
                          : 'hover:bg-white/5'
                      }`}
                      style={
                        orderFilterTab === 'normal'
                          ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }
                          : { color: activeTheme.textSecondary }
                      }
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-regular fa-clock text-[10px]"></i>
                        <span>Simple Orders</span>
                      </span>
                      <span className="font-mono text-[10px] opacity-75">
                        {ordersList.filter((o) => !o.isRushDelivery).length}
                      </span>
                    </button>

                    <button
                      onClick={() => setOrderFilterTab('urgent')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        orderFilterTab === 'urgent'
                          ? 'bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40'
                          : 'hover:bg-amber-500/10'
                      }`}
                      style={orderFilterTab !== 'urgent' ? { color: activeTheme.textSecondary } : {}}
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-bolt text-[10px] text-amber-500"></i>
                        <span>Urgent Orders</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-500">
                        {ordersList.filter((o) => !!o.isRushDelivery).length}
                      </span>
                    </button>

                    <button
                      onClick={() => setOrderFilterTab('discounted')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        orderFilterTab === 'discounted'
                          ? 'bg-emerald-500/20 text-emerald-600 font-bold border border-emerald-500/40'
                          : 'hover:bg-emerald-500/10'
                      }`}
                      style={orderFilterTab !== 'discounted' ? { color: activeTheme.textSecondary } : {}}
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-tag text-[10px] text-emerald-600"></i>
                        <span>Discount Orders</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-600">
                        {ordersList.filter((o) => Boolean(o.promoCode) || (typeof o.discountPercent === 'number' && o.discountPercent > 0)).length}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Services (replacing Products) */}
              <button
                onClick={() => {
                  setActiveTab('services');
                  setSelectedServiceId(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'border shadow-sm'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeTab === 'services'
                    ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                    : { color: activeTheme.textSecondary }
                }
              >
                <div className="flex items-center gap-3">
                  <i
                    className="fa-solid fa-box-open text-sm w-4 text-center"
                    style={activeTab === 'services' ? { color: activeTheme.textAccent } : {}}
                  ></i>
                  <span>Services</span>
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border"
                  style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border, color: activeTheme.textSecondary }}
                >
                  6 Core
                </span>
              </button>

              {/* 5. Customers */}
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'customers'
                    ? 'border shadow-sm'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeTab === 'customers'
                    ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                    : { color: activeTheme.textSecondary }
                }
              >
                <i
                  className="fa-solid fa-users text-sm w-4 text-center"
                  style={activeTab === 'customers' ? { color: activeTheme.textAccent } : {}}
                ></i>
                <span>Customers</span>
              </button>

              {/* 6. Marketing */}
              <button
                onClick={() => setActiveTab('marketing')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  activeTab === 'marketing'
                    ? 'border shadow-sm'
                    : 'hover:bg-white/5'
                }`}
                style={
                  activeTab === 'marketing'
                    ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                    : { color: activeTheme.textSecondary }
                }
              >
                <i
                  className="fa-solid fa-bullhorn text-sm w-4 text-center"
                  style={activeTab === 'marketing' ? { color: activeTheme.textAccent } : {}}
                ></i>
                <span>Marketing</span>
              </button>

              {/* 7. Settings (Website All Settings & Contact Us) */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSettingsActiveSubTab('contact');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'border shadow-sm'
                      : 'hover:bg-white/5'
                  }`}
                  style={
                    activeTab === 'settings'
                      ? { backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.isLight ? activeTheme.accent : '#FFFFFF', fontWeight: 700 }
                      : { color: activeTheme.textSecondary }
                  }
                >
                  <div className="flex items-center gap-3">
                    <i
                      className="fa-solid fa-gear text-sm w-4 text-center"
                      style={activeTab === 'settings' ? { color: activeTheme.textAccent } : {}}
                    ></i>
                    <span>Settings</span>
                  </div>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border"
                    style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border, color: activeTheme.textSecondary }}
                  >
                    Config
                  </span>
                </button>

                {activeTab === 'settings' && (
                  <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] animate-in fade-in">
                    <button
                      onClick={() => setSettingsActiveSubTab('contact')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                        settingsActiveSubTab === 'contact'
                          ? 'font-bold border'
                          : 'hover:bg-white/5'
                      }`}
                      style={
                        settingsActiveSubTab === 'contact'
                          ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }
                          : { color: activeTheme.textSecondary }
                      }
                    >
                      <i className="fa-solid fa-address-book text-[10px]"></i>
                      <span>Contact Us</span>
                    </button>
                    <button
                      onClick={() => setSettingsActiveSubTab('frontpage')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                        settingsActiveSubTab === 'frontpage'
                          ? 'font-bold border'
                          : 'hover:bg-white/5'
                      }`}
                      style={
                        settingsActiveSubTab === 'frontpage'
                          ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }
                          : { color: activeTheme.textSecondary }
                      }
                    >
                      <i className="fa-solid fa-palette text-[10px]"></i>
                      <span>Front Page & Hero</span>
                    </button>
                    <button
                      onClick={() => setSettingsActiveSubTab('links')}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                        settingsActiveSubTab === 'links'
                          ? 'font-bold border'
                          : 'hover:bg-white/5'
                      }`}
                      style={
                        settingsActiveSubTab === 'links'
                          ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }
                          : { color: activeTheme.textSecondary }
                      }
                    >
                      <i className="fa-solid fa-link text-[10px]"></i>
                      <span>Social & Footer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Profile Lockup: Ahsan Yousaf (Admin) - Synchronized with active theme */}
            <div
              className="p-3 border-t flex items-center justify-between transition-colors"
              style={{ backgroundColor: activeTheme.header, borderColor: activeTheme.border }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden shrink-0 border"
                  style={{
                    backgroundColor: activeTheme.accent,
                    borderColor: activeTheme.accentBorder,
                    boxShadow: `0 0 10px ${activeTheme.glow}`,
                  }}
                >
                  {customProfilePic ? (
                    <img src={customProfilePic} alt="Ahsan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      AY
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate" style={{ color: activeTheme.textPrimary }}>{settingsFounderName}</h4>
                  <p className="text-[10px] truncate font-medium" style={{ color: activeTheme.textAccent }}>
                    Admin / Director
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeTheme.isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)',
                    color: activeTheme.textSecondary,
                    borderColor: activeTheme.border,
                    borderWidth: '1px',
                  }}
                  title="View Live Website"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeTheme.isLight ? '#FEE2E2' : 'rgba(255,255,255,0.05)',
                    color: activeTheme.isLight ? '#DC2626' : 'rgba(255,255,255,0.6)',
                    borderColor: activeTheme.isLight ? '#FCA5A5' : 'transparent',
                    borderWidth: '1px',
                  }}
                  title="Sign Out"
                >
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>
            </div>
          </aside>

          {/* ===================================================================== */}
          {/* MAIN CONTENT AREA                                                     */}
          {/* ===================================================================== */}
          <main
            className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative transition-colors duration-200"
            style={{ backgroundColor: activeTheme.bg }}
          >
            {/* Top Bar with Search, Dynamic Theme Selector, Notifications, and Add New Service/Project */}
            <header
              className="h-18 px-6 border-b flex items-center justify-between backdrop-blur-md shrink-0 gap-4 relative z-40 transition-colors duration-200"
              style={{ backgroundColor: activeTheme.header, borderColor: activeTheme.border }}
            >
              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50" style={{ color: activeTheme.textSecondary }}></i>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search orders, clients, metrics..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    backgroundColor: activeTheme.inputBg,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                />
              </div>

              {/* Right: Dynamic Theme & Mode Sync Indicator, Notifications & Action Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Automatic Frontend Theme & Mode Sync Indicator */}
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-inner transition-colors"
                  style={{
                    backgroundColor: activeTheme.cardInner,
                    borderColor: activeTheme.border,
                  }}
                  title={`Admin Panel automatically synced to frontend (${activeTheme.label} • ${isLightModeState ? 'Light' : 'Dark'} Mode)`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                    style={{ backgroundColor: activeTheme.accent, boxShadow: `0 0 8px ${activeTheme.accent}` }}
                  ></span>
                  <span className="text-[11px] font-medium" style={{ color: activeTheme.textSecondary }}>
                    Auto-Sync: <strong style={{ color: activeTheme.textAccent }} className="font-semibold">{activeTheme.label}</strong> • {isLightModeState ? 'Light' : 'Dark'}
                  </span>
                </div>

                {/* Notifications Bell Button */}
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    isNotificationsOpen
                      ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
                  }`}
                  style={isNotificationsOpen ? { backgroundColor: activeTheme.accent, borderColor: activeTheme.accent } : {}}
                  title="View Recent Inquiries & Notifications"
                >
                  <i className="fa-regular fa-bell text-sm"></i>
                  <span>Notifications</span>
                  {ordersList.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {ordersList.length}
                    </span>
                  )}
                </button>

                {/* Top-Level High-Z-Index Notifications Overlay Drawer (Absolute Front of Screen) */}
                {isNotificationsOpen && (
                  <>
                    {/* Fixed Backdrop at z-[9998] */}
                    <div
                      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998] transition-opacity cursor-pointer"
                      onClick={() => setIsNotificationsOpen(false)}
                      aria-label="Close Notifications"
                    />

                    {/* Elevated Front Drawer at z-[9999] */}
                    <div
                      className="fixed right-4 sm:right-8 top-20 w-[94vw] sm:w-[440px] max-h-[85vh] border-2 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] z-[9999] p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                      style={{
                        backgroundColor: activeTheme.surface,
                        borderColor: activeTheme.accentBorder,
                        boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 25px ${activeTheme.glow}`,
                      }}
                    >
                      {/* Drawer Top Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border"
                            style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                          >
                            <i className="fa-solid fa-receipt"></i>
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-sm text-white">Recent Client Inquiries</h4>
                            <p className="text-[10px] text-white/50">Live incoming client briefs & orders</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-mono font-bold border"
                            style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                          >
                            {ordersList.length} Total
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-colors"
                            title="Close"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>

                      {/* Quick Filter Tabs inside Notification Drawer */}
                      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setNotificationTab('all')}
                          className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                            notificationTab === 'all'
                              ? 'text-white shadow'
                              : 'text-white/60 hover:text-white'
                          }`}
                          style={notificationTab === 'all' ? { backgroundColor: activeTheme.accent, boxShadow: `0 2px 8px ${activeTheme.glow}` } : {}}
                        >
                          All ({ordersList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotificationTab('urgent')}
                          className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                            notificationTab === 'urgent'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                              : 'text-white/60 hover:text-amber-300'
                          }`}
                        >
                          Urgent ({ordersList.filter((o) => !!o.isRushDelivery).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotificationTab('promo')}
                          className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                            notificationTab === 'promo'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                              : 'text-white/60 hover:text-emerald-300'
                          }`}
                        >
                          Discount ({ordersList.filter((o) => Boolean(o.promoCode) || (typeof o.discountPercent === 'number' && o.discountPercent > 0)).length})
                        </button>
                      </div>

                      {/* Notification Cards List */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-96 divide-y divide-white/5">
                        {ordersList.length === 0 ? (
                          <div className="py-10 text-center text-white/40 text-xs space-y-2">
                            <i className="fa-regular fa-bell-slash text-2xl text-white/20"></i>
                            <p>No incoming orders yet. Briefs submitted via the Contact Page will appear here immediately!</p>
                          </div>
                        ) : (
                          ordersList
                            .filter((ord) => {
                              if (notificationTab === 'urgent') return !!ord.isRushDelivery;
                              if (notificationTab === 'promo') return Boolean(ord.promoCode) || (typeof ord.discountPercent === 'number' && ord.discountPercent > 0);
                              return true;
                            })
                            .slice(0, 10)
                            .map((ord, oIdx) => (
                              <div
                                key={`notif-ord-${ord.id || oIdx}-${oIdx}`}
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setActiveTab('orders');
                                  setIsNotificationsOpen(false);
                                }}
                                className="pt-2.5 pb-2 hover:bg-white/5 rounded-xl px-2.5 cursor-pointer transition-colors space-y-1.5 border border-transparent hover:border-white/10 group"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-white truncate max-w-[170px] group-hover:text-[#38BDF8] transition-colors">
                                    {ord.customerName}
                                  </span>
                                  <span className="font-mono text-emerald-400 font-bold">
                                    ${ord.total.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-white/60">
                                  <span className="truncate max-w-[180px] text-white/80">
                                    {ord.service}
                                  </span>
                                  <span className="text-[10px] text-white/40">{ord.date}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {ord.isRushDelivery && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                      ⚡ URGENT (25% ADV)
                                    </span>
                                  )}
                                  {ord.promoCode && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      🏷️ PROMO {ord.promoCode} (-{ord.discountPercent || 25}%)
                                    </span>
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                    {ord.status}
                                  </span>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('orders');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full py-2.5 rounded-xl text-white text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                          style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                        >
                          <span>View Full Orders Pipeline</span>
                          <i className="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Add New Project / Service Button (Recolored with active theme) */}
                <button
                  data-btn-accent="true"
                  onClick={() => handleOpenAddProjectModal()}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
                  style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                  <span className="hidden sm:inline">Add Product</span>
                </button>

                {/* Close / Exit Admin Panel Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: activeTheme.card,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                  title="Exit Admin Panel"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                  <span className="hidden md:inline">Exit</span>
                </button>
              </div>
            </header>

            {/* Main Stage Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* =============================================================== */}
              {/* VIEW 1: DASHBOARD (EXACT SCREENSHOT REPLICA)                    */}
              {/* =============================================================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* ROW 1: 4 TOP METRIC CARDS WITH SPARKLINE WAVE CURVES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Sales */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Total Pipeline Value</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                        >
                          Live
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">{completedOrdersCount} Completed Jobs</span>
                      </div>

                      {/* Theme-Adaptive Sparkline Curve SVG */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="adminThemeSpark" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={activeTheme.accent} stopOpacity="0.45" />
                              <stop offset="100%" stopColor={activeTheme.accent} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,25 Q 25,5 50,18 T 100,8 L 100,30 L 0,30 Z" fill="url(#adminThemeSpark)" />
                          <path d="M 0,25 Q 25,5 50,18 T 100,8" fill="none" stroke={activeTheme.accent} strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 2: Total Orders */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Total Orders</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {processingOrdersCount} Active
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          {totalOrdersCount}
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold">{totalOrdersCount} Total Inquiries</span>
                      </div>

                      {/* Orange Sparkline Curve SVG */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="orangeWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,22 Q 25,28 50,12 T 100,15 L 100,30 L 0,30 Z" fill="url(#orangeWave)" />
                          <path d="M 0,22 Q 25,28 50,12 T 100,15" fill="none" stroke="#FB923C" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 3: Active Clients */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Clients & CRM</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Verified
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          {uniqueCustomers.length}
                        </div>
                        <span className="text-[11px] text-purple-400 font-semibold">Registered Clients</span>
                      </div>

                      {/* Purple Sparkline Curve SVG */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="purpleWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,20 Q 30,5 60,22 T 100,10 L 100,30 L 0,30 Z" fill="url(#purpleWave)" />
                          <path d="M 0,20 Q 30,5 60,22 T 100,10" fill="none" stroke="#C084FC" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 4: Average Order Value */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Avg Project Value</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Optimal
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          ${averageOrderValue}
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">Per Contract Brief</span>
                      </div>

                      {/* Green Sparkline Curve SVG */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="greenWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,26 Q 35,2 70,24 T 100,6 L 100,30 L 0,30 Z" fill="url(#greenWave)" />
                          <path d="M 0,26 Q 35,2 70,24 T 100,6" fill="none" stroke="#34D399" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: SALES OVERVIEW (GRAPH) & RECENT ACTIVITY FEED */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Sales Overview Graph & Traffic Breakdown (8 cols) */}
                    <div
                      className="lg:col-span-8 border rounded-2xl p-6 shadow-xl space-y-5 transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-display font-bold text-base text-white">Sales & Production Pipeline</h3>
                          <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                            <span>Live Production Trajectory</span>
                            <span>•</span>
                            <span className="text-white font-medium">Horizon Analytics</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTheme.accent }}></span>
                            <span className="text-white/70">Total Revenue</span>
                            <strong className="font-mono text-white" style={{ color: activeTheme.textAccent }}>
                              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]"></span>
                            <span className="text-white/70">Orders</span>
                            <strong className="text-white font-mono">{totalOrdersCount}</strong>
                          </div>
                        </div>
                      </div>

                      {/* SVG Multi-curve Graph (Themed Curve) */}
                      <div className="h-56 w-full relative pt-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={activeTheme.accent} stopOpacity="0.3" />
                              <stop offset="100%" stopColor={activeTheme.accent} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                          <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                          <line x1="0" y1="130" x2="600" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                          {/* Dynamic Active-Themed Wave Line with Area Fill */}
                          <path
                            d="M 0,140 Q 60,110 120,130 T 240,90 T 360,120 T 480,40 T 600,60 L 600,180 L 0,180 Z"
                            fill="url(#chartGradient)"
                          />
                          <path
                            d="M 0,140 Q 60,110 120,130 T 240,90 T 360,120 T 480,40 T 600,60"
                            fill="none"
                            stroke={activeTheme.accent}
                            strokeWidth="3"
                          />

                          {/* Orange Orders Line */}
                          <path
                            d="M 0,160 Q 60,140 120,120 T 240,140 T 360,80 T 480,100 T 600,110"
                            fill="none"
                            stroke="#FB923C"
                            strokeWidth="2"
                          />
                        </svg>

                        {/* X-axis date labels */}
                        <div className="flex justify-between text-[10px] text-white/40 font-mono mt-2 pt-1 border-t border-white/5">
                          <span>07</span>
                          <span>09</span>
                          <span>12</span>
                          <span>13</span>
                          <span>16</span>
                          <span>17</span>
                          <span>19</span>
                          <span>20</span>
                          <span>21</span>
                          <span>22</span>
                          <span>31</span>
                        </div>
                      </div>

                      {/* TRAFFIC SOURCES & PEAK VISITOR TIMES (Specific User Request) */}
                      <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Traffic by Social Platform (Real tracking) */}
                        <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                              Visitor Traffic Sources
                            </span>
                            <button
                              onClick={() => setActiveTab('marketing')}
                              className="text-[10px] text-[#38BDF8] hover:underline cursor-pointer"
                            >
                              Manage Links &rarr;
                            </button>
                          </div>
                          <div className="space-y-2 text-xs">
                            {/* TikTok */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white/70 flex items-center gap-1.5">
                                  <i className="fa-brands fa-tiktok text-pink-400"></i> TikTok Channel
                                </span>
                                <strong className="text-white font-mono">{trafficAnalytics.tiktok} Visits</strong>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-pink-500 h-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(8, (trafficAnalytics.tiktok / (Object.values(trafficAnalytics).reduce((a, b) => a + b, 0) || 1)) * 100))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Instagram */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white/70 flex items-center gap-1.5">
                                  <i className="fa-brands fa-instagram text-purple-400"></i> Instagram Reels
                                </span>
                                <strong className="text-white font-mono">{trafficAnalytics.instagram} Visits</strong>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-purple-500 h-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(8, (trafficAnalytics.instagram / (Object.values(trafficAnalytics).reduce((a, b) => a + b, 0) || 1)) * 100))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Facebook */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white/70 flex items-center gap-1.5">
                                  <i className="fa-brands fa-facebook text-blue-400"></i> Facebook Page
                                </span>
                                <strong className="text-white font-mono">{trafficAnalytics.facebook} Visits</strong>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(8, (trafficAnalytics.facebook / (Object.values(trafficAnalytics).reduce((a, b) => a + b, 0) || 1)) * 100))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* WhatsApp / Direct */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white/70 flex items-center gap-1.5">
                                  <i className="fa-brands fa-whatsapp text-emerald-400"></i> WhatsApp & Direct
                                </span>
                                <strong className="text-white font-mono">
                                  {(trafficAnalytics.whatsapp || 0) + (trafficAnalytics.direct || 0)} Visits
                                </strong>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[45%]"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Peak Traffic Times */}
                        <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 space-y-2">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                            Peak Active Visitor Times
                          </span>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                              <div className="font-bold">🔥 8:00 PM – 11:30 PM (Peak Surge)</div>
                              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                                Live concurrent active views from US, UK & Gulf clients reviewing your portfolios.
                              </p>
                            </div>
                            <div className="text-[11px] text-white/60 pt-1 space-y-1">
                              <div>Average Brief Submission Time: <strong className="text-white">Under 2 mins</strong></div>
                              <div>Active Pipeline Health: <strong className="text-emerald-400">100% Operational</strong></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Recent Activity Feed (Dynamic real orders!) */}
                    <div
                      className="lg:col-span-4 border rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-bold text-base text-white">Recent Activity</h3>
                          {ordersList.length > 0 && (
                            <span className="text-[10px] text-white/40 font-mono">
                              {ordersList.length} Total
                            </span>
                          )}
                        </div>

                        {ordersList.length === 0 ? (
                          <div className="py-12 text-center text-white/40 space-y-2">
                            <i className="fa-solid fa-inbox text-3xl opacity-30 block mb-2"></i>
                            <div className="font-semibold text-white/70 text-xs">No client orders yet</div>
                            <p className="text-[11px] text-white/40 leading-relaxed max-w-[240px] mx-auto">
                              Client inquiries submitted through your website contact form will appear here in real time.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {ordersList.slice(0, 5).map((order, oIdx) => (
                              <div
                                key={`dash-ord-${order.id || oIdx}-${oIdx}`}
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                              >
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono"
                                  style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent }}
                                >
                                  {order.customerName.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white truncate transition-colors">
                                      {order.orderNumber} • {order.customerName}
                                    </h4>
                                    <span className="text-xs font-bold font-mono text-emerald-400">
                                      ${order.total.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-white/50 truncate">{order.service}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-white/40">{order.date}</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                        order.status === 'Order Complete'
                                          ? 'text-emerald-400 bg-emerald-500/10'
                                          : 'text-amber-400 bg-amber-500/10'
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveTab('orders')}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer text-center shadow-md"
                        style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder, borderWidth: 1 }}
                      >
                        View All Order Activities &rarr;
                      </button>
                    </div>
                  </div>

                  {/* ROW 3: ORDER MANAGEMENT TABLE (MATCHING SCREENSHOT TABLE EXACTLY) */}
                  <div
                    className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-white">Order Management</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs hover:underline font-semibold cursor-pointer"
                        style={{ color: activeTheme.textAccent }}
                      >
                        {ordersList.length} Order all
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Order ID</th>
                            <th className="pb-3 font-semibold">Customer</th>
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Total</th>
                            <th className="pb-3 font-semibold">Payment</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ordersList.slice(0, 5).map((order, oIdx) => (
                            <tr key={`recent-ord-row-${order.id || oIdx}-${oIdx}`} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 font-bold font-mono text-white">{order.orderNumber}</td>
                              <td className="py-3.5 font-medium text-white">{order.customerName}</td>
                              <td className="py-3.5 text-white/50">{order.date}</td>
                              <td className="py-3.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                    order.status === 'Shipped' || order.status === 'Order Complete'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : order.status === 'Processing'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 font-bold font-mono text-white">${order.total.toFixed(2)}</td>
                              <td className="py-3.5 text-white/70">{order.payment}</td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                                >
                                  View/Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ROW 4: TOP SELLING PRODUCTS / SERVICES (MATCHING SCREENSHOT) */}
                  <div
                    className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-white">Top Selling Products</h3>
                      <button
                        onClick={() => setActiveTab('services')}
                        className="text-xs hover:underline font-semibold cursor-pointer"
                        style={{ color: activeTheme.textAccent }}
                      >
                        View all
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Product Name</th>
                            <th className="pb-3 font-semibold">Category</th>
                            <th className="pb-3 font-semibold">Price</th>
                            <th className="pb-3 font-semibold">Stock / Slots</th>
                            <th className="pb-3 font-semibold text-right">Sales</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {/* Item 1 */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                                <i className="fa-solid fa-headphones text-sm"></i>
                              </div>
                              <span className="font-bold text-white">Zenith Noise-Canceling Video Production</span>
                            </td>
                            <td className="py-3 text-white/50">Post-Production</td>
                            <td className="py-3 font-mono font-bold text-white">$249.00</td>
                            <td className="py-3 text-emerald-400 font-mono">65 left</td>
                            <td className="py-3 font-mono text-right text-white">987</td>
                          </tr>

                          {/* Item 2 */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                                <i className="fa-solid fa-keyboard text-sm"></i>
                              </div>
                              <span className="font-bold text-white">Nova High-CTR Thumbnail & Identity Kit</span>
                            </td>
                            <td className="py-3 text-white/50">Graphic Design</td>
                            <td className="py-3 font-mono font-bold text-white">$99.00</td>
                            <td className="py-3 text-emerald-400 font-mono">102 left</td>
                            <td className="py-3 font-mono text-right text-white">645</td>
                          </tr>

                          {/* Item 3 */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                                <i className="fa-solid fa-clock text-sm"></i>
                              </div>
                              <span className="font-bold text-white">Aura UGC & 3D Direct Response Ad Package</span>
                            </td>
                            <td className="py-3 text-white/50">UGC & CGI</td>
                            <td className="py-3 font-mono font-bold text-white">$199.00</td>
                            <td className="py-3 text-emerald-400 font-mono">48 left</td>
                            <td className="py-3 font-mono text-right text-white">521</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 2: SALES ANALYTICS (MONTHLY BREAKDOWN & CONVERSION)        */}
              {/* =============================================================== */}
              {activeTab === 'sales' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-white">Sales & Revenue Analytics</h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Historical sales peaks, high-performing months, and division revenue distribution.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      Net Growth: +34.8% YoY
                    </span>
                  </div>

                  {/* 4 TOP SERVICE SALES METRIC CARDS (MATCHING DASHBOARD STYLE WITH SPARKLINE CURVES) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Gross Sales Pipeline */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Gross Sales Pipeline</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                        >
                          Total Value
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: activeTheme.textAccent }}>
                          {totalOrdersCount} Client Inquiries / Orders
                        </span>
                      </div>

                      {/* Sparkline curve */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="salesAccentWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={activeTheme.accent} stopOpacity="0.45" />
                              <stop offset="100%" stopColor={activeTheme.accent} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,25 Q 25,5 50,18 T 100,8 L 100,30 L 0,30 Z" fill="url(#salesAccentWave)" />
                          <path d="M 0,25 Q 25,5 50,18 T 100,8" fill="none" stroke={activeTheme.accent} strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 2: Settled / Paid Revenue */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Paid / Settled Contracts</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Delivered
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight text-emerald-400">
                          ${(ordersList.filter(o => o.status === 'Order Complete' || o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">{completedOrdersCount} Closed & Delivered Jobs</span>
                      </div>

                      {/* Sparkline curve */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="salesGreenWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,20 Q 30,28 60,10 T 100,5 L 100,30 L 0,30 Z" fill="url(#salesGreenWave)" />
                          <path d="M 0,20 Q 30,28 60,10 T 100,5" fill="none" stroke="#10B981" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 3: Average Order Ticket (AOV) */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Average Project Ticket (AOV)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Per Contract
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          ${averageOrderValue}
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold">Average Value per Brief</span>
                      </div>

                      {/* Sparkline curve */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="salesAmberWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,22 Q 25,28 50,12 T 100,15 L 100,30 L 0,30 Z" fill="url(#salesAmberWave)" />
                          <path d="M 0,22 Q 25,28 50,12 T 100,15" fill="none" stroke="#FB923C" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 4: Top Grossing Service Division */}
                    <div
                      className="border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-lg transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-medium">Top Service Division</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Highest ROI
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          Video Editing
                        </div>
                        <span className="text-[11px] text-purple-400 font-semibold">42% ($52,700) Revenue Share</span>
                      </div>

                      {/* Sparkline curve */}
                      <div className="h-10 mt-3 -mx-2 -mb-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="salesPurpleWave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,20 Q 30,5 60,22 T 100,10 L 100,30 L 0,30 Z" fill="url(#salesPurpleWave)" />
                          <path d="M 0,20 Q 30,5 60,22 T 100,10" fill="none" stroke="#C084FC" strokeWidth="2.5" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Sales Breakdown (Revenue Trend Analytics) */}
                  <div
                    className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    <h3 className="font-display font-bold text-sm text-white">
                      Monthly Revenue Trend (Jan – Dec 2026)
                    </h3>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 h-44 items-end pt-4 border-b border-white/5">
                      {[
                        { m: 'Jan', val: 40, amt: '$9.2k' },
                        { m: 'Feb', val: 55, amt: '$12.4k' },
                        { m: 'Mar', val: 65, amt: '$15.1k' },
                        { m: 'Apr', val: 50, amt: '$11.8k' },
                        { m: 'May', val: 70, amt: '$16.9k' },
                        { m: 'Jun', val: 80, amt: '$19.2k' },
                        { m: 'Jul', val: 68, amt: '$15.8k' },
                        { m: 'Aug', val: 92, amt: '$24.5k', peak: true },
                        { m: 'Sep', val: 78, amt: '$18.4k' },
                        { m: 'Oct', val: 96, amt: '$28.2k', peak: true },
                        { m: 'Nov', val: 85, amt: '$21.0k' },
                        { m: 'Dec', val: 98, amt: '$31.5k', peak: true },
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[9px] font-mono text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            {bar.amt}
                          </span>
                          <div
                            style={{
                              height: `${bar.val}%`,
                              ...(bar.peak
                                ? {
                                    background: `linear-gradient(to top, ${activeTheme.accent}, ${activeTheme.textAccent})`,
                                    boxShadow: `0 4px 12px ${activeTheme.glow}`,
                                  }
                                : {}),
                            }}
                            className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                              bar.peak ? '' : 'bg-white/20 group-hover:bg-white/40'
                            }`}
                          ></div>
                          <span className="text-[10px] font-mono text-white/50">{bar.m}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="p-3 rounded-xl text-xs border"
                      style={{ backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.textAccent }}
                    >
                      <strong>Peak Months Summary:</strong> October & December witnessed the highest client order volumes ($28.2k & $31.5k), driven by holiday Q4 e-commerce ad pushes and brand re-designs.
                    </div>
                  </div>

                  {/* Revenue Distribution by Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="border rounded-2xl p-6 shadow-xl space-y-3 transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <h4 className="font-display font-bold text-sm text-white">Revenue by Service Division</h4>
                      <div className="space-y-3 pt-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Video Editing & Retention Cuts</span>
                            <strong className="text-white font-mono">42% ($52,700)</strong>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="h-full w-[42%]" style={{ backgroundColor: activeTheme.accent }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Graphic Design & Brand Systems</span>
                            <strong className="text-white font-mono">28% ($35,100)</strong>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full w-[28%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>UGC & 3D CGI Commercials</span>
                            <strong className="text-white font-mono">18% ($22,500)</strong>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full w-[18%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>AI Video & Prompt Architecture</span>
                            <strong className="text-white font-mono">12% ($15,180)</strong>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-400 h-full w-[12%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <h4 className="font-display font-bold text-sm text-white">Conversion & Inquiries Funnel</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                          <span className="text-white/60">Portfolio Visitors (Monthly)</span>
                          <strong className="text-white font-mono">18,420</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                          <span className="text-white/60">Contact Form Submissions</span>
                          <strong className="font-mono" style={{ color: activeTheme.textAccent }}>612 (3.3%)</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                          <span className="text-white/60">Approved & Paid Client Contracts</span>
                          <strong className="text-emerald-400 font-mono">214 (34.9% close rate)</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 3: ORDER MANAGEMENT (DEDICATED FULL TRACKER)               */}
              {/* =============================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-white">Order Management Pipeline</h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Manage submitted client briefs, approve processing contracts, and mark completed jobs.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreateOrderModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                      <span>Create Custom Order</span>
                    </button>
                  </div>

                  {/* Orders Filter Navigation Tabs (Full Theme Recoloring) */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border rounded-2xl p-2.5 shadow-md transition-colors"
                    style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
                  >
                    <div className="flex items-center gap-2">
                      {/* 1. All Orders */}
                      <button
                        type="button"
                        onClick={() => setOrderFilterTab('all')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          orderFilterTab === 'all' ? 'text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                        style={orderFilterTab === 'all' ? { backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` } : {}}
                      >
                        <i className="fa-solid fa-list-check text-xs"></i>
                        <span>All Orders</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                          {ordersList.length}
                        </span>
                      </button>

                      {/* 2. Simple Orders (Normal) */}
                      <button
                        type="button"
                        onClick={() => setOrderFilterTab('normal')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          orderFilterTab === 'normal' ? 'border shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                        style={orderFilterTab === 'normal' ? { backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder } : {}}
                      >
                        <i className="fa-regular fa-clock text-xs" style={{ color: activeTheme.textAccent }}></i>
                        <span>Simple Orders</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white/80 text-[10px] font-mono">
                          {ordersList.filter((o) => !o.isRushDelivery).length}
                        </span>
                      </button>

                      {/* 3. Urgent Orders (25% Advance) */}
                      <button
                        type="button"
                        onClick={() => setOrderFilterTab('urgent')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          orderFilterTab === 'urgent'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                            : 'text-white/60 hover:text-amber-300 hover:bg-amber-500/10'
                        }`}
                      >
                        <i className="fa-solid fa-bolt text-amber-400 text-xs"></i>
                        <span>Urgent Orders</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono font-black">
                          {ordersList.filter((o) => !!o.isRushDelivery).length}
                        </span>
                      </button>

                      {/* 4. Discount Orders Tab (Always Visible) */}
                      <button
                        type="button"
                        onClick={() => setOrderFilterTab('discounted')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          orderFilterTab === 'discounted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                            : 'text-white/60 hover:text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                      >
                        <i className="fa-solid fa-tag text-emerald-400 text-xs"></i>
                        <span>Discount Orders</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold">
                          {ordersList.filter((o) => Boolean(o.promoCode) || (typeof o.discountPercent === 'number' && o.discountPercent > 0)).length}
                        </span>
                      </button>
                    </div>

                    <div className="text-[11px] text-white/50 font-medium">
                      Showing {filteredOrders.length} of {ordersList.length} orders
                    </div>
                  </div>

                  {/* Orders Table Container (Full Theme Colors) */}
                  <div
                    className="border rounded-2xl p-6 shadow-xl transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    {filteredOrders.length === 0 ? (
                      <div className="py-16 text-center text-white/50 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-2xl text-white/40">
                          <i className="fa-solid fa-receipt"></i>
                        </div>
                        <div className="font-display font-bold text-base text-white">
                          {orderFilterTab === 'urgent'
                            ? 'No Urgent Orders Found'
                            : orderFilterTab === 'discounted'
                            ? 'No Discount Orders Found'
                            : orderFilterTab === 'normal'
                            ? 'No Simple Orders Found'
                            : 'No Client Orders Yet'}
                        </div>
                        <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                          {orderFilterTab === 'urgent'
                            ? 'No clients have placed express rush delivery orders yet. Urgent inquiries will automatically show up here with 25% advance requirements.'
                            : orderFilterTab === 'discounted'
                            ? 'No client orders found with promo codes or discounts applied. Orders placed with an active promo code during checkout will appear here.'
                            : 'Your order pipeline is ready! Briefs submitted through your website contact form or WhatsApp will appear here with live client data.'}
                        </p>
                        <button
                          onClick={() => setIsCreateOrderModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
                          style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                          <span>+ Create Custom Order</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                              <th className="pb-3 font-semibold">Order #</th>
                              <th className="pb-3 font-semibold">Customer</th>
                              <th className="pb-3 font-semibold">Contact / Phone</th>
                              <th className="pb-3 font-semibold">Service & Type</th>
                              <th className="pb-3 font-semibold">Date</th>
                              <th className="pb-3 font-semibold">Status (Change Live)</th>
                              <th className="pb-3 font-semibold">Total</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredOrders.map((order, oIdx) => {
                              const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                              return (
                                <tr key={`mgmt-ord-row-${order.id || oIdx}-${oIdx}`} className="hover:bg-white/5 transition-colors">
                                  <td className="py-3.5 font-bold font-mono text-white">
                                    <div className="flex items-center gap-1.5">
                                      <span>{order.orderNumber}</span>
                                      {order.isRushDelivery && (
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Urgent Order"></span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 font-medium text-white">
                                    <div>{order.customerName}</div>
                                    {order.description && (
                                      <p className="text-[10px] text-white/40 truncate max-w-[180px]" title={order.description}>
                                        {order.description}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-3.5 text-white/70 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span>{order.phone || order.email}</span>
                                      {cleanPhone && (
                                        <a
                                          href={`https://wa.me/${cleanPhone}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-400 hover:text-emerald-300"
                                          title="Chat on WhatsApp"
                                        >
                                          <i className="fa-brands fa-whatsapp"></i>
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-white">
                                    <div className="font-semibold">{order.service}</div>
                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                      {order.isRushDelivery ? (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                          <i className="fa-solid fa-bolt text-[8px]"></i>
                                          <span>URGENT (25% ADV: ${(order.advancePaymentRequired || order.total * 0.25).toFixed(2)})</span>
                                        </span>
                                      ) : (
                                        <span
                                          className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
                                          style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                        >
                                          Simple Order
                                        </span>
                                      )}
                                      {order.promoCode && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                          🏷️ {order.promoCode} (-{order.discountPercent}%)
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-white/50">{order.date}</td>
                                  <td className="py-3.5">
                                    {/* Live Status Selector */}
                                    <select
                                      value={order.status}
                                      onChange={(e) =>
                                        handleUpdateOrderStatus(order.id, e.target.value as ClientOrder['status'])
                                      }
                                      className="border rounded-lg px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
                                      style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
                                    >
                                      <option value="Processing">🟡 Processing</option>
                                      <option value="Pending">🔵 Pending</option>
                                      <option value="Delivered">🟣 Delivered</option>
                                      <option value="Order Complete">🟢 Order Complete</option>
                                    </select>
                                  </td>
                                  <td className="py-3.5 font-bold font-mono text-emerald-400">
                                    ${order.total.toFixed(2)}
                                  </td>
                                  <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="px-2.5 py-1 rounded-lg border font-semibold cursor-pointer text-xs transition-colors"
                                      style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                    >
                                      View Details
                                    </button>
                                    {order.status !== 'Order Complete' && (
                                      <button
                                        onClick={() => handleMarkOrderComplete(order)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold cursor-pointer text-xs"
                                        title="Mark as Order Complete"
                                      >
                                        <i className="fa-solid fa-check mr-1"></i>
                                        Complete
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center justify-center cursor-pointer text-xs"
                                      title="Delete Order"
                                    >
                                      <i className="fa-regular fa-trash-can"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 4: SERVICES (CLICKABLE CARDS & DEDICATED MANAGEMENT PAGE)  */}
              {/* =============================================================== */}
              {activeTab === 'services' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {selectedServiceId === null ? (
                    /* ------------------------------------------------------------- */
                    /* MAIN SERVICES LIST VIEW: 6 INTERACTIVE CLICKABLE SERVICE CARDS */
                    /* ------------------------------------------------------------- */
                    <div className="space-y-6 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div>
                          <h2 className="font-display font-bold text-2xl text-white">Creative Services Catalog</h2>
                          <p className="text-xs text-white/50 mt-0.5">
                            Click any of the 6 service cards to open its dedicated project manager, edit details, or manage recent projects.
                          </p>
                        </div>

                        <button
                          onClick={() => handleOpenAddProjectModal()}
                          className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                          <span>+ Add New Project</span>
                        </button>
                      </div>

                      {/* 6 Core Interactive Clickable Services Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                          {
                            id: 'video-editing',
                            name: 'Video Editing',
                            category: 'Post-Production',
                            icon: 'fa-film',
                            price: '$199 - $850',
                            description: 'Short-form Reels, documentary YouTube cuts, retention pacing, and audio finishing.',
                            subList: SERVICE_SUB_CATEGORIES['video-editing'] || [],
                          },
                          {
                            id: 'graphic-designing',
                            name: 'Graphic Designing',
                            category: 'Brand Systems',
                            icon: 'fa-palette',
                            price: '$99 - $499',
                            description: 'Vector brand identities, high-CTR YouTube thumbnails, presentation decks, and logos.',
                            subList: SERVICE_SUB_CATEGORIES['graphic-designing'] || [],
                          },
                          {
                            id: 'ugc-cgi',
                            name: 'UGC & CGI Ads',
                            category: 'Paid Acquisition',
                            icon: 'fa-cubes',
                            price: '$249 - $990',
                            description: 'High-converting TikTok/Meta hooks, 3D product simulation spots, and direct-response creatives.',
                            subList: SERVICE_SUB_CATEGORIES['ugc-cgi'] || [],
                          },
                          {
                            id: 'web-development',
                            name: 'Web Development',
                            category: 'Code & Systems',
                            icon: 'fa-code',
                            price: '$450 - $1,800',
                            description: 'Custom React & Vite websites, AI-powered business portfolios, and high-converting landing pages.',
                            subList: SERVICE_SUB_CATEGORIES['web-development'] || [],
                          },
                          {
                            id: 'ai-video',
                            name: 'AI Video Editing',
                            category: 'Generative Media',
                            icon: 'fa-wand-magic-sparkles',
                            price: '$150 - $600',
                            description: 'AI-assisted video cuts, generative B-roll, character motion, and clean upscale pipelines.',
                            subList: SERVICE_SUB_CATEGORIES['ai-video'] || [],
                          },
                          {
                            id: 'prompt-engineering',
                            name: 'Prompt Engineering',
                            category: 'Workflow Automation',
                            icon: 'fa-terminal',
                            price: '$120 - $450',
                            description: 'Custom prompt engines for Midjourney, Stable Diffusion, and consistent brand libraries.',
                            subList: SERVICE_SUB_CATEGORIES['prompt-engineering'] || [],
                          },
                        ].map((service) => {
                          const serviceProjects = allProjects.filter((p) => p.category === service.id);
                          const count = serviceProjects.length;
                          const recentCount = serviceProjects.filter((p) => recentProjectIds.includes(p.id)).length;

                          return (
                            <div
                              key={service.id}
                              onClick={() => {
                                setSelectedServiceId(service.id);
                                setServiceProjectSearch('');
                                setServiceProjectFilter('all');
                              }}
                              role="button"
                              tabIndex={0}
                              className="border rounded-2xl p-5 shadow-xl flex flex-col justify-between group hover:scale-[1.015] transition-all cursor-pointer relative"
                              style={{
                                backgroundColor: activeTheme.card,
                                borderColor: activeTheme.border,
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform border"
                                    style={{
                                      backgroundColor: activeTheme.accentBg,
                                      color: activeTheme.textAccent,
                                      borderColor: activeTheme.accentBorder,
                                    }}
                                  >
                                    <i className={`fa-solid ${service.icon}`}></i>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {recentCount > 0 && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                        <i className="fa-solid fa-star text-[8px]"></i>
                                        <span>{recentCount} Recent</span>
                                      </span>
                                    )}
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80">
                                      {count} {count === 1 ? 'Project' : 'Projects'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-display font-bold text-base text-white transition-colors">
                                    {service.name}
                                  </h3>
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                                    {service.category}
                                  </span>
                                </div>

                                <div className="text-xs font-semibold mb-2" style={{ color: activeTheme.textAccent }}>
                                  {service.price}
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed mb-4">{service.description}</p>

                                {/* Sub categories */}
                                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                                  {service.subList.slice(0, 4).map((sub, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-white/70 border border-white/5"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServiceId(service.id);
                                    setServiceProjectSearch('');
                                    setServiceProjectFilter('all');
                                  }}
                                  className="flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border"
                                  style={{
                                    backgroundColor: activeTheme.accentBg,
                                    color: activeTheme.textAccent,
                                    borderColor: activeTheme.accentBorder,
                                  }}
                                >
                                  <span>Manage Service & Projects</span>
                                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddProjectModal(service.id);
                                  }}
                                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-colors"
                                  title={`Add project to ${service.name}`}
                                >
                                  <i className="fa-solid fa-plus"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* ------------------------------------------------------------- */
                    /* DEDICATED SERVICE DETAILS & MANAGEMENT PAGE                   */
                    /* ------------------------------------------------------------- */
                    (() => {
                      const serviceConfigList = [
                        {
                          id: 'video-editing',
                          name: 'Video Editing',
                          category: 'Post-Production',
                          icon: 'fa-film',
                          price: '$199 - $850',
                          description: 'Short-form Reels, documentary YouTube cuts, retention pacing, and audio finishing.',
                          subList: SERVICE_SUB_CATEGORIES['video-editing'] || [],
                        },
                        {
                          id: 'graphic-designing',
                          name: 'Graphic Designing',
                          category: 'Brand Systems',
                          icon: 'fa-palette',
                          price: '$99 - $499',
                          description: 'Vector brand identities, high-CTR YouTube thumbnails, presentation decks, and logos.',
                          subList: SERVICE_SUB_CATEGORIES['graphic-designing'] || [],
                        },
                        {
                          id: 'ugc-cgi',
                          name: 'UGC & CGI Ads',
                          category: 'Paid Acquisition',
                          icon: 'fa-cubes',
                          price: '$249 - $990',
                          description: 'High-converting TikTok/Meta hooks, 3D product simulation spots, and direct-response creatives.',
                          subList: SERVICE_SUB_CATEGORIES['ugc-cgi'] || [],
                        },
                        {
                          id: 'web-development',
                          name: 'Web Development',
                          category: 'Code & Systems',
                          icon: 'fa-code',
                          price: '$450 - $1,800',
                          description: 'Custom React & Vite websites, AI-powered business portfolios, and high-converting landing pages.',
                          subList: SERVICE_SUB_CATEGORIES['web-development'] || [],
                        },
                        {
                          id: 'ai-video',
                          name: 'AI Video Editing',
                          category: 'Generative Media',
                          icon: 'fa-wand-magic-sparkles',
                          price: '$150 - $600',
                          description: 'AI-assisted video cuts, generative B-roll, character motion, and clean upscale pipelines.',
                          subList: SERVICE_SUB_CATEGORIES['ai-video'] || [],
                        },
                        {
                          id: 'prompt-engineering',
                          name: 'Prompt Engineering',
                          category: 'Workflow Automation',
                          icon: 'fa-terminal',
                          price: '$120 - $450',
                          description: 'Custom prompt engines for Midjourney, Stable Diffusion, and consistent brand libraries.',
                          subList: SERVICE_SUB_CATEGORIES['prompt-engineering'] || [],
                        },
                      ];

                      const currentService =
                        serviceConfigList.find((s) => s.id === selectedServiceId) || serviceConfigList[0];
                      const rawServiceProjects = allProjects.filter((p) => p.category === currentService.id);

                      const filteredServiceProjects = rawServiceProjects.filter((p) => {
                        if (serviceProjectFilter === 'recent' && !recentProjectIds.includes(p.id)) {
                          return false;
                        }
                        if (serviceProjectSearch.trim()) {
                          const query = serviceProjectSearch.toLowerCase().trim();
                          const titleMatch = (p.title || '').toLowerCase().includes(query);
                          const subMatch = (p.subCategory || '').toLowerCase().includes(query);
                          const descMatch = (p.description || '').toLowerCase().includes(query);
                          const toolsMatch = Array.isArray(p.tools) && p.tools.some((t) => t.toLowerCase().includes(query));
                          return titleMatch || subMatch || descMatch || toolsMatch;
                        }
                        return true;
                      });

                      const recentServiceProjects = rawServiceProjects.filter((p) => recentProjectIds.includes(p.id));

                      return (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                          {/* Top Navigation Control: Smooth Back Button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedServiceId(null)}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md hover:-translate-x-1"
                              >
                                <i className="fa-solid fa-arrow-left text-xs"></i>
                                <span>Back to Services Catalog</span>
                              </button>

                              <span className="text-white/30 hidden sm:inline">/</span>

                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-lg text-white">
                                  {currentService.name}
                                </span>
                                <span
                                  className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold"
                                  style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                >
                                  {rawServiceProjects.length} Projects
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenAddProjectModal(currentService.id)}
                              className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                              style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                            >
                              <i className="fa-solid fa-plus text-xs"></i>
                              <span>+ Add Project to {currentService.name}</span>
                            </button>
                          </div>

                          {/* Service Details Hero Banner (Theme Adapted) */}
                          <div
                            className="border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors"
                            style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                          >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                              <div className="flex items-start gap-4">
                                <div
                                  className="w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-lg"
                                  style={{
                                    backgroundColor: activeTheme.accentBg,
                                    color: activeTheme.textAccent,
                                    borderColor: activeTheme.accentBorder,
                                    boxShadow: `0 4px 14px ${activeTheme.glow}`,
                                  }}
                                >
                                  <i className={`fa-solid ${currentService.icon}`}></i>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-display font-bold text-xl text-white">
                                      {currentService.name} Management
                                    </h3>
                                    <span
                                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
                                      style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                    >
                                      {currentService.category}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-white/10 font-bold">
                                      {currentService.price}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
                                    {currentService.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 pt-2">
                                    {currentService.subList.map((sub, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/40 text-white/70 border border-white/10 font-mono"
                                      >
                                        ✓ {sub}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Service Quick Metrics */}
                              <div className="flex items-center gap-3 shrink-0 bg-black/40 p-3 rounded-xl border border-white/10">
                                <div className="text-center px-3 border-r border-white/10">
                                  <div className="font-mono font-bold text-lg text-white">
                                    {rawServiceProjects.length}
                                  </div>
                                  <div className="text-[10px] text-white/50 uppercase">Total Items</div>
                                </div>
                                <div className="text-center px-3 border-r border-white/10">
                                  <div className="font-mono font-bold text-lg text-amber-300">
                                    {recentServiceProjects.length}
                                  </div>
                                  <div className="text-[10px] text-white/50 uppercase">Recent Items</div>
                                </div>
                                <div className="text-center px-3">
                                  <div className="font-mono font-bold text-lg text-emerald-400">
                                    Active
                                  </div>
                                  <div className="text-[10px] text-white/50 uppercase">Status</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Filter & Search Bar for this Specific Service */}
                          <div
                            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border rounded-2xl p-3 shadow-md transition-colors"
                            style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setServiceProjectFilter('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  serviceProjectFilter === 'all'
                                    ? 'text-white shadow'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                                style={serviceProjectFilter === 'all' ? { backgroundColor: activeTheme.accent, boxShadow: `0 2px 8px ${activeTheme.glow}` } : {}}
                              >
                                <i className="fa-solid fa-layer-group text-xs"></i>
                                <span>All Existing Projects ({rawServiceProjects.length})</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setServiceProjectFilter('recent')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  serviceProjectFilter === 'recent'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                                    : 'text-white/60 hover:text-amber-300 hover:bg-amber-500/10'
                                }`}
                              >
                                <i className="fa-solid fa-star text-xs text-amber-400"></i>
                                <span>Recent Projects ({recentServiceProjects.length})</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
                              <div className="relative flex-1 sm:w-64">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40"></i>
                                <input
                                  type="text"
                                  value={serviceProjectSearch}
                                  onChange={(e) => setServiceProjectSearch(e.target.value)}
                                  placeholder={`Filter ${currentService.name} projects...`}
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none"
                                  style={{ borderColor: activeTheme.border }}
                                />
                              </div>

                              {/* Visible "+" Button in Project Management Toolbar */}
                              <button
                                type="button"
                                onClick={() => handleOpenAddProjectModal(currentService.id)}
                                className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 transition-all hover:scale-105"
                                style={{ backgroundColor: activeTheme.accent, boxShadow: `0 2px 10px ${activeTheme.glow}` }}
                                title={`+ Add new project directly to ${currentService.name}`}
                              >
                                <i className="fa-solid fa-plus text-xs"></i>
                                <span>Add Project</span>
                              </button>
                            </div>
                          </div>

                          {/* Projects List with Full CRUD: Edit, Delete, Recent Pin */}
                          {filteredServiceProjects.length === 0 ? (
                            <div
                              className="border rounded-2xl p-12 text-center space-y-3 transition-colors"
                              style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                            >
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-xl text-white/40">
                                <i className="fa-regular fa-folder-open"></i>
                              </div>
                              <h4 className="font-display font-bold text-base text-white">
                                {serviceProjectFilter === 'recent'
                                  ? 'No Recent Projects Pinned in this Service'
                                  : `No Projects Found for ${currentService.name}`}
                              </h4>
                              <p className="text-xs text-white/50 max-w-md mx-auto">
                                {serviceProjectFilter === 'recent'
                                  ? 'Click the star icon on any project below to highlight it in your Recent Projects showcase.'
                                  : 'Add your first creative deliverable, video edit, or case study to display on your live portfolio.'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenAddProjectModal(currentService.id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-lg hover:scale-105 transition-all"
                                style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                              >
                                <i className="fa-solid fa-plus text-xs"></i>
                                <span>+ Add Project to {currentService.name}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {/* Visible "+" Add New Project Card in Project Grid */}
                              <button
                                type="button"
                                onClick={() => handleOpenAddProjectModal(currentService.id)}
                                className="border-2 border-dashed rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center gap-4 transition-all group cursor-pointer min-h-[300px]"
                                style={{
                                  backgroundColor: activeTheme.card,
                                  borderColor: activeTheme.accentBorder,
                                }}
                                title={`Click to add new project directly under ${currentService.name}`}
                              >
                                <div
                                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 shadow-lg border"
                                  style={{
                                    backgroundColor: activeTheme.accentBg,
                                    color: activeTheme.textAccent,
                                    borderColor: activeTheme.accentBorder,
                                    boxShadow: `0 4px 14px ${activeTheme.glow}`,
                                  }}
                                >
                                  <i className="fa-solid fa-plus"></i>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-display font-bold text-base text-white transition-colors flex items-center justify-center gap-1.5">
                                    <span>+ Add New Project</span>
                                  </h4>
                                  <p className="text-xs text-white/50 max-w-[220px]">
                                    Upload or add a creative deliverable under <strong>{currentService.name}</strong>
                                  </p>
                                </div>
                                <span
                                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors"
                                  style={{
                                    backgroundColor: activeTheme.accentBg,
                                    color: activeTheme.textAccent,
                                    borderColor: activeTheme.accentBorder,
                                  }}
                                >
                                  + New {currentService.name} Item
                                </span>
                              </button>
                              {filteredServiceProjects.map((p, pIdx) => {
                                const cover = p.customImage || (p.images && p.images[0]) || '';
                                const isRecent = recentProjectIds.includes(p.id);

                                return (
                                  <div
                                    key={`srv-proj-detail-${p.id || pIdx}-${pIdx}`}
                                    className="border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                                    style={{
                                      backgroundColor: activeTheme.card,
                                      borderColor: isRecent ? '#F59E0B' : activeTheme.border,
                                    }}
                                  >
                                    <div>
                                      {/* Project Cover Media */}
                                      <div className="relative aspect-video bg-black/60 overflow-hidden border-b border-white/10">
                                        {cover ? (
                                          <img
                                            src={cover}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-2xl gap-1">
                                            <i className={`fa-solid ${currentService.icon}`}></i>
                                            <span className="text-[10px] font-mono text-white/40">Portfolio Item</span>
                                          </div>
                                        )}

                                        {/* Badges on Media */}
                                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                          {p.subCategory && (
                                            <span
                                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/15"
                                              style={{ color: activeTheme.textAccent }}
                                            >
                                              {p.subCategory}
                                            </span>
                                          )}
                                          {p.videoUrl && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-600/80 backdrop-blur-md text-white border border-red-500/40 flex items-center gap-1">
                                              <i className="fa-solid fa-play text-[8px]"></i>
                                              <span>Video</span>
                                            </span>
                                          )}
                                        </div>

                                        {/* Recent Pin Star on media */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleProjectRecent(p.id)}
                                          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg backdrop-blur-md flex items-center justify-center text-xs transition-colors cursor-pointer border ${
                                            isRecent
                                              ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                              : 'bg-black/60 hover:bg-black/80 text-white/60 hover:text-amber-300 border-white/20'
                                          }`}
                                          title={isRecent ? 'Unpin from Recent Projects' : 'Mark as Recent Project'}
                                        >
                                          <i className="fa-solid fa-star"></i>
                                        </button>
                                      </div>

                                      {/* Project Info Details */}
                                      <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                                            {p.title}
                                          </h4>
                                          {isRecent && (
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                              RECENT
                                            </span>
                                          )}
                                        </div>

                                        {p.subtitle && (
                                          <p className="text-[11px] line-clamp-1" style={{ color: activeTheme.textAccent }}>
                                            {p.subtitle}
                                          </p>
                                        )}

                                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                                          {p.description || 'Professional deliverable showcasing high production value.'}
                                        </p>

                                        {/* Tools Used Chips */}
                                        {Array.isArray(p.tools) && p.tools.length > 0 && (
                                          <div className="flex flex-wrap gap-1 pt-1">
                                            {p.tools.slice(0, 3).map((tool, tIdx) => (
                                              <span
                                                key={tIdx}
                                                className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/5 font-mono"
                                              >
                                                {tool}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Bar with Full CRUD (Edit, Delete, Pin) */}
                                    <div className="p-3 bg-black/30 border-t border-white/10 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        {/* 1. EDIT BUTTON */}
                                        <button
                                          type="button"
                                          onClick={() => handleEditProject(p)}
                                          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border"
                                          style={{
                                            backgroundColor: activeTheme.accentBg,
                                            color: activeTheme.textAccent,
                                            borderColor: activeTheme.accentBorder,
                                          }}
                                          title="Edit Project Details"
                                        >
                                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                          <span>Edit</span>
                                        </button>

                                        {/* 2. DELETE BUTTON */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteProject(p.id)}
                                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                          title="Delete Project"
                                        >
                                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                                          <span>Delete</span>
                                        </button>
                                      </div>

                                      {/* 3. RECENT / PIN TOGGLE */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleProjectRecent(p.id)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                          isRecent
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                                            : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/10'
                                        }`}
                                        title="Toggle Recent Showcase Status"
                                      >
                                        <i className="fa-solid fa-star text-[10px]"></i>
                                        <span className="hidden sm:inline">{isRecent ? 'Recent' : 'Mark Recent'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 5: CUSTOMERS (CRM LIST - REAL CLIENTS ONLY)                 */}
              {/* =============================================================== */}
              {activeTab === 'customers' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-white">Client & Customer CRM</h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Client contact details, project histories, and direct WhatsApp / email communications.
                      </p>
                    </div>
                    {uniqueCustomers.length > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        {uniqueCustomers.length} {uniqueCustomers.length === 1 ? 'Client' : 'Clients'} Registered
                      </span>
                    )}
                  </div>

                  <div
                    className="border rounded-2xl p-6 shadow-xl transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    {uniqueCustomers.length === 0 ? (
                      <div className="py-16 text-center text-white/50 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-2xl text-white/40">
                          <i className="fa-solid fa-users"></i>
                        </div>
                        <div className="font-display font-bold text-base text-white">No Registered Clients Yet</div>
                        <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                          Your customer CRM is live! When visitors submit project briefs through your contact form or you create orders, their complete contact card and order history will automatically be saved here.
                        </p>
                        <button
                          onClick={() => setIsCreateOrderModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg"
                          style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                        >
                          <i className="fa-solid fa-user-plus text-xs"></i>
                          <span>+ Log New Client Order</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                              <th className="pb-3 font-semibold">Client Name</th>
                              <th className="pb-3 font-semibold">Email</th>
                              <th className="pb-3 font-semibold">Phone / WhatsApp</th>
                              <th className="pb-3 font-semibold">Total Orders</th>
                              <th className="pb-3 font-semibold">Total Spent</th>
                              <th className="pb-3 font-semibold text-right">Direct Quick Contact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {uniqueCustomers.map((client, cIdx) => {
                              const cleanWa = client.phone.replace(/[^0-9]/g, '');
                              return (
                                <tr key={`client-row-${client.id || cIdx}-${cIdx}`} className="hover:bg-white/5 transition-colors">
                                  <td className="py-3.5 font-bold text-white flex items-center gap-2.5">
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md"
                                      style={{ background: `linear-gradient(135deg, ${activeTheme.accent}, #00F2FE)` }}
                                    >
                                      {client.customerName.charAt(0)}
                                    </div>
                                    <div>
                                      <span>{client.customerName}</span>
                                      <div className="text-[10px] text-white/40 font-normal">
                                        Last active: {client.lastDate}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-white/70">{client.email}</td>
                                  <td className="py-3.5 font-mono text-white/80">{client.phone || '—'}</td>
                                  <td className="py-3.5 font-mono text-white">
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                      {client.totalOrders} {client.totalOrders === 1 ? 'Order' : 'Orders'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 font-bold font-mono text-emerald-400">
                                    ${client.totalSpent.toFixed(2)}
                                  </td>
                                  <td className="py-3.5 text-right space-x-2">
                                    {cleanWa ? (
                                      <a
                                        href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hi ${client.customerName}, this is Ahsan from Horizon Digital Media regarding your project brief.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-xs transition-colors cursor-pointer"
                                        title="Chat on WhatsApp"
                                      >
                                        <i className="fa-brands fa-whatsapp text-sm"></i>
                                        <span>WhatsApp</span>
                                      </a>
                                    ) : null}
                                    <a
                                      href={`mailto:${client.email}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer"
                                      style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                      title="Send Email"
                                    >
                                      <i className="fa-regular fa-envelope text-xs"></i>
                                      <span>Email</span>
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 6: MARKETING (3-PER-ROW SQUARE CARDS & DYNAMIC CHANNELS)   */}
              {/* =============================================================== */}
              {activeTab === 'marketing' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* Marketing Header with Add Channel & Reset Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border"
                          style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                        >
                          <i className="fa-solid fa-bullhorn"></i>
                        </span>
                        <h2 className="font-display font-bold text-2xl text-white">Marketing & Social Campaign Acquisition</h2>
                      </div>
                      <p className="text-xs text-white/50 mt-1 max-w-2xl">
                        Track live visitor conversions, verified social accounts, and campaign performance across YouTube, TikTok, Instagram, Facebook, WhatsApp, and custom channels.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* "+" Button to add new marketing channel (Requested specifically by user) */}
                      <button
                        onClick={() => setIsAddingNewLink(!isAddingNewLink)}
                        className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${activeTheme.accent}, #00F2FE)`,
                          boxShadow: `0 4px 14px ${activeTheme.glow}`,
                        }}
                        title="Add a new marketing channel with auto-detection"
                      >
                        <i className={`fa-solid ${isAddingNewLink ? 'fa-xmark' : 'fa-plus'} text-sm`}></i>
                        <span>{isAddingNewLink ? 'Close Form' : '+ Add Marketing Channel'}</span>
                      </button>

                      {/* Reset Channels Button */}
                      <button
                        type="button"
                        onClick={handleResetSocialLinks}
                        className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Reset channels to default verified accounts"
                      >
                        <i className="fa-solid fa-rotate-left text-xs"></i>
                        <span className="hidden sm:inline">Reset Channels</span>
                      </button>
                    </div>
                  </div>

                  {/* Add New Channel Expandable Form (With Platform Auto-Detection) */}
                  {isAddingNewLink && (
                    <div
                      className="border-2 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200 transition-colors"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.accentBorder }}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-black"
                            style={{ backgroundColor: activeTheme.accent }}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </span>
                          <div>
                            <h5 className="font-display font-bold text-sm text-white">
                              Add New Marketing Platform or Campaign Link
                            </h5>
                            <p className="text-[11px] text-white/50">
                              Paste your URL below — platform title, brand colors, and icon will be detected automatically!
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewLink(false)}
                          className="text-white/40 hover:text-white text-base cursor-pointer p-1"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>

                      <form onSubmit={handleAddNewSocialLink} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                              <i className="fa-solid fa-globe" style={{ color: activeTheme.textAccent }}></i>
                              <span>Channel URL / Campaign Link *</span>
                            </label>
                            <input
                              type="text"
                              value={newLinkUrl}
                              onChange={(e) => handleNewLinkUrlChange(e.target.value)}
                              placeholder="e.g. https://www.youtube.com/@Horizon-Digital-Media or https://x.com/username"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none font-mono"
                              style={{ borderColor: activeTheme.border }}
                              required
                              autoFocus
                            />
                            <p className="text-[10px] text-white/40">
                              Auto-detects YouTube, TikTok, Instagram, Facebook, WhatsApp, X, LinkedIn, Threads, Pinterest, Discord, etc.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-white flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <i className="fa-solid fa-heading text-purple-400"></i>
                                <span>Channel Title / Label</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-normal">
                                (Auto-detected from URL)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={newLinkTitle}
                              onChange={(e) => setNewLinkTitle(e.target.value)}
                              placeholder="e.g. YouTube Channel, TikTok Ads, etc."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none"
                              style={{ borderColor: activeTheme.border }}
                            />
                            <p className="text-[10px] text-white/40">
                              Leave empty for auto-detected title, or write your custom campaign name.
                            </p>
                          </div>
                        </div>

                        {/* Live Preview */}
                        {newLinkUrl.trim() && (
                          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md shrink-0 border"
                                style={{
                                  backgroundColor: `${newLinkColor}20`,
                                  color: newLinkColor,
                                  borderColor: `${newLinkColor}40`,
                                }}
                              >
                                <i className={newLinkIcon}></i>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">
                                  {newLinkTitle.trim() || detectPlatformFromUrl(newLinkUrl).title}
                                </div>
                                <div className="text-[11px] font-mono text-white/60 truncate max-w-sm mt-0.5">
                                  {newLinkUrl}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              Ready to track & add to cards
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingNewLink(false)}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                          >
                            <i className="fa-solid fa-plus text-xs"></i>
                            <span>Save Channel & Card</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 3-PER-ROW SQUARE CARDS GRID (Requested specifically by user: 3 boxes per row on fullscreen desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dynamicLinks.map((item) => {
                      const leads = ordersList.filter(
                        (o) => (o.referralSource || '').toLowerCase() === item.platform.toLowerCase()
                      );
                      const revenue = leads.reduce((sum, o) => sum + (o.total || 0), 0);
                      const visits = (trafficAnalytics as any)[item.platform] || 0;
                      const convRate = visits > 0 ? ((leads.length / visits) * 100).toFixed(1) + '%' : '0.0%';

                      return (
                        <div
                          key={item.id}
                          className="border hover:border-white/25 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all group min-h-[350px]"
                          style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                        >
                          <div>
                            {/* Card Top: Icon, Platform Badge & DELETE Button */}
                            <div className="flex items-center justify-between mb-3.5">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border"
                                style={{
                                  backgroundColor: `${item.color}20`,
                                  color: item.color,
                                  borderColor: `${item.color}40`,
                                }}
                              >
                                <i className={item.icon}></i>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-md border"
                                  style={{
                                    backgroundColor: `${item.color}15`,
                                    color: item.color,
                                    borderColor: `${item.color}30`,
                                  }}
                                >
                                  {item.platform}
                                </span>

                                {/* Direct DELETE button for marketing channel (Requested specifically by user) */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSocialLink(item.id)}
                                  className="w-8 h-8 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-red-500/30 hover:border-red-500 hover:scale-105 active:scale-95"
                                  title={`Delete ${item.title} marketing card`}
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </div>
                            </div>

                            {/* Title & URL */}
                            <h3 className="font-display font-bold text-lg text-white mb-0.5 truncate">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-white/50 truncate font-mono mb-4" title={item.url}>
                              {item.url}
                            </p>

                            {/* Square Metric Stats Box */}
                            <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Live Visits:</span>
                                <strong className="text-white font-mono text-sm">{visits}</strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Briefs Submitted:</span>
                                <strong
                                  className="font-mono text-sm font-bold"
                                  style={{ color: item.color }}
                                >
                                  {leads.length}
                                </strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Conversion Rate:</span>
                                <strong className="text-cyan-300 font-mono text-xs">{convRate}</strong>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                <span className="text-white/60 font-medium">Revenue Pipeline:</span>
                                <strong className="text-emerald-400 font-mono text-sm">
                                  ${revenue.toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom: Open Link, Copy Bio Tracking Link, and +1 Test Simulation */}
                          <div className="space-y-2 pt-3 border-t border-white/5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border"
                              style={{
                                backgroundColor: `${item.color}20`,
                                color: item.color,
                                borderColor: `${item.color}35`,
                              }}
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                              <span>Open {item.title}</span>
                            </a>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopyBioLink(item.platform)}
                                className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title={`Copy tracking link with ?ref=${item.platform}`}
                              >
                                <i className="fa-regular fa-copy text-xs"></i>
                                <span>Copy Link</span>
                              </button>
                              <button
                                onClick={() => handleSimulateSocialVisit(item.platform)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border"
                                style={{
                                  backgroundColor: `${item.color}15`,
                                  color: item.color,
                                  borderColor: `${item.color}30`,
                                }}
                                title="Simulate +1 live visitor click to test analytics"
                              >
                                +1 Test
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Campaign Attribution & Conversion Rates Table (Dynamic for all channels) */}
                  <div
                    className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                    style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm flex items-center gap-2" style={{ color: activeTheme.textPrimary }}>
                        <i className="fa-solid fa-chart-pie" style={{ color: activeTheme.accent }}></i>
                        <span>Real Campaign Attribution & Conversion Funnel</span>
                      </h3>
                      <span className="text-xs font-mono" style={{ color: activeTheme.textSecondary }}>
                        {dynamicLinks.length} Active Channels
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b uppercase tracking-wider text-[10px]" style={{ borderColor: activeTheme.border, color: activeTheme.textSecondary }}>
                            <th className="pb-3 font-semibold">Channel</th>
                            <th className="pb-3 font-semibold">Tracking Link Param</th>
                            <th className="pb-3 font-semibold">Tracked Visits</th>
                            <th className="pb-3 font-semibold">Form Briefs</th>
                            <th className="pb-3 font-semibold">Conversion Rate</th>
                            <th className="pb-3 font-semibold text-right">Revenue Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: activeTheme.border }}>
                          {dynamicLinks.map((ch, chIdx) => {
                            const count = ordersList.filter(
                              (o) => (o.referralSource || '').toLowerCase() === ch.platform.toLowerCase()
                            ).length;
                            const visits = (trafficAnalytics as any)[ch.platform] || 0;
                            const rev = ordersList
                              .filter((o) => (o.referralSource || '').toLowerCase() === ch.platform.toLowerCase())
                              .reduce((s, o) => s + (o.total || 0), 0);
                            const convRate = visits > 0 ? ((count / visits) * 100).toFixed(1) + '%' : '0.0%';

                            return (
                              <tr key={`ch-row-${ch.id || chIdx}-${chIdx}`} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 font-bold flex items-center gap-2.5" style={{ color: activeTheme.textPrimary }}>
                                  <i className={`${ch.icon}`} style={{ color: ch.color }}></i>
                                  <span>{ch.title}</span>
                                </td>
                                <td className="py-3 font-mono text-[11px]" style={{ color: activeTheme.textSecondary }}>
                                  ?ref={ch.platform}
                                </td>
                                <td className="py-3 font-mono" style={{ color: activeTheme.textPrimary }}>{visits}</td>
                                <td className="py-3 font-mono font-bold" style={{ color: ch.color }}>
                                  {count}
                                </td>
                                <td className="py-3 font-mono text-emerald-400 font-semibold">{convRate}</td>
                                <td className="py-3 font-mono text-right font-bold" style={{ color: activeTheme.textPrimary }}>
                                  ${rev.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* VIEW 7: SETTINGS (WEBSITE ALL SETTINGS REQUESTED BY USER)       */}
              {/* =============================================================== */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* Settings Header with Sub-Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-white">Website & System Settings</h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Customize front page portrait, background animation video, headers, and manage all service projects.
                      </p>
                    </div>

                    {/* Sub-Tabs: Contact Us / Front Page / Social & Footer Links / Services Manager / Brand & Security */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                      {[
                        { id: 'contact', label: 'Contact & Deals', icon: 'fa-solid fa-address-book' },
                        { id: 'frontpage', label: 'Front Page & Hero' },
                        { id: 'links', label: 'Social & Footer Links' },
                        { id: 'services', label: 'Services & Project Studio' },
                        { id: 'general', label: 'Brand & Security' },
                      ].map((tab) => {
                        const isCur = settingsActiveSubTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSettingsActiveSubTab(tab.id as typeof settingsActiveSubTab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isCur ? 'text-white shadow-md' : 'text-white/60 hover:text-white'
                            }`}
                            style={isCur ? { backgroundColor: activeTheme.accent, boxShadow: `0 2px 10px ${activeTheme.glow}` } : {}}
                          >
                            {tab.icon && <i className={`${tab.icon} text-xs`}></i>}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* DEDICATED NEW SUB-PAGE: CONTACT US (SECTION A & SECTION B)      */}
                  {/* =============================================================== */}
                  {settingsActiveSubTab === 'contact' && (
                    <div className="space-y-8 animate-in fade-in">
                      {/* ========================================================= */}
                      {/* SECTION A: Promo Code & Approval Management                */}
                      {/* ========================================================= */}
                      <div
                        className="border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-lg shadow-md">
                              <i className="fa-solid fa-ticket"></i>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Section A
                                </span>
                                <h3 className="font-display font-bold text-lg text-white">Promo Code Settings</h3>
                              </div>
                              <p className="text-xs text-white/50 mt-0.5">
                                Define coupon codes, discount rates, and backend authorization approval codes.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
                              promoSettings.enabled
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border-red-500/40'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${promoSettings.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                              <span>{promoSettings.enabled ? 'Promo System Active' : 'Promo System Inactive'}</span>
                            </span>
                          </div>
                        </div>

                        {/* SECTION A Inputs: 1. Promo Code Input, 2. Discount Percentage Input, Plus System Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* 1. Promo Code Input with dedicated Save Promo Code Button */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                                <i className="fa-solid fa-tag text-emerald-400"></i>
                                <span>Promo Code Input</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleSavePrimaryPromoCode}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors shadow"
                              >
                                Save Promo Code
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <i className="fa-solid fa-ticket absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40"></i>
                                <input
                                  type="text"
                                  value={promoSettings.primaryPromoCode}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(/\s+/g, '');
                                    setPromoSettings({
                                      ...promoSettings,
                                      primaryPromoCode: val,
                                    });
                                  }}
                                  placeholder="e.g. HDM25"
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-white focus:border-[#3B82F6] focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleSavePrimaryPromoCode}
                                className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md transition-all shrink-0"
                                title="Save Promo Code"
                              >
                                <i className="fa-solid fa-floppy-disk text-xs"></i>
                                <span className="hidden sm:inline">Save</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-white/40">Manual field to enter coupon/promo code string</span>
                          </div>

                          {/* 2. Discount Percentage Input */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-percent text-emerald-400"></i>
                              <span>Discount Percentage Input</span>
                            </label>
                            <div className="relative">
                              <i className="fa-solid fa-percent absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400"></i>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={promoSettings.discountPercent}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setPromoSettings({
                                    ...promoSettings,
                                    discountPercent: val,
                                    popupDiscountValue: `${val}%`,
                                  });
                                }}
                                placeholder="e.g. 10, 50, 100"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-emerald-400 focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>
                            <span className="text-[10px] text-white/40">Define discount value (e.g. 10%, 50%, 100%)</span>
                          </div>

                          {/* Promo Active Toggle */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider">
                              Promo Activation Switch
                            </label>
                            <button
                              type="button"
                              onClick={() => setPromoSettings({ ...promoSettings, enabled: !promoSettings.enabled })}
                              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                                promoSettings.enabled
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <span>{promoSettings.enabled ? 'Enabled' : 'Disabled'}</span>
                              <i className={`fa-solid ${promoSettings.enabled ? 'fa-toggle-on text-emerald-400 text-lg' : 'fa-toggle-off text-white/40 text-lg'}`}></i>
                            </button>
                            <span className="text-[10px] text-white/40">Turn coupon validation on or off</span>
                          </div>

                          {/* Application Mode Switch */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider">
                              Checkout Application Mode
                            </label>
                            <button
                              type="button"
                              onClick={() => setPromoSettings({ ...promoSettings, autoApplyPromo: !promoSettings.autoApplyPromo })}
                              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                                promoSettings.autoApplyPromo
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <span>{promoSettings.autoApplyPromo ? 'Auto-Apply' : 'Manual Entry'}</span>
                              <i className={`fa-solid ${promoSettings.autoApplyPromo ? 'fa-wand-magic-sparkles text-blue-400' : 'fa-keyboard text-white/40'}`}></i>
                            </button>
                            <span className="text-[10px] text-white/40">Auto apply or user types code</span>
                          </div>
                        </div>

                        {/* 3. Google Code / Code Approval Input Box */}
                        <div className="space-y-2 pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                              <i className="fa-brands fa-google text-red-400"></i>
                              <span>Google Code / Code Approval Input Box</span>
                            </label>
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              🔒 Strict Approval Authorization System
                            </span>
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={promoSettings.approvedCodes}
                              onChange={(e) => {
                                const str = e.target.value.toUpperCase();
                                const parsed = str.split(/[\n,;]+/).map((c) => c.trim()).filter(Boolean);
                                setPromoSettings({
                                  ...promoSettings,
                                  approvedCodes: str,
                                  codes: parsed,
                                });
                              }}
                              placeholder="HDM25, GOOGLE100, EID2026, AHSAN10, HORIZON25, VIPCLIENT"
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-xs font-mono font-bold text-emerald-400 focus:border-[#3B82F6] focus:outline-none placeholder-white/30"
                            />
                          </div>

                          {/* Approval Logic Explanation Box */}
                          <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-start gap-2.5 text-xs text-white/70">
                            <i className="fa-solid fa-shield-halved text-amber-400 text-sm mt-0.5 shrink-0"></i>
                            <div className="space-y-1">
                              <strong className="text-white">Approval Logic Enforced:</strong>
                              <p className="text-[11px] text-white/60 leading-relaxed">
                                The frontend system will <strong className="text-emerald-400">ONLY validate and approve</strong> customer coupon codes that strictly match the manually listed codes in this backend field. Any other code entered by clients will be strictly rejected.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Save Section A Button */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-[11px] text-white/50">
                            Saves and applies coupon validation rules instantly across checkout.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSavePrimaryPromoCode}
                              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <i className="fa-solid fa-ticket text-xs text-emerald-400"></i>
                              <span>Save Promo Code</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSavePromoSettings}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01]"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                              <span>Save Promo Code Settings</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ========================================================= */}
                      {/* SECTION B: Pop-Up Deals & Banner Settings                 */}
                      {/* ========================================================= */}
                      <div
                        className="border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-lg shadow-md shrink-0"
                              style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                            >
                              <i className="fa-solid fa-bullhorn"></i>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                                  style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                                >
                                  Section B
                                </span>
                                <h3 className="font-display font-bold text-lg text-white">Pop-up & Live Deal Settings</h3>
                              </div>
                              <p className="text-xs text-white/50 mt-0.5">
                                Strict opt-in control. The pop-up will strictly NEVER show on the front-end unless explicitly toggled ON.
                              </p>
                            </div>
                          </div>

                          {/* Interactive ON / OFF Slide Button Toggle */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const next = !promoSettings.popupEnabled;
                                setPromoSettings({ ...promoSettings, popupEnabled: next });
                              }}
                              role="switch"
                              aria-checked={Boolean(promoSettings.popupEnabled)}
                              className={`relative inline-flex items-center h-8 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-md ${
                                promoSettings.popupEnabled
                                  ? 'bg-emerald-500 shadow-emerald-500/30'
                                  : 'bg-gray-700/80 hover:bg-gray-600/80'
                              }`}
                              title={promoSettings.popupEnabled ? 'Click to Turn OFF Pop-Up' : 'Click to Turn ON Pop-Up'}
                            >
                              <span
                                className={`absolute text-[9px] font-black tracking-wider select-none ${
                                  promoSettings.popupEnabled ? 'left-2 text-white' : 'right-2 text-gray-300'
                                }`}
                              >
                                {promoSettings.popupEnabled ? 'ON' : 'OFF'}
                              </span>
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                                  promoSettings.popupEnabled ? 'translate-x-8' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            <div className="flex flex-col">
                              <span
                                className={`text-xs font-bold ${
                                  promoSettings.popupEnabled ? 'text-emerald-400' : 'text-white/60'
                                }`}
                              >
                                {promoSettings.popupEnabled ? 'POP-UP ENABLED' : 'POP-UP DISABLED'}
                              </span>
                              <span className="text-[10px] text-white/40">
                                {promoSettings.popupEnabled ? 'Active on front-end' : 'Strictly hidden from visitors'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* LIVE DIGITAL COUNTDOWN WATCH PREVIEW IN ADMIN BACKEND */}
                        <div
                          className="p-4 rounded-2xl bg-black/50 border flex flex-col md:flex-row md:items-center justify-between gap-4"
                          style={{ borderColor: activeTheme.border }}
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider flex items-center gap-1.5">
                              <i className="fa-regular fa-clock animate-spin text-[10px]" style={{ color: activeTheme.textAccent, animationDuration: '4s' }}></i>
                              <span>Live Digital Countdown Clock Watch (Ticking Preview)</span>
                            </span>
                            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                              Visitors will see this exact digital clock watch ticking down live in real time on the pop-up modal.
                            </p>
                          </div>

                          {/* Digital Clock Display */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-13 h-10 rounded-xl bg-black/80 border flex items-center justify-center font-mono font-black text-lg text-white shadow-inner"
                                style={{ borderColor: activeTheme.border }}
                              >
                                {String(adminPreviewClock.hours).padStart(2, '0')}
                              </div>
                              <span className="text-[9px] font-mono text-white/40 uppercase font-semibold mt-0.5">Hours</span>
                            </div>
                            <span className="font-mono font-black text-base -mt-3 animate-pulse" style={{ color: activeTheme.textAccent }}>:</span>
                            <div className="flex flex-col items-center">
                              <div
                                className="w-13 h-10 rounded-xl bg-black/80 border flex items-center justify-center font-mono font-black text-lg text-white shadow-inner"
                                style={{ borderColor: activeTheme.border }}
                              >
                                {String(adminPreviewClock.minutes).padStart(2, '0')}
                              </div>
                              <span className="text-[9px] font-mono text-white/40 uppercase font-semibold mt-0.5">Mins</span>
                            </div>
                            <span className="font-mono font-black text-base -mt-3 animate-pulse" style={{ color: activeTheme.textAccent }}>:</span>
                            <div className="flex flex-col items-center">
                              <div
                                className="w-13 h-10 rounded-xl bg-black/80 border-2 flex items-center justify-center font-mono font-black text-lg shadow-inner"
                                style={{ borderColor: activeTheme.accent, color: activeTheme.textAccent, boxShadow: `0 0 10px ${activeTheme.glow}` }}
                              >
                                {String(adminPreviewClock.seconds).padStart(2, '0')}
                              </div>
                              <span className="text-[9px] font-mono uppercase font-bold mt-0.5" style={{ color: activeTheme.textAccent }}>Secs</span>
                            </div>
                          </div>
                        </div>

                        {/* SECTION B: The 4 Required Parameter Boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Box 1: Deal Name */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-heading" style={{ color: activeTheme.textAccent }}></i>
                              <span>1. Deal Name</span>
                            </label>
                            <input
                              type="text"
                              value={promoSettings.dealName}
                              onChange={(e) => setPromoSettings({ ...promoSettings, dealName: e.target.value })}
                              placeholder="e.g. Special Eid 25% Off Deal"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-white focus:outline-none"
                              style={{ borderColor: activeTheme.border }}
                            />
                            <span className="text-[10px] text-white/40">Title/name of the pop-up deal</span>
                          </div>

                          {/* Box 2: Manual Time & Expiration Controls (No hardcoded presets) */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <i className="fa-regular fa-clock text-amber-400"></i>
                                <span>2. Custom Expiration Time</span>
                              </span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/50 border border-white/10" style={{ color: activeTheme.textAccent }}>
                                {promoSettings.durationHours || 24}h
                              </span>
                            </label>
                            <div className="space-y-1.5">
                              {/* Manual Custom Hours Input */}
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max="720"
                                  value={promoSettings.durationHours || 24}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    const newEndTime = Date.now() + val * 3600 * 1000;
                                    setPromoSettings({
                                      ...promoSettings,
                                      durationHours: val,
                                      dealEndTime: newEndTime,
                                      timeDuration: `${val} Hours Left • Live Digital Countdown`,
                                    });
                                  }}
                                  placeholder="e.g. 18, 36, 72"
                                  className="w-full pl-3.5 pr-14 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none"
                                  style={{ borderColor: activeTheme.border }}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/40 uppercase font-semibold">
                                  Hours
                                </span>
                              </div>

                              {/* Exact Target Date & Time Picker */}
                              <div className="relative">
                                <input
                                  type="datetime-local"
                                  value={
                                    promoSettings.dealEndTime && promoSettings.dealEndTime > Date.now()
                                      ? (() => {
                                          const d = new Date(promoSettings.dealEndTime);
                                          const pad = (n: number) => String(n).padStart(2, '0');
                                          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                                        })()
                                      : ''
                                  }
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const pickedTime = new Date(e.target.value).getTime();
                                      if (!isNaN(pickedTime) && pickedTime > Date.now()) {
                                        const hrs = Math.max(1, Math.round((pickedTime - Date.now()) / (3600 * 1000)));
                                        setPromoSettings({
                                          ...promoSettings,
                                          dealEndTime: pickedTime,
                                          durationHours: hrs,
                                          timeDuration: `${hrs} Hours Left • Live Digital Countdown`,
                                        });
                                      }
                                    }
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-white/80 focus:outline-none cursor-pointer"
                                  style={{ borderColor: activeTheme.border }}
                                  title="Pick exact target expiration date and time"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40">Set custom hours or exact target date/time</span>
                          </div>

                          {/* Box 3: Discount Value Box */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-tags text-emerald-400"></i>
                              <span>3. Discount Value Box</span>
                            </label>
                            <input
                              type="text"
                              value={promoSettings.popupDiscountValue || `${promoSettings.discountPercent}%`}
                              onChange={(e) => setPromoSettings({ ...promoSettings, popupDiscountValue: e.target.value })}
                              placeholder="e.g. 25% OFF or $100 FLAT"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                              style={{ borderColor: activeTheme.border }}
                            />
                            <span className="text-[10px] text-white/40">Pop-up discount rate or badge value</span>
                          </div>

                          {/* Box 4: Service Selection Dropdown/Box */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-list-check text-purple-400"></i>
                              <span>4. Service Selection Dropdown</span>
                            </label>
                            <select
                              value={promoSettings.targetService || 'all'}
                              onChange={(e) => setPromoSettings({ ...promoSettings, targetService: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                              style={{ borderColor: activeTheme.border }}
                            >
                              <option value="all">All Services (Storewide Pop-up Deal)</option>
                              <option value="video-editing">Video Editing Only</option>
                              <option value="graphic-designing">Graphic Designing Only</option>
                              <option value="ugc-cgi">UGC & CGI Ads Only</option>
                              <option value="web-development">Web Development Only</option>
                              <option value="ai-video">AI Video Editing Only</option>
                              <option value="prompt-engineering">Prompt Engineering Only</option>
                            </select>
                            <span className="text-[10px] text-white/40">Target specific service or all services</span>
                          </div>
                        </div>

                        {/* Save Section B Button */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-[11px] text-white/50">
                            Strict behavior: Pop-up renders on front-end only when toggled ON above.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleTestPopupDeal}
                              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                              title="Test pop-up display on main website"
                            >
                              <i className="fa-solid fa-eye text-xs" style={{ color: activeTheme.textAccent }}></i>
                              <span>Preview Pop-Up</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSavePopupSettings}
                              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-[1.01]"
                              style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                              <span>Save Pop-Up Panel Settings</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ========================================================= */}
                      {/* SECTION C: Contact Us Details Management                   */}
                      {/* ========================================================= */}
                      <div
                        className="border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-lg shadow-md shrink-0"
                              style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                            >
                              <i className="fa-solid fa-address-book"></i>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-lg text-white">Contact & Communication Info</h3>
                              <p className="text-xs text-white/50">
                                Official communication channels, studio office address, business working hours, and social hubs.
                              </p>
                            </div>
                          </div>

                          <span
                            className="text-[11px] font-mono px-3 py-1 rounded-full border"
                            style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                          >
                            Live Synced to Contact Page & Footer
                          </span>
                        </div>

                        {/* Primary Communication Details: Phone/WhatsApp, Email, Address, Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* 1. Direct Phone / WhatsApp Number with Save Number Button */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                                <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                                <span>Direct Phone / WhatsApp Hotline</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleSavePhoneNumber}
                                className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors shadow"
                              >
                                Save Number
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={contactSettings.phone}
                                onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                                placeholder="+92 324 4528683"
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleSavePhoneNumber}
                                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
                                title="Save Number"
                              >
                                <i className="fa-solid fa-floppy-disk text-xs"></i>
                                <span className="hidden sm:inline">Save Number</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-white/40">Includes international country code (+92 ...)</span>
                          </div>

                          {/* 2. Official Business Email Address */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-envelope text-[#38BDF8]"></i>
                              <span>Official Business Email Address</span>
                            </label>
                            <input
                              type="email"
                              value={contactSettings.email}
                              onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                              placeholder="ahsanyousaf683@gmail.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                            />
                            <span className="text-[10px] text-white/40">Receives client brief notifications & order inquiries</span>
                          </div>

                          {/* 3. Studio Physical / Office Address */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-solid fa-location-dot text-red-400"></i>
                              <span>Studio Physical / Office Address & Location</span>
                            </label>
                            <input
                              type="text"
                              value={contactSettings.address}
                              onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                              placeholder="Faisalabad / Lahore, Punjab, Pakistan • Global Digital Studio"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                            />
                            <span className="text-[10px] text-white/40">Displayed in Contact info and contract footers</span>
                          </div>

                          {/* 4. Working Hours & Availability */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fa-regular fa-clock text-amber-400"></i>
                              <span>Working Hours & Studio Availability</span>
                            </label>
                            <input
                              type="text"
                              value={contactSettings.workingHours}
                              onChange={(e) => setContactSettings({ ...contactSettings, workingHours: e.target.value })}
                              placeholder="Mon – Sat: 9:00 AM – 9:00 PM PKT • 24/7 WhatsApp Hotline"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                            />
                            <span className="text-[10px] text-white/40">Studio operating and project intake hours</span>
                          </div>
                        </div>

                        {/* 5. Social Media & Channel Links */}
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                            <i className="fa-solid fa-share-nodes text-purple-400"></i>
                            <span>Official Social Media & Creative Portfolio Links</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Instagram */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-instagram text-[#E1306C]"></i>
                                <span>Instagram URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.instagram}
                                onChange={(e) => setContactSettings({ ...contactSettings, instagram: e.target.value })}
                                placeholder="https://instagram.com/horizon.digital.media"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>

                            {/* YouTube */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-youtube text-[#FF0000]"></i>
                                <span>YouTube Channel URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.youtube}
                                onChange={(e) => setContactSettings({ ...contactSettings, youtube: e.target.value })}
                                placeholder="https://youtube.com/@horizondigitalmedia"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>

                            {/* LinkedIn */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-linkedin text-[#0A66C2]"></i>
                                <span>LinkedIn Profile URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.linkedin}
                                onChange={(e) => setContactSettings({ ...contactSettings, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/ahsan-yousaf-375494297"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>

                            {/* Behance */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-behance text-[#1769FF]"></i>
                                <span>Behance / Portfolio URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.behance}
                                onChange={(e) => setContactSettings({ ...contactSettings, behance: e.target.value })}
                                placeholder="https://behance.net/horizondigital"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>

                            {/* TikTok */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-tiktok text-[#00F2FE]"></i>
                                <span>TikTok Channel URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.tiktok}
                                onChange={(e) => setContactSettings({ ...contactSettings, tiktok: e.target.value })}
                                placeholder="https://tiktok.com/@horizondigitalmedia"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>

                            {/* Twitter / X */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-white/60 flex items-center gap-1.5">
                                <i className="fa-brands fa-x-twitter text-white"></i>
                                <span>Twitter / X Profile URL</span>
                              </span>
                              <input
                                type="url"
                                value={contactSettings.twitter}
                                onChange={(e) => setContactSettings({ ...contactSettings, twitter: e.target.value })}
                                placeholder="https://twitter.com/horizondmedia"
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:border-[#3B82F6] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 6. Form Inquiries Forwarding & WhatsApp Direct Routing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                            <div className="space-y-0.5 pr-2">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <i className="fa-brands fa-whatsapp text-emerald-400"></i>
                                <span>WhatsApp Instant Routing</span>
                              </span>
                              <p className="text-[11px] text-white/50">
                                Pre-formats client brief and redirects customer directly to your WhatsApp hotline.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setContactSettings({
                                  ...contactSettings,
                                  enableWhatsAppRouting: !contactSettings.enableWhatsAppRouting,
                                })
                              }
                              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                                contactSettings.enableWhatsAppRouting ? 'bg-emerald-500' : 'bg-white/20'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  contactSettings.enableWhatsAppRouting ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                            <div className="space-y-0.5 pr-2">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <i className="fa-solid fa-envelope text-[#38BDF8]"></i>
                                <span>Auto-Email Project Alerts</span>
                              </span>
                              <p className="text-[11px] text-white/50">
                                Sends instant copy of inquiry brief to your official studio email inbox.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setContactSettings({
                                  ...contactSettings,
                                  enableEmailRouting: !contactSettings.enableEmailRouting,
                                })
                              }
                              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                                contactSettings.enableEmailRouting ? 'bg-blue-500' : 'bg-white/20'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  contactSettings.enableEmailRouting ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* 7. Save & Publish Contact Settings Button */}
                        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-[11px] text-white/50">
                            Updates are published immediately across Contact Page, Social Hub, Footer, and Header.
                          </p>
                          <button
                            type="button"
                            onClick={handleSaveContactSettings}
                            className="px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-[1.01]"
                            style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                          >
                            <i className="fa-solid fa-floppy-disk text-xs"></i>
                            <span>Save & Publish Contact Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 1: FRONT PAGE CUSTOMIZER */}
                  {settingsActiveSubTab === 'frontpage' && (
                    <div className="space-y-6">
                      {/* Photo, Logo & Background Animation Video Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Ahsan's Front Page Picture */}
                        <div
                          className="border rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-colors"
                          style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                <i className="fa-solid fa-user-tie" style={{ color: activeTheme.textAccent }}></i>
                                <span>Front Page Portrait Photo</span>
                              </h4>
                              {customProfilePic && onResetProfilePic && (
                                <button
                                  type="button"
                                  onClick={onResetProfilePic}
                                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                                  title="Reset to original portrait"
                                >
                                  Reset Default
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3.5 mb-2">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/60 border border-white/20 shrink-0">
                                {customProfilePic ? (
                                  <img src={customProfilePic} alt="Portrait" className="w-full h-full object-cover" />
                                ) : (
                                  <img src="/ahsan-yousaf-portrait.png" alt="Portrait" className="w-full h-full object-cover object-top" />
                                )}
                              </div>
                              <div className="text-[11px] text-white/60 leading-tight">
                                {customProfilePic ? (
                                  <span className="text-emerald-400 font-semibold">Custom portrait active</span>
                                ) : (
                                  <span>Default Ahsan Yousaf portrait active</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                              <i className="fa-solid fa-cloud-arrow-up" style={{ color: activeTheme.textAccent }}></i>
                              <span>Change Portrait Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0] && onUploadProfilePic) {
                                    const reader = new FileReader();
                                    reader.onload = () => onUploadProfilePic(reader.result as string);
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[10px] text-white/40 mt-1.5 text-center">
                              Syncs across Home hero & About page
                            </p>
                          </div>
                        </div>

                        {/* 2. Official Brand Logo (Header & Footer) */}
                        <div
                          className="border rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-colors"
                          style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                                <span>Official Brand Logo</span>
                              </h4>
                              {customLogo && onResetLogo && (
                                <button
                                  type="button"
                                  onClick={onResetLogo}
                                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                                  title="Reset to default brand logo"
                                >
                                  Reset Default
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3.5 mb-2">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A88F] to-[#00E5FF] flex items-center justify-center text-[#070D18] font-bold text-2xl shadow-md overflow-hidden shrink-0">
                                {customLogo ? (
                                  <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <span>H</span>
                                )}
                              </div>
                              <div className="text-[11px] text-white/60 leading-tight">
                                {customLogo ? (
                                  <span className="text-emerald-400 font-semibold">Custom brand logo active</span>
                                ) : (
                                  <span>Default Horizon 'H' logo active</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                              <i className="fa-solid fa-cloud-arrow-up"></i>
                              <span>Change Brand Logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0] && onUploadLogo) {
                                    const reader = new FileReader();
                                    reader.onload = () => onUploadLogo(reader.result as string);
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[10px] text-white/40 mt-1.5 text-center">
                              Updates logo in top navigation & footer
                            </p>
                          </div>
                        </div>

                        {/* 3. Background Video Animation */}
                        <div
                          className="border rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-colors"
                          style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                <i className="fa-solid fa-film text-purple-400"></i>
                                <span>Background Video Loop</span>
                              </h4>
                              {settingsBgVideo && (
                                <button
                                  type="button"
                                  onClick={handleResetBgVideo}
                                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                                >
                                  Reset Default
                                </button>
                              )}
                            </div>

                            {settingsBgVideo ? (
                              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 relative">
                                <video src={settingsBgVideo} autoPlay loop muted className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-2 text-[9px] bg-black/80 px-2 py-0.5 rounded text-emerald-400 font-mono">
                                  Custom Video Active
                                </span>
                              </div>
                            ) : (
                              <div className="aspect-video rounded-xl bg-black/40 border border-dashed border-white/15 flex flex-col items-center justify-center p-3 text-center">
                                <i className="fa-solid fa-wand-magic-sparkles text-xl text-purple-400/60 mb-1"></i>
                                <span className="text-[11px] text-white/60">Interactive Particle Waves</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="w-full py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                              <i className="fa-solid fa-video"></i>
                              <span>Upload Background Video</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleBgVideoUpload}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[10px] text-white/40 mt-1.5 text-center">
                              Subtle ambient background overlay
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hero Headline & Agency Branding */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <h4 className="font-display font-bold text-sm text-white">Front Page Typography & Header / Footer</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                              Hero Headline Text
                            </label>
                            <input
                              type="text"
                              value={settingsHeadline}
                              onChange={(e) => setSettingsHeadline(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                              style={{ borderColor: activeTheme.border }}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                              Agency Brand Name
                            </label>
                            <input
                              type="text"
                              value={settingsAgencyName}
                              onChange={(e) => setSettingsAgencyName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                              style={{ borderColor: activeTheme.border }}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                              WhatsApp Order Hotline
                            </label>
                            <input
                              type="text"
                              value={settingsWhatsApp}
                              onChange={(e) => setSettingsWhatsApp(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none font-mono"
                              style={{ borderColor: activeTheme.border }}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                              Official Inquiries Email
                            </label>
                            <input
                              type="email"
                              value={settingsEmail}
                              onChange={(e) => setSettingsEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none font-mono"
                              style={{ borderColor: activeTheme.border }}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleSaveBrandSettings}
                            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                            style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                          >
                            Save Front Page Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: SOCIAL & FOOTER LINKS (DYNAMIC LINKS MANAGER WITH + ADD BUTTON & DELETE BUTTONS) */}
                  {settingsActiveSubTab === 'links' && (
                    <div className="space-y-6">
                      {/* Top Header & Action Controls */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border"
                              style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                            >
                              <i className="fa-solid fa-link"></i>
                            </span>
                            <h4 className="font-display font-bold text-base text-white">
                              Official Social Media & Footer Links
                            </h4>
                          </div>
                          <p className="text-xs text-white/50 mt-1 max-w-xl">
                            Live links displayed across your website Footer, Social Hub, and Marketing attribution. Delete any unwanted link, or click the <strong style={{ color: activeTheme.textAccent }}>+ Add New Link</strong> button to add any platform with auto-detection!
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* "+" Button to add new social link (Requested specifically by user) */}
                          <button
                            type="button"
                            onClick={() => setIsAddingNewLink(!isAddingNewLink)}
                            className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                            title="Add a new social media platform or custom link"
                          >
                            <i className={`fa-solid ${isAddingNewLink ? 'fa-xmark' : 'fa-plus'} text-sm`}></i>
                            <span>{isAddingNewLink ? 'Close Form' : '+ Add New Link'}</span>
                          </button>

                          {/* Reset to defaults button */}
                          <button
                            type="button"
                            onClick={handleResetSocialLinks}
                            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Reset to Ahsan Yousaf's official verified accounts"
                          >
                            <i className="fa-solid fa-rotate-left text-xs"></i>
                            <span className="hidden sm:inline">Reset Defaults</span>
                          </button>
                        </div>
                      </div>

                      {/* "+ Add New Social Platform" Panel (With Smart Auto-Detection) */}
                      {isAddingNewLink && (
                        <div
                          className="border-2 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200"
                          style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.accentBorder, boxShadow: `0 0 20px ${activeTheme.glow}` }}
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-black"
                                style={{ backgroundColor: activeTheme.accent }}
                              >
                                <i className="fa-solid fa-plus"></i>
                              </span>
                              <div>
                                <h5 className="font-display font-bold text-sm text-white">
                                  Add New Social Media or Custom Link
                                </h5>
                                <p className="text-[11px] text-white/50">
                                  Just paste your link below — the platform name, brand icon, and colors will be detected automatically!
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsAddingNewLink(false)}
                              className="text-white/40 hover:text-white text-base cursor-pointer p-1"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>

                          <form onSubmit={handleAddNewSocialLink} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* 1. URL Input (Primary field with auto-detection) */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                                  <i className="fa-solid fa-globe" style={{ color: activeTheme.textAccent }}></i>
                                  <span>Social Media Link or URL *</span>
                                </label>
                                <input
                                  type="text"
                                  value={newLinkUrl}
                                  onChange={(e) => handleNewLinkUrlChange(e.target.value)}
                                  placeholder="e.g. https://x.com/yourhandle or https://youtube.com/@channel"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:ring-1 focus:outline-none font-mono"
                                  style={{ borderColor: activeTheme.border }}
                                  required
                                  autoFocus
                                />
                                <p className="text-[10px] text-white/40">
                                  Supports YouTube, TikTok, Instagram, Facebook, WhatsApp, X (Twitter), LinkedIn, Threads, Pinterest, Discord, Telegram, Behance, GitHub, Snapchat, Vimeo, and more!
                                </p>
                              </div>

                              {/* 2. Platform Title / Label (Auto-detected or custom) */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-white flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <i className="fa-solid fa-heading text-purple-400"></i>
                                    <span>Title / Label</span>
                                  </span>
                                  <span className="text-[10px] font-normal text-emerald-400">
                                    (Auto-detected from URL or write custom)
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={newLinkTitle}
                                  onChange={(e) => setNewLinkTitle(e.target.value)}
                                  placeholder="Auto-detected once you paste link (e.g. YouTube Channel)"
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none"
                                  style={{ borderColor: activeTheme.border }}
                                />
                                <p className="text-[10px] text-white/40">
                                  Leave blank to use the auto-detected title, or write your own custom name.
                                </p>
                              </div>
                            </div>

                            {/* Live Preview Card */}
                            {newLinkUrl.trim() && (
                              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md shrink-0 border border-white/10"
                                    style={{
                                      backgroundColor: `${newLinkColor}20`,
                                      color: newLinkColor,
                                      borderColor: `${newLinkColor}40`,
                                    }}
                                  >
                                    <i className={newLinkIcon}></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">
                                        {newLinkTitle.trim() || detectPlatformFromUrl(newLinkUrl).title}
                                      </span>
                                      <span
                                        className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md font-bold"
                                        style={{
                                          backgroundColor: `${newLinkColor}20`,
                                          color: newLinkColor,
                                        }}
                                      >
                                        {newLinkPlatform}
                                      </span>
                                    </div>
                                    <p className="text-[11px] font-mono text-white/60 truncate max-w-sm mt-0.5">
                                      {newLinkUrl}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
                                  <i className="fa-solid fa-check"></i>
                                  <span>Ready to Add to Footer</span>
                                </span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingNewLink(false)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                                style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                              >
                                <i className="fa-solid fa-plus text-xs"></i>
                                <span>Save & Add to Footer</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Active Social Links Cards List with Delete and Edit */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <div>
                            <h5 className="font-display font-bold text-sm text-white flex items-center gap-2">
                              <span>Active Footer & Social Media Links</span>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
                                style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                              >
                                {dynamicLinks.length} Active
                              </span>
                            </h5>
                            <p className="text-[11px] text-white/50 mt-0.5">
                              Every link listed here appears immediately in your website's Footer Social Hub.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsAddingNewLink(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors"
                            style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                          >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                            <span>+ Add Link</span>
                          </button>
                        </div>

                        {dynamicLinks.length === 0 ? (
                          <div className="text-center py-10 bg-black/30 rounded-xl border border-dashed border-white/10 space-y-3">
                            <i className="fa-solid fa-link-slash text-3xl text-white/20"></i>
                            <p className="text-xs text-white/50">No social links configured yet.</p>
                            <button
                              type="button"
                              onClick={handleResetSocialLinks}
                              className="px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                              style={{ backgroundColor: activeTheme.accent }}
                            >
                              <i className="fa-solid fa-rotate-left text-xs"></i>
                              <span>Load Default Verified Links</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {dynamicLinks.map((linkItem, lIdx) => {
                              return (
                                <div
                                  key={`link-item-${linkItem.id || lIdx}-${lIdx}`}
                                  className="p-4 rounded-xl bg-black/40 border hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                                  style={{ borderColor: activeTheme.border }}
                                >
                                  {/* Left: Icon, Title, and Platform Badge */}
                                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                    <div
                                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 border shadow-sm transition-transform group-hover:scale-105"
                                      style={{
                                        backgroundColor: `${linkItem.color}15`,
                                        color: linkItem.color,
                                        borderColor: `${linkItem.color}35`,
                                      }}
                                    >
                                      <i className={linkItem.icon}></i>
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-white truncate">
                                          {linkItem.title}
                                        </span>
                                        <span
                                          className="text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold"
                                          style={{
                                            backgroundColor: `${linkItem.color}15`,
                                            color: linkItem.color,
                                          }}
                                        >
                                          {linkItem.platform}
                                        </span>
                                      </div>

                                      {/* Editable URL input */}
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          defaultValue={linkItem.url}
                                          onBlur={(e) => {
                                            if (e.target.value !== linkItem.url) {
                                              handleUpdateDynamicLink(linkItem.id, e.target.value);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleUpdateDynamicLink(linkItem.id, (e.target as HTMLInputElement).value);
                                            }
                                          }}
                                          className="w-full max-w-lg px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white/80 hover:text-white focus:text-white text-[11px] font-mono focus:border-[#38BDF8] focus:outline-none"
                                          title="Click to edit URL and press Enter or click away to save"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Actions - Test, Copy, and Delete */}
                                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                                    {/* Test Link Button */}
                                    <a
                                      href={linkItem.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                      title="Open link in new browser tab to test"
                                    >
                                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                      <span>Test</span>
                                    </a>

                                    {/* Copy URL Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(linkItem.url);
                                        onShowToast(`Copied ${linkItem.title} link!`, 'success');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
                                      title="Copy URL"
                                    >
                                      <i className="fa-regular fa-copy text-xs"></i>
                                    </button>

                                    {/* DELETE BUTTON (Requested specifically by user) */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSocialLink(linkItem.id)}
                                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-red-500/30 hover:border-red-500 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                      title={`Delete ${linkItem.title} from footer`}
                                    >
                                      <i className="fa-solid fa-trash-can text-xs"></i>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
                          <span>
                            Tip: Press <strong className="text-white/60">Enter</strong> after editing any link URL above to save changes.
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-[10px]"></i>
                            <span>All changes auto-sync to Footer in real-time</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: SERVICES & PROJECT MANAGER (WITH + BUTTONS FOR EACH SERVICE) */}
                  {settingsActiveSubTab === 'services' && (
                    <div className="space-y-6">
                      <div
                        className="p-4 border rounded-2xl text-xs transition-colors"
                        style={{
                          backgroundColor: activeTheme.accentBg,
                          borderColor: activeTheme.accentBorder,
                          color: activeTheme.textPrimary,
                        }}
                      >
                        <strong style={{ color: activeTheme.textAccent }}>Service Project Studio:</strong> Click the <strong>"+"</strong> button under any service below to add new video projects or photo mockups. Newly added projects immediately sync to the live portfolio and appear on the front page as recent work!
                      </div>

                      <div className="space-y-4">
                        {[
                          { id: 'video-editing', name: 'Video Editing', icon: 'fa-film', color: 'text-blue-400' },
                          { id: 'graphic-designing', name: 'Graphic Designing', icon: 'fa-palette', color: 'text-cyan-400' },
                          { id: 'ugc-cgi', name: 'UGC & CGI Ads', icon: 'fa-cubes', color: 'text-amber-400' },
                          { id: 'web-development', name: 'Web Development', icon: 'fa-code', color: 'text-emerald-400' },
                          { id: 'ai-video', name: 'AI Video Editing', icon: 'fa-wand-magic-sparkles', color: 'text-purple-400' },
                          { id: 'prompt-engineering', name: 'Prompt Engineering', icon: 'fa-terminal', color: 'text-pink-400' },
                        ].map((srv, sIdx) => {
                          const srvProjects = allProjects.filter((p) => p.category === srv.id);
                          return (
                            <div
                              key={`core-srv-${srv.id || sIdx}-${sIdx}`}
                              className="border rounded-2xl p-5 shadow-xl space-y-4 transition-colors"
                              style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                            >
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm ${srv.color}`}
                                    style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
                                  >
                                    <i className={`fa-solid ${srv.icon}`}></i>
                                  </div>
                                  <div>
                                    <h4 className="font-display font-bold text-sm" style={{ color: activeTheme.textPrimary }}>{srv.name}</h4>
                                    <p className="text-[11px]" style={{ color: activeTheme.textSecondary }}>{srvProjects.length} Active Portfolio Projects</p>
                                  </div>
                                </div>

                                {/* "+" Button with active theme accent and glow */}
                                <button
                                  onClick={() => handleOpenAddProjectModal(srv.id)}
                                  className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                                  style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                                  title={`Add new ${srv.name} project`}
                                >
                                  <i className="fa-solid fa-plus text-xs"></i>
                                  <span>+ Add New {srv.name} Work</span>
                                </button>
                              </div>

                              {/* Project list for this service */}
                              {srvProjects.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                  {srvProjects.slice(0, 4).map((proj, pIdx) => {
                                    const cover = proj.customImage || (proj.images && proj.images[0]);
                                    return (
                                      <div
                                        key={`srv-proj-${proj.id || pIdx}-${pIdx}`}
                                        className="p-2.5 rounded-xl border flex items-center gap-2.5 overflow-hidden transition-colors"
                                        style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
                                      >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative" style={{ backgroundColor: activeTheme.bg }}>
                                          {cover ? (
                                            <img src={cover} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
                                              <i className="fa-solid fa-image"></i>
                                            </div>
                                          )}
                                          {proj.videoUrl && (
                                            <span
                                              className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[6px] text-white"
                                              style={{ backgroundColor: activeTheme.accent }}
                                            >
                                              <i className="fa-solid fa-play"></i>
                                            </span>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-bold truncate" style={{ color: activeTheme.textPrimary }}>{proj.title}</div>
                                          <div className="text-[10px] truncate" style={{ color: activeTheme.textSecondary }}>{proj.subtitle || 'Showcase'}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: BRAND & SECURITY (PASSWORD & EMAIL MANAGEMENT) */}
                  {settingsActiveSubTab === 'general' && (
                    <div className="space-y-6">
                      {/* Section 0: Active Credentials Overview & Verification */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: activeTheme.border }}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                              style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                            >
                              <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-sm flex items-center gap-2" style={{ color: activeTheme.textPrimary }}>
                                <span>Active Admin Credentials</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                                  ● Live & Active
                                </span>
                              </h4>
                              <p className="text-xs" style={{ color: activeTheme.textSecondary }}>Active and verified credentials for admin portal authentication</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleResetToDefaultCredentials}
                            className="px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90"
                            style={{
                              backgroundColor: activeTheme.cardInner,
                              borderColor: activeTheme.border,
                              color: activeTheme.textPrimary,
                            }}
                            title="Reset to official requested credentials"
                          >
                            <i className="fa-solid fa-rotate-left text-xs"></i>
                            <span>Reset to Official Defaults</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                          <div
                            className="p-3.5 rounded-xl border space-y-1 transition-colors"
                            style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: activeTheme.textSecondary }}>
                              <i className="fa-solid fa-envelope" style={{ color: activeTheme.accent }}></i>
                              <span>Current Admin Email</span>
                            </div>
                            <div className="font-mono text-xs font-bold break-all select-all" style={{ color: activeTheme.textPrimary }}>
                              {localStorage.getItem('horizon_admin_email') || DEFAULT_ADMIN_EMAIL}
                            </div>
                          </div>

                          <div
                            className="p-3.5 rounded-xl border space-y-1 transition-colors"
                            style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: activeTheme.textSecondary }}>
                              <span className="flex items-center gap-1.5">
                                <i className="fa-solid fa-key text-amber-400"></i>
                                <span>Current Admin Passcode</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowSavedPasscode(!showSavedPasscode)}
                                className="text-[10px] cursor-pointer hover:underline"
                                style={{ color: activeTheme.textSecondary }}
                              >
                                {showSavedPasscode ? 'Hide' : 'Reveal'}
                              </button>
                            </div>
                            <div className="font-mono text-xs font-bold select-all" style={{ color: activeTheme.textPrimary }}>
                              {showSavedPasscode
                                ? localStorage.getItem('horizon_admin_passcode') || DEFAULT_ADMIN_PASSCODE
                                : '••••••••••••'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 1: Unified Credentials Editor (Updates Email, Password, or Both) */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl space-y-5 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                            style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
                          >
                            <i className="fa-solid fa-user-gear"></i>
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-sm" style={{ color: activeTheme.textPrimary }}>
                              Update Admin Email & Password
                            </h4>
                            <p className="text-xs" style={{ color: activeTheme.textSecondary }}>
                              You can update your email, set a new password, or change both at once.
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSaveAdminSecurity} className="space-y-4">
                          {/* Email input */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                              Admin Login Email Address
                            </label>
                            <input
                              type="email"
                              value={adminChangeEmail}
                              onChange={(e) => setAdminChangeEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                              style={{
                                backgroundColor: activeTheme.cardInner,
                                borderColor: activeTheme.border,
                                color: activeTheme.textPrimary,
                              }}
                              placeholder="e.g. horizondigitalmedia.official@gmail.com"
                              required
                            />
                            <p className="text-[11px] mt-1" style={{ color: activeTheme.textSecondary }}>
                              This email is used for dashboard sign-in and owner notifications.
                            </p>
                          </div>

                          {/* Password section */}
                          <div className="border-t pt-4 space-y-3" style={{ borderColor: activeTheme.border }}>
                            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: activeTheme.textSecondary }}>
                              Change Password / Passcode (Optional - leave blank to keep same)
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Current Passcode */}
                              <div>
                                <label className="block text-[11px] font-medium mb-1" style={{ color: activeTheme.textSecondary }}>
                                  Current Passcode (Optional)
                                </label>
                                <div className="relative">
                                  <input
                                    type={showCurrentPasscode ? 'text' : 'password'}
                                    placeholder="Default or current"
                                    value={currentPasscode}
                                    onChange={(e) => setCurrentPasscode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 pr-9 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                                    style={{
                                      backgroundColor: activeTheme.cardInner,
                                      borderColor: activeTheme.border,
                                      color: activeTheme.textPrimary,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPasscode(!showCurrentPasscode)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs cursor-pointer p-0.5 opacity-60 hover:opacity-100"
                                    style={{ color: activeTheme.textPrimary }}
                                  >
                                    <i className={`fa-solid ${showCurrentPasscode ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                  </button>
                                </div>
                              </div>

                              {/* New Passcode */}
                              <div>
                                <label className="block text-[11px] font-medium mb-1" style={{ color: activeTheme.textSecondary }}>
                                  New Passcode
                                </label>
                                <div className="relative">
                                  <input
                                    type={showNewPasscode ? 'text' : 'password'}
                                    placeholder="Leave blank to keep same"
                                    value={newPasscode}
                                    onChange={(e) => setNewPasscode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 pr-9 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                                    style={{
                                      backgroundColor: activeTheme.cardInner,
                                      borderColor: activeTheme.border,
                                      color: activeTheme.textPrimary,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPasscode(!showNewPasscode)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs cursor-pointer p-0.5 opacity-60 hover:opacity-100"
                                    style={{ color: activeTheme.textPrimary }}
                                  >
                                    <i className={`fa-solid ${showNewPasscode ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                  </button>
                                </div>
                              </div>

                              {/* Confirm New Passcode */}
                              <div>
                                <label className="block text-[11px] font-medium mb-1" style={{ color: activeTheme.textSecondary }}>
                                  Confirm New Passcode
                                </label>
                                <div className="relative">
                                  <input
                                    type={showConfirmPasscode ? 'text' : 'password'}
                                    placeholder="Re-type new passcode"
                                    value={confirmPasscode}
                                    onChange={(e) => setConfirmPasscode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 pr-9 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                                    style={{
                                      backgroundColor: activeTheme.cardInner,
                                      borderColor: activeTheme.border,
                                      color: activeTheme.textPrimary,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs cursor-pointer p-0.5 opacity-60 hover:opacity-100"
                                    style={{ color: activeTheme.textPrimary }}
                                  >
                                    <i className={`fa-solid ${showConfirmPasscode ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                              style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                            >
                              <i className="fa-solid fa-floppy-disk"></i>
                              <span>Save Admin Credentials</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleChangeAdminEmail()}
                              className="px-4 py-2.5 rounded-xl border font-semibold text-xs cursor-pointer transition-colors hover:opacity-90"
                              style={{
                                backgroundColor: activeTheme.cardInner,
                                borderColor: activeTheme.border,
                                color: activeTheme.textPrimary,
                              }}
                            >
                              Update Email Only
                            </button>

                            {newPasscode && (
                              <button
                                type="button"
                                onClick={() => handleChangeAdminPasscode()}
                                className="px-4 py-2.5 rounded-xl border font-semibold text-xs cursor-pointer transition-colors hover:opacity-90"
                                style={{
                                  backgroundColor: activeTheme.cardInner,
                                  borderColor: activeTheme.border,
                                  color: activeTheme.textPrimary,
                                }}
                              >
                                Update Passcode Only
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      {/* Section 2: Active Session & Sign Out */}
                      <div
                        className="border rounded-2xl p-6 shadow-xl space-y-4 transition-colors"
                        style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                      >
                        <h4 className="font-display font-bold text-sm" style={{ color: activeTheme.textPrimary }}>Active Session & Access</h4>
                        <div
                          className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
                          style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
                        >
                          <div>
                            <div className="font-bold flex items-center gap-2" style={{ color: activeTheme.textPrimary }}>
                              <span>Signed in as Owner</span>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="text-[11px]" style={{ color: activeTheme.textSecondary }}>{activeEmail} (Horizon Studio Master Access)</div>
                          </div>
                          <button
                            onClick={handleSignOut}
                            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW / MANAGE ORDER MODAL (POPUP WHEN CLICKING "VIEW/MANAGE")             */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative transition-colors"
            style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg border flex items-center justify-center text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: activeTheme.cardInner,
                borderColor: activeTheme.border,
                color: activeTheme.textSecondary,
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
              >
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <div>
                <h3 className="font-display font-bold text-base" style={{ color: activeTheme.textPrimary }}>
                  Order Details {selectedOrder.orderNumber}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedOrder.status === 'Order Complete'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Priority / Urgency Badge Banner */}
            {selectedOrder.isRushDelivery ? (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/25 text-amber-300 flex items-center justify-center shrink-0 text-base font-bold">
                  ⚡
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    <span>Express Urgent Order</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-100 font-mono font-bold">
                      25% ADVANCE
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-snug">
                    Client requested high-priority rush delivery. Required Advance Deposit:{' '}
                    <strong className="text-white font-mono font-bold">
                      ${(selectedOrder.advancePaymentRequired || selectedOrder.total * 0.25).toFixed(2)}
                    </strong>{' '}
                    (25% of ${selectedOrder.total.toFixed(2)}).
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold"
                style={{ backgroundColor: activeTheme.accentBg, borderColor: activeTheme.accentBorder, color: activeTheme.textAccent }}
              >
                <i className="fa-regular fa-clock text-xs"></i>
                <span>Standard Order (Normal Delivery)</span>
              </div>
            )}

            {/* Promo Code Applied Banner */}
            {selectedOrder.promoCode && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <i className="fa-solid fa-tag"></i>
                  <span>Promo Code Applied:</span>
                  <span className="font-mono font-bold uppercase text-white bg-emerald-600/30 px-2 py-0.5 rounded">
                    {selectedOrder.promoCode}
                  </span>
                </div>
                <div className="font-mono text-emerald-400 font-bold">
                  {selectedOrder.discountPercent}% Discount
                  {selectedOrder.originalTotal && (
                    <span className="text-white/40 line-through text-[11px] ml-1.5">
                      ${selectedOrder.originalTotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div
              className="p-4 rounded-xl border space-y-2.5 text-xs transition-colors"
              style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
            >
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: activeTheme.border }}>
                <span style={{ color: activeTheme.textSecondary }}>Client Name:</span>
                <strong className="text-sm" style={{ color: activeTheme.textPrimary }}>{selectedOrder.customerName}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: activeTheme.border }}>
                <span style={{ color: activeTheme.textSecondary }}>Email Address:</span>
                <strong className="font-mono" style={{ color: activeTheme.textPrimary }}>{selectedOrder.email}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: activeTheme.border }}>
                <span style={{ color: activeTheme.textSecondary }}>Phone / WhatsApp:</span>
                <strong className="font-mono" style={{ color: activeTheme.textPrimary }}>{selectedOrder.phone}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: activeTheme.border }}>
                <span style={{ color: activeTheme.textSecondary }}>Service Requested:</span>
                <strong style={{ color: activeTheme.textAccent }}>{selectedOrder.service}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: activeTheme.border }}>
                <span style={{ color: activeTheme.textSecondary }}>Target Deadline:</span>
                <strong style={{ color: activeTheme.textPrimary }}>{selectedOrder.deadline || 'Flexible'}</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span style={{ color: activeTheme.textSecondary }}>Total Project Value:</span>
                <strong className="text-emerald-400 font-mono text-base">${selectedOrder.total.toFixed(2)}</strong>
              </div>

              {/* Full Client Description / Brief Display */}
              <div className="pt-3 border-t space-y-1.5" style={{ borderColor: activeTheme.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: activeTheme.textPrimary }}>
                    <i className="fa-solid fa-align-left" style={{ color: activeTheme.accent }}></i>
                    <span>Client Project Description:</span>
                  </span>
                  {(selectedOrder.description || selectedOrder.message) && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.description || selectedOrder.message || '');
                        onShowToast('Project description copied to clipboard!', 'info');
                      }}
                      className="text-[10px] px-2 py-0.5 rounded border cursor-pointer flex items-center gap-1 transition-colors"
                      style={{
                        backgroundColor: activeTheme.card,
                        borderColor: activeTheme.border,
                        color: activeTheme.textSecondary,
                      }}
                    >
                      <i className="fa-regular fa-copy"></i>
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <div
                  className="p-3 rounded-xl border text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans select-all transition-colors"
                  style={{
                    backgroundColor: activeTheme.bg,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                >
                  {selectedOrder.description || selectedOrder.message || (
                    <span className="italic opacity-60">
                      No additional project brief details were provided in this inquiry.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {selectedOrder.phone && (
                <a
                  href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>WhatsApp Client</span>
                </a>
              )}

              {selectedOrder.status !== 'Order Complete' ? (
                <button
                  type="button"
                  onClick={() => handleMarkOrderComplete(selectedOrder)}
                  className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Mark Order Complete</span>
                </button>
              ) : (
                <div className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Completed & Delivered</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PROJECT MODAL (INVOKED FROM BLUE BUTTON OR SERVICES)          */}
      {/* ========================================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className="border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative transition-colors"
            style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between transition-colors"
              style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
            >
              <h3 className="font-display font-bold text-base" style={{ color: activeTheme.textPrimary }}>
                Add Project to Portfolio & Services
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: activeTheme.cardInner,
                  borderColor: activeTheme.border,
                  color: activeTheme.textSecondary,
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="e.g. Apex High-Retention Video Suite"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g. 4K Commercial Post-Production"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Service Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      const subs = SERVICE_SUB_CATEGORIES[e.target.value] || [];
                      if (subs.length > 0) setNewSubCategory(subs[0]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  >
                    {PORTFOLIO_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#070B14] text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Sub-Category / Division
                  </label>
                  <select
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  >
                    {(SERVICE_SUB_CATEGORIES[newCategory] || []).map((sub, sIdx) => (
                      <option key={sIdx} value={sub} className="bg-[#070B14] text-white">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Video Upload Control */}
              <div
                className="p-3.5 rounded-xl border space-y-2 transition-colors"
                style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
              >
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: activeTheme.textSecondary }}>
                  Video File (MP4, WebM, MOV) or Video URL
                </label>
                {newVideoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black mb-2 border border-white/10">
                    <video src={newVideoUrl} controls className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label
                    className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeTheme.accentBg,
                      borderColor: activeTheme.accentBorder,
                      color: activeTheme.textAccent,
                    }}
                  >
                    <i className="fa-solid fa-file-video"></i>
                    <span>{isUploadingVideo ? 'Uploading...' : 'Upload Video File'}</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Or paste video direct URL..."
                    className="flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.card,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Photo Upload Control */}
              <div
                className="p-3.5 rounded-xl border space-y-2 transition-colors"
                style={{ backgroundColor: activeTheme.cardInner, borderColor: activeTheme.border }}
              >
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: activeTheme.textSecondary }}>
                  Project Photos & Screenshots ({newImages.length} uploaded)
                </label>
                {newImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center text-[8px]"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label
                  className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeTheme.card,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                >
                  <i className="fa-solid fa-images" style={{ color: activeTheme.accent }}></i>
                  <span>{isUploadingImages ? 'Compressing...' : '+ Upload Photos (Select Multiple)'}</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Creative overview, client objectives, deliverables..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none leading-relaxed transition-colors"
                  style={{
                    backgroundColor: activeTheme.cardInner,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Tools (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTools}
                    onChange={(e) => setNewTools(e.target.value)}
                    placeholder="Premiere Pro, DaVinci, After Effects"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="4K, Viral, Retention"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t" style={{ borderColor: activeTheme.border }}>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeTheme.cardInner,
                    borderColor: activeTheme.border,
                    color: activeTheme.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>{isSavingProject ? 'Saving...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE CUSTOM CLIENT ORDER MODAL                                          */}
      {/* ========================================================================= */}
      {isCreateOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative transition-colors"
            style={{ backgroundColor: activeTheme.surface, borderColor: activeTheme.border }}
          >
            <button
              onClick={() => setIsCreateOrderModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg border flex items-center justify-center text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: activeTheme.cardInner,
                borderColor: activeTheme.border,
                color: activeTheme.textSecondary,
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: activeTheme.accentBg, color: activeTheme.textAccent, borderColor: activeTheme.accentBorder }}
              >
                <i className="fa-solid fa-cart-plus"></i>
              </div>
              <div>
                <h3 className="font-display font-bold text-base" style={{ color: activeTheme.textPrimary }}>Create Custom Client Order</h3>
                <p className="text-xs" style={{ color: activeTheme.textSecondary }}>Log client jobs and custom projects manually into your pipeline.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Miller"
                    value={orderCustName}
                    onChange={(e) => setOrderCustName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Total Contract Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={orderTotal}
                    onChange={(e) => setOrderTotal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none font-mono transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Service Division
                  </label>
                  <select
                    value={orderService}
                    onChange={(e) => setOrderService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  >
                    <option value="Video Editing" className="bg-[#070B14] text-white">Video Editing</option>
                    <option value="Graphic Designing" className="bg-[#070B14] text-white">Graphic Designing</option>
                    <option value="UGC & CGI Ads" className="bg-[#070B14] text-white">UGC & CGI Ads</option>
                    <option value="Web Development" className="bg-[#070B14] text-white">Web Development</option>
                    <option value="AI Video Editing" className="bg-[#070B14] text-white">AI Video Editing</option>
                    <option value="Prompt Engineering" className="bg-[#070B14] text-white">Prompt Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                    Acquisition Channel
                  </label>
                  <select
                    value={orderReferral}
                    onChange={(e) => setOrderReferral(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none cursor-pointer transition-colors"
                    style={{
                      backgroundColor: activeTheme.cardInner,
                      borderColor: activeTheme.border,
                      color: activeTheme.textPrimary,
                    }}
                  >
                    <option value="direct" className="bg-[#070B14] text-white">🌐 Direct Website Client</option>
                    <option value="youtube" className="bg-[#070B14] text-white">▶️ YouTube Channel</option>
                    <option value="tiktok" className="bg-[#070B14] text-white">🎵 TikTok Channel</option>
                    <option value="instagram" className="bg-[#070B14] text-white">📷 Instagram Profile</option>
                    <option value="facebook" className="bg-[#070B14] text-white">📘 Facebook Page</option>
                    <option value="whatsapp" className="bg-[#070B14] text-white">💬 WhatsApp Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: activeTheme.textSecondary }}>
                  Project Notes & Deliverables Brief
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of client request, milestones, timeline..."
                  value={orderMessage}
                  onChange={(e) => setOrderMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none leading-relaxed transition-colors"
                  style={{
                    backgroundColor: activeTheme.cardInner,
                    borderColor: activeTheme.border,
                    color: activeTheme.textPrimary,
                  }}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t" style={{ borderColor: activeTheme.border }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeTheme.cardInner,
                    borderColor: activeTheme.border,
                    color: activeTheme.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: activeTheme.accent, boxShadow: `0 4px 14px ${activeTheme.glow}` }}
                >
                  Create & Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
