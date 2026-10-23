import { DynamicSocialLink } from '../types';

export const DEFAULT_DYNAMIC_SOCIAL_LINKS: DynamicSocialLink[] = [
  {
    id: 'youtube',
    title: 'YouTube Channel',
    url: 'https://www.youtube.com/@Horizon-Digital-Media',
    platform: 'youtube',
    icon: 'fa-brands fa-youtube',
    color: '#FF0000',
  },
  {
    id: 'tiktok',
    title: 'TikTok Profile',
    url: 'https://vm.tiktok.com/ZS9DBEx7RqMWa-LXXM6/',
    platform: 'tiktok',
    icon: 'fa-brands fa-tiktok',
    color: '#00F2FE',
  },
  {
    id: 'instagram',
    title: 'Instagram Reels',
    url: 'https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp',
    platform: 'instagram',
    icon: 'fa-brands fa-instagram',
    color: '#E1306C',
  },
  {
    id: 'facebook',
    title: 'Facebook Page',
    url: 'https://www.facebook.com/share/1cBv9dCK2S/',
    platform: 'facebook',
    icon: 'fa-brands fa-facebook-f',
    color: '#1877F2',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Direct',
    url: 'https://wa.me/923244528683',
    platform: 'whatsapp',
    icon: 'fa-brands fa-whatsapp',
    color: '#25D366',
  },
  {
    id: 'email',
    title: 'Official Studio Email',
    url: 'mailto:horizondigitalmedia.official@gmail.com',
    platform: 'email',
    icon: 'fa-solid fa-envelope',
    color: '#38BDF8',
  },
];

/**
 * Automatically detects platform name, FontAwesome icon class, and brand color from a URL
 */
export function detectPlatformFromUrl(rawUrl: string): {
  title: string;
  platform: string;
  icon: string;
  color: string;
} {
  const clean = (rawUrl || '').toLowerCase().trim();

  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return {
      title: 'YouTube Channel',
      platform: 'youtube',
      icon: 'fa-brands fa-youtube',
      color: '#FF0000',
    };
  }
  if (clean.includes('tiktok.com')) {
    return {
      title: 'TikTok Profile',
      platform: 'tiktok',
      icon: 'fa-brands fa-tiktok',
      color: '#00F2FE',
    };
  }
  if (clean.includes('instagram.com')) {
    return {
      title: 'Instagram Profile',
      platform: 'instagram',
      icon: 'fa-brands fa-instagram',
      color: '#E1306C',
    };
  }
  if (clean.includes('facebook.com') || clean.includes('fb.me') || clean.includes('fb.com')) {
    return {
      title: 'Facebook Page',
      platform: 'facebook',
      icon: 'fa-brands fa-facebook-f',
      color: '#1877F2',
    };
  }
  if (clean.includes('wa.me') || clean.includes('whatsapp.com')) {
    return {
      title: 'WhatsApp Contact',
      platform: 'whatsapp',
      icon: 'fa-brands fa-whatsapp',
      color: '#25D366',
    };
  }
  if (clean.includes('x.com') || clean.includes('twitter.com')) {
    return {
      title: 'X (Twitter)',
      platform: 'x',
      icon: 'fa-brands fa-x-twitter',
      color: '#FFFFFF',
    };
  }
  if (clean.includes('linkedin.com')) {
    return {
      title: 'LinkedIn',
      platform: 'linkedin',
      icon: 'fa-brands fa-linkedin-in',
      color: '#0A66C2',
    };
  }
  if (clean.includes('behance.net')) {
    return {
      title: 'Behance Portfolio',
      platform: 'behance',
      icon: 'fa-brands fa-behance',
      color: '#0057FF',
    };
  }
  if (clean.includes('dribbble.com')) {
    return {
      title: 'Dribbble Profile',
      platform: 'dribbble',
      icon: 'fa-brands fa-dribbble',
      color: '#EA4C89',
    };
  }
  if (clean.includes('pinterest.com')) {
    return {
      title: 'Pinterest',
      platform: 'pinterest',
      icon: 'fa-brands fa-pinterest',
      color: '#BD081C',
    };
  }
  if (clean.includes('discord.gg') || clean.includes('discord.com')) {
    return {
      title: 'Discord Community',
      platform: 'discord',
      icon: 'fa-brands fa-discord',
      color: '#5865F2',
    };
  }
  if (clean.includes('t.me') || clean.includes('telegram.org') || clean.includes('telegram.me')) {
    return {
      title: 'Telegram Channel',
      platform: 'telegram',
      icon: 'fa-brands fa-telegram',
      color: '#229ED9',
    };
  }
  if (clean.includes('github.com')) {
    return {
      title: 'GitHub Showcase',
      platform: 'github',
      icon: 'fa-brands fa-github',
      color: '#FFFFFF',
    };
  }
  if (clean.includes('snapchat.com')) {
    return {
      title: 'Snapchat',
      platform: 'snapchat',
      icon: 'fa-brands fa-snapchat',
      color: '#FFFC00',
    };
  }
  if (clean.includes('threads.net')) {
    return {
      title: 'Threads Profile',
      platform: 'threads',
      icon: 'fa-brands fa-threads',
      color: '#FFFFFF',
    };
  }
  if (clean.includes('vimeo.com')) {
    return {
      title: 'Vimeo Showcase',
      platform: 'vimeo',
      icon: 'fa-brands fa-vimeo-v',
      color: '#1AB7EA',
    };
  }
  if (clean.includes('twitch.tv')) {
    return {
      title: 'Twitch Channel',
      platform: 'twitch',
      icon: 'fa-brands fa-twitch',
      color: '#9146FF',
    };
  }
  if (clean.includes('reddit.com')) {
    return {
      title: 'Reddit Community',
      platform: 'reddit',
      icon: 'fa-brands fa-reddit-alien',
      color: '#FF4500',
    };
  }
  if (clean.startsWith('mailto:') || (clean.includes('@') && !clean.includes('/'))) {
    return {
      title: 'Studio Email',
      platform: 'email',
      icon: 'fa-solid fa-envelope',
      color: '#38BDF8',
    };
  }

  // Fallback for custom link
  return {
    title: 'Custom Social Link',
    platform: 'custom',
    icon: 'fa-solid fa-link',
    color: '#38BDF8',
  };
}

