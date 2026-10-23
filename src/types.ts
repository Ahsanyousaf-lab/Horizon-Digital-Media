export type ThemeColor = 'teal' | 'dark-blue' | 'dark-yellow' | 'dark-red' | 'dark-purple';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  previewColor: string;
}

export type PageId = 'home' | 'services' | 'about' | 'contact' | 'terms';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  features: string[];
  deliverables?: string;
  turnaround?: string;
}

export interface PortfolioCard {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  subtitle: string;
  description: string;
  tags: string[];
  tools: string[];
  previewType: 'video' | 'design' | 'ugc' | 'code' | 'prompt';
  badge?: string;
  customImage?: string;
  images?: string[];
  videoUrl?: string;
  videos?: string[];
  isUserAdded?: boolean;
  createdAt?: number;
  subCategory?: string;
}

export interface ExperienceCategory {
  title: string;
  years: string;
  description: string;
  icon: string;
}

export interface CountryCode {
  iso: string;
  code: string;
  country: string;
  flag: string;
}

export interface ProjectInquiry {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  service: string;
  budget: string;
  customBudget?: string;
  deadline: string;
  description: string;
  isRushDelivery: boolean;
  advancePaymentRequired?: number;
  promoCode?: string;
  discountPercent?: number;
  discountedTotal?: number;
  originalTotal?: number;
  referralSource?: string;
  submittedAt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export interface ClientReview {
  id: string;
  name: string;
  origin: 'pakistani' | 'american' | 'international';
  location: string;
  role: string;
  company?: string;
  avatarUrl: string;
  rating: number;
  quote: string;
  serviceCategory: string; // 'video-editing' | 'graphic-designing' | 'ugc-cgi' | 'ai-video' | 'prompt-engineering' | 'web-development'
}

export interface DynamicSocialLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  icon: string;
  color: string;
}