/**
 * Retrieve saved dynamic social links with auto-fallback
 */
export function getStoredSocialLinks(): DynamicSocialLink[] {
  try {
    const rawList = localStorage.getItem('horizon_dynamic_social_links');
    if (rawList) {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Legacy fallback check
    const rawLegacy = localStorage.getItem('horizon_social_links');
    if (rawLegacy) {
      const leg = JSON.parse(rawLegacy);
      const list: DynamicSocialLink[] = [];
      if (leg.youtube) list.push({ id: 'youtube', title: 'YouTube Channel', url: leg.youtube, platform: 'youtube', icon: 'fa-brands fa-youtube', color: '#FF0000' });
      if (leg.tiktok) list.push({ id: 'tiktok', title: 'TikTok Profile', url: leg.tiktok, platform: 'tiktok', icon: 'fa-brands fa-tiktok', color: '#00F2FE' });
      if (leg.instagram) list.push({ id: 'instagram', title: 'Instagram Reels', url: leg.instagram, platform: 'instagram', icon: 'fa-brands fa-instagram', color: '#E1306C' });
      if (leg.facebook) list.push({ id: 'facebook', title: 'Facebook Page', url: leg.facebook, platform: 'facebook', icon: 'fa-brands fa-facebook-f', color: '#1877F2' });
      if (leg.whatsapp) list.push({ id: 'whatsapp', title: 'WhatsApp Direct', url: leg.whatsapp, platform: 'whatsapp', icon: 'fa-brands fa-whatsapp', color: '#25D366' });
      if (leg.email) list.push({ id: 'email', title: 'Official Studio Email', url: leg.email.startsWith('mailto:') ? leg.email : `mailto:${leg.email}`, platform: 'email', icon: 'fa-solid fa-envelope', color: '#38BDF8' });
      if (list.length > 0) return list;
    }
  } catch {}

  return DEFAULT_DYNAMIC_SOCIAL_LINKS;
}

/**
 * Save social links and notify the whole app (Footer, Marketing, etc.) in real-time
 */
export function saveStoredSocialLinks(links: DynamicSocialLink[]): void {
  try {
    localStorage.setItem('horizon_dynamic_social_links', JSON.stringify(links));

    // Keep legacy object in sync
    const legacyObj: Record<string, string> = {};
    links.forEach((l) => {
      if (l.platform) legacyObj[l.platform] = l.url;
    });
    localStorage.setItem('horizon_social_links', JSON.stringify(legacyObj));

    // Dispatch event for instant UI re-render across the entire page
    window.dispatchEvent(new Event('horizon_social_links_updated'));
  } catch (err) {
    console.warn('Could not save social links:', err);
  }
}
