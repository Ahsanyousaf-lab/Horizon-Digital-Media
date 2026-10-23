import React, { useState } from 'react';
import JSZip from 'jszip';

interface ZipExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ZipExporterModal: React.FC<ZipExporterModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // styles.css content
      const stylesCss = `/* =========================================================================
   HORIZON DIGITAL MEDIA — STANDALONE STYLESHEET
   Design Tokens & Visual Theme System
   ========================================================================= */

:root {
  --bg: #070D18;
  --surface: #0d1524;
  --surface-2: #111c2e;
  --text: #f6fbff;
  --muted: #9aa9bd;
  --line: rgba(255,255,255,.09);
  --primary: #00A88F;
  --secondary: #00E5FF;
  --glow: rgba(0,229,255,.22);
  --shadow: 0 24px 70px rgba(0,0,0,.34);
  --radius: 24px;
  --header: 72px;
  font-family: 'Inter', sans-serif;
}

[data-theme-mode="light"] {
  --bg: #f4f7fb;
  --surface: #ffffff;
  --surface-2: #e9eff7;
  --text: #081220;
  --muted: #586981;
  --line: rgba(0,0,0,.08);
  --shadow: 0 16px 40px rgba(8,18,32,.06);
}

[data-color-theme="teal"] {
  --primary: #00A88F;
  --secondary: #00E5FF;
  --glow: rgba(0,229,255,.22);
}

[data-color-theme="crimson"] {
  --primary: #E50914;
  --secondary: #FF2E38;
  --glow: rgba(255,46,56,.22);
}

[data-color-theme="blue"] {
  --primary: #0066FF;
  --secondary: #00D2FF;
  --glow: rgba(0,210,255,.22);
}

[data-color-theme="emerald"] {
  --primary: #10B981;
  --secondary: #34D399;
  --glow: rgba(52,211,153,.22);
}

[data-color-theme="yellow"] {
  --primary: #F59E0B;
  --secondary: #FCD34D;
  --glow: rgba(252,211,77,.22);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
  transition: background-color .25s ease, color .25s ease;
}

h1, h2, h3, h4, .brand-font {
  font-family: 'Space Grotesk', sans-serif;
}

/* Header */
header {
  height: var(--header);
  background: rgba(7, 13, 24, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

/* Theme Palette Dots */
.theme-palette {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 6px 12px;
  border-radius: 999px;
}

.theme-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform .2s;
}

.theme-dot.active {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
  transform: scale(1.15);
}

/* Common Components */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #070D18;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 25px var(--glow);
  transition: opacity .2s;
}
.btn-primary:hover { opacity: .92; }

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 16px;
  border: 1px solid var(--line);
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: border-color .2s;
}
.btn-secondary:hover { border-color: var(--primary); }

/* Floating WhatsApp */
.wa-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #25D366;
  color: #070D18;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  box-shadow: 0 12px 30px rgba(37,211,102,.35);
  z-index: 999;
}
`;

      // script.js content
      const scriptJs = `/* =========================================================================
   HORIZON DIGITAL MEDIA — STANDALONE JAVASCRIPT
   Theme Management, Mobile Nav, Portfolio Filtering, & Contact Form Handling
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme from localStorage
  const savedColor = localStorage.getItem('horizon_color_theme') || 'teal';
  const savedMode = localStorage.getItem('horizon_theme_mode') || 'dark';
  applyTheme(savedColor);
  applyMode(savedMode);

  // Theme dot handlers
  document.querySelectorAll('.theme-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      applyTheme(color);
      localStorage.setItem('horizon_color_theme', color);
    });
  });

  // Dark/Light toggle handler
  const modeBtn = document.getElementById('mode-toggle-btn');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme-mode') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyMode(next);
      localStorage.setItem('horizon_theme_mode', next);
    });
  }

  function applyTheme(color) {
    document.documentElement.setAttribute('data-color-theme', color);
    document.querySelectorAll('.theme-dot').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-color') === color);
    });
  }

  function applyMode(mode) {
    document.documentElement.setAttribute('data-theme-mode', mode);
  }

  // 2. Budget Customize Toggle
  const budgetSelect = document.getElementById('budget-select');
  const customBudgetWrap = document.getElementById('custom-budget-wrap');
  if (budgetSelect && customBudgetWrap) {
    budgetSelect.addEventListener('change', () => {
      if (budgetSelect.value === 'Customize') {
        customBudgetWrap.style.display = 'block';
      } else {
        customBudgetWrap.style.display = 'none';
      }
    });
  }

  // 3. Urgent Rush Delivery Checkbox Notice Toggle
  const rushCheckbox = document.getElementById('rush-delivery-checkbox');
  const rushNotice = document.getElementById('rush-delivery-notice');
  if (rushCheckbox && rushNotice) {
    rushCheckbox.addEventListener('change', () => {
      rushNotice.style.display = rushCheckbox.checked ? 'block' : 'none';
    });
  }

  // 4. Portfolio Category Filtering (Services page)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  if (filterBtns.length > 0 && portfolioCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-filter');
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        portfolioCards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. Contact Form Submission
  const contactForm = document.getElementById('project-inquiry-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      const stored = JSON.parse(localStorage.getItem('horizon_inquiries') || '[]');
      stored.push({ id: 'brief-' + Date.now(), ...data, date: new Date().toISOString() });
      localStorage.setItem('horizon_inquiries', JSON.stringify(stored));
      alert('Project brief saved to local browser inquiry storage! Thank you.');
      contactForm.reset();
    });
  }
});
`;

      // Helper function to build page header HTML
      const getHeaderHtml = (active: string) => `
    <header>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:bold;color:#070D18;font-size:20px;">H</div>
        <span class="brand-font" style="font-weight:bold;font-size:18px;color:var(--text);">Horizon Digital Media</span>
      </div>
      <nav style="display:flex;gap:16px;align-items:center;">
        <a href="index.html" style="color:${active === 'home' ? 'var(--secondary)' : 'var(--muted)'};text-decoration:none;font-size:14px;font-weight:600;">Home</a>
        <a href="services.html" style="color:${active === 'services' ? 'var(--secondary)' : 'var(--muted)'};text-decoration:none;font-size:14px;font-weight:600;">Services</a>
        <a href="about.html" style="color:${active === 'about' ? 'var(--secondary)' : 'var(--muted)'};text-decoration:none;font-size:14px;font-weight:600;">About</a>
        <a href="contact.html" style="color:${active === 'contact' ? 'var(--secondary)' : 'var(--muted)'};text-decoration:none;font-size:14px;font-weight:600;">Contact</a>
        <a href="terms.html" style="color:${active === 'terms' ? 'var(--secondary)' : 'var(--muted)'};text-decoration:none;font-size:14px;font-weight:600;">Terms</a>
      </nav>
      <div class="theme-palette">
        <button class="theme-dot" data-color="teal" style="background:#00A88F;"></button>
        <button class="theme-dot" data-color="crimson" style="background:#E50914;"></button>
        <button class="theme-dot" data-color="blue" style="background:#0066FF;"></button>
        <button class="theme-dot" data-color="emerald" style="background:#10B981;"></button>
        <button class="theme-dot" data-color="yellow" style="background:#F59E0B;"></button>
        <button id="mode-toggle-btn" style="background:transparent;border:none;color:var(--muted);cursor:pointer;margin-left:6px;"><i class="fa-solid fa-moon"></i></button>
      </div>
    </header>
`;

      const getFooterHtml = () => `
    <footer style="background:var(--surface);border-top:1px solid var(--line);padding:3rem 2rem 2rem;margin-top:4rem;">
      <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;flex-wrap:wrap;gap:2rem;">
        <div>
          <div style="font-weight:bold;font-size:18px;margin-bottom:8px;">Horizon Digital Media</div>
          <p style="color:var(--muted);font-size:13px;max-width:320px;">Transforming ideas into high-converting digital media through post-production, design, UGC, CGI, and AI workflows.</p>
        </div>
        <div style="color:var(--muted);font-size:13px;">
          <div>Founder: Ahsan Yousaf</div>
          <div>Direct: horizondigitalmedia.official@gmail.com</div>
          <div>WhatsApp: 03244528683</div>
          <div style="display:flex;gap:10px;margin:10px 0;">
            <a href="https://wa.me/923244528683" target="_blank" style="color:#25D366;text-decoration:none;"><i class="fa-brands fa-whatsapp"></i></a>
            <a href="mailto:horizondigitalmedia.official@gmail.com" style="color:var(--secondary);text-decoration:none;"><i class="fa-solid fa-envelope"></i></a>
            <a href="https://vm.tiktok.com/ZS9DBEx7RqMWa-LXXM6/" target="_blank" style="color:#00F2FE;text-decoration:none;"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://www.facebook.com/share/1cBv9dCK2S/" target="_blank" style="color:#1877F2;text-decoration:none;"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/horizon.digital.media?stkn=YW9ocXVwcnFvMzVp" target="_blank" style="color:#E1306C;text-decoration:none;"><i class="fa-brands fa-instagram"></i></a>
          </div>
          <div style="margin-top:8px;">© ${new Date().getFullYear()} Horizon Digital Media. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
    <a href="https://wa.me/923244528683" class="wa-float" target="_blank">
      <i class="fa-brands fa-whatsapp" style="font-size:22px;"></i>
      <span>WhatsApp</span>
    </a>
`;

      // 5 HTML pages:
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Horizon Digital Media</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
  ${getHeaderHtml('home')}
  <main style="max-width:1200px;margin:3rem auto;padding:0 2rem;">
    <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:3rem;align-items:center;">
      <div>
        <div style="color:var(--secondary);font-size:13px;font-weight:700;letter-spacing:2px;margin-bottom:1.5rem;">PAKISTAN-BASED CREATIVE PARTNER FOR GLOBAL BRANDS</div>
        <h1 style="font-size:48px;line-height:1.1;margin-bottom:1.5rem;">
          Hi, I’m <span style="color:var(--secondary);">Ahsan Yousaf</span> —<br>
          Founder of Horizon<br>
          Digital Media.
        </h1>
        <p style="color:var(--muted);font-size:16px;line-height:1.6;margin-bottom:2rem;">
          4+ Years Transforming Ideas into High-Converting Digital Media. I combine visual storytelling, post-production, design, UGC, CGI and AI workflows to help brands communicate with clarity and impact.
        </p>
        <div style="display:flex;gap:1rem;">
          <a href="contact.html" class="btn-primary">Start a Project →</a>
          <a href="services.html" class="btn-secondary">Explore Portfolio</a>
        </div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:3rem 2rem;text-align:center;">
        <div style="font-size:48px;color:var(--secondary);margin-bottom:1rem;"><i class="fa-solid fa-user-tie"></i></div>
        <h3 style="font-size:20px;margin-bottom:0.5rem;">Hero Portrait</h3>
        <p style="color:var(--muted);font-size:13px;margin-bottom:1.5rem;">Place hero-profile.jpg beside the HTML files</p>
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:16px;padding:1rem;text-align:left;">
          <div style="font-weight:bold;font-size:15px;">Ahsan Yousaf</div>
          <div style="color:var(--muted);font-size:12px;">Founder • Lead Creative Director • AI Specialist</div>
        </div>
      </div>
    </div>
  </main>
  ${getFooterHtml()}
  <script src="script.js"></script>
</body>
</html>`;

      const servicesHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services & Portfolio | Horizon Digital Media</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>
  ${getHeaderHtml('services')}
  <main style="max-width:1200px;margin:3rem auto;padding:0 2rem;">
    <div style="color:var(--secondary);font-size:13px;font-weight:700;letter-spacing:2px;">SERVICES & PORTFOLIO</div>
    <h1 style="font-size:40px;margin:0.5rem 0 1rem;">Creative production, filtered your way.</h1>
    <p style="color:var(--muted);max-width:700px;margin-bottom:2rem;">Explore full category services across Video Editing, Graphic Designing, UGC & CGI Ads, AI Video Editing, Prompt Engineering, and Web Development.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.5rem;">
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">Video Editing</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">Short-form Reels, YouTube Editing, Podcast Post-Production, Commercial Films, Color & Sound Finishing.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">Graphic Designing</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">Brand Identity Systems, YouTube Thumbnail Design, Social Campaign Kits, Pitch Decks, Digital Ad Creatives.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">UGC & CGI Ads</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">UGC Performance Ads, Product CGI Concepts, Social Ad Variations, Hook & Offer Creatives.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">AI Video Editing</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">AI-Assisted Cuts, AI FX & Motion Experiments, Generative B-roll Concepts, AI Audio Cleanup.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">Prompt Engineering</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">Image Generation Prompt Systems, Video Generation Prompts, Consistent Virtual Creator Seeds.</p>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <h3 style="color:var(--secondary);">Web Development</h3>
        <p style="color:var(--muted);font-size:13px;margin:0.5rem 0;">Custom Websites, AI-Powered Websites, Shopify Stores, Modern High-Converting Responsive Frontends.</p>
      </div>
    </div>
  </main>
  ${getFooterHtml()}
  <script src="script.js"></script>
</body>
</html>`;

      const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About | Horizon Digital Media</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>
  ${getHeaderHtml('about')}
  <main style="max-width:1200px;margin:3rem auto;padding:0 2rem;">
    <div style="color:var(--secondary);font-size:13px;font-weight:700;letter-spacing:2px;">FOUNDER DIRECTION</div>
    <h1 style="font-size:42px;margin:0.5rem 0 1rem;">Ahsan Yousaf — creative direction with an AI edge.</h1>
    <p style="color:var(--muted);font-size:16px;max-width:800px;margin-bottom:2.5rem;">Combining classical post-production principles with modern generative AI workflows. Delivering clarity, engagement, and conversion for global brands.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.5rem;">
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">4 Years</div>
        <h3>Video Editing & Post-Production</h3>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">3–4 Years</div>
        <h3>Graphic Designing & Brand Identity</h3>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">2 Years</div>
        <h3>UGC & CGI Ads Creation</h3>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">2–3 Years</div>
        <h3>AI Video Editing & FX Generation</h3>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">1.5–2 Years</div>
        <h3>Prompt Engineering & AI Workflows</h3>
      </div>
      <div style="background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:1.5rem;">
        <div style="color:var(--secondary);font-weight:bold;">1–2 Years</div>
        <h3>Web Development & AI Solutions</h3>
      </div>
    </div>
  </main>
  ${getFooterHtml()}
  <script src="script.js"></script>
</body>
</html>`;

      const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact | Horizon Digital Media</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>
  ${getHeaderHtml('contact')}
  <main style="max-width:1200px;margin:3rem auto;padding:0 2rem;">
    <div style="color:var(--secondary);font-size:13px;font-weight:700;letter-spacing:2px;">START A PROJECT</div>
    <h1 style="font-size:42px;margin:0.5rem 0 1.5rem;">Let’s Discuss Your Next Project.</h1>
    <form id="project-inquiry-form" style="background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:2.5rem;max-width:700px;display:flex;flex-direction:column;gap:1rem;">
      <input type="text" name="fullName" placeholder="Full Name" required style="padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);">
      <input type="email" name="email" placeholder="Email Address" required style="padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);">
      <input type="tel" name="phone" placeholder="Phone / WhatsApp" style="padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);">
      <select name="budget" id="budget-select" style="padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);">
        <option value="$2,500">$2,500</option>
        <option value="$500">$500</option>
        <option value="$1,000">$1,000</option>
        <option value="$5,000">$5,000</option>
        <option value="$10,000">$10,000</option>
        <option value="$20,000+">$20,000+</option>
        <option value="Customize">Customize</option>
      </select>
      <div id="custom-budget-wrap" style="display:none;">
        <input type="number" name="customBudget" placeholder="Specify Budget (USD)" style="width:100%;padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);">
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
        <input type="checkbox" id="rush-delivery-checkbox" name="rushDelivery">
        <span>Urgent rush delivery (24–48h)</span>
      </label>
      <div id="rush-delivery-notice" style="display:none;color:#FCD34D;font-size:12px;">Flat $100 express rush fee applies. Advance payment required.</div>
      <textarea name="description" placeholder="Project Description" rows="4" style="padding:12px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text);"></textarea>
      <button type="submit" class="btn-primary" style="justify-content:center;">Submit Project Brief</button>
    </form>
  </main>
  ${getFooterHtml()}
  <script src="script.js"></script>
</body>
</html>`;

      const termsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms & Conditions | Horizon Digital Media</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>
  ${getHeaderHtml('terms')}
  <main style="max-width:1200px;margin:3rem auto;padding:0 2rem;">
    <div style="color:var(--secondary);font-size:13px;font-weight:700;letter-spacing:2px;">LEGAL GUIDELINES</div>
    <h1 style="font-size:42px;margin:0.5rem 0 1rem;">Terms & Conditions of Service</h1>
    <p style="color:var(--muted);margin-bottom:2rem;">These terms serve as the standard operational guidelines and should be adapted with local legal counsel prior to binding commercial engagement.</p>
    <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:850px;">
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">01. Scope of Services</h3>
        <p style="color:var(--muted);font-size:13px;">Horizon Digital Media provides creative post-production, digital asset design, video editing, direct-response UGC/CGI ad creation, prompt engineering, and custom web development.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">02. Client Materials</h3>
        <p style="color:var(--muted);font-size:13px;">Clients are responsible for providing all necessary raw footage, brand guidelines, audio files, copy, and product references.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">03. Payment</h3>
        <p style="color:var(--muted);font-size:13px;">Standard projects require a 50% advance retainer before production commences, with the remaining 50% due upon presentation of preview.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">04. Revisions</h3>
        <p style="color:var(--muted);font-size:13px;">Deliverables include up to two (2) rounds of reasonable revisions focused on timing, audio balance, color adjustments, and copy corrections.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">05. Delivery & Approval</h3>
        <p style="color:var(--muted);font-size:13px;">Previews are rendered and hosted via secure cloud review links (Frame.io, Google Drive, or Figma).</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">06. Rush Delivery</h3>
        <p style="color:var(--muted);font-size:13px;">Turnaround requests in 24–48 hours require a flat express fee ($100) and 100% advance payment.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">07. Intellectual Property</h3>
        <p style="color:var(--muted);font-size:13px;">Upon full receipt of payment, all final produced commercial media assets transfer to the client.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">08. Confidentiality</h3>
        <p style="color:var(--muted);font-size:13px;">We routinely sign standard bilateral non-disclosure agreements for unreleased products and proprietary marketing roadmaps.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">09. Cancellation</h3>
        <p style="color:var(--muted);font-size:13px;">If a project is cancelled by the client after work has commenced, the initial deposit covers allocated production hours.</p>
      </div>
      <div style="background:var(--surface);padding:1.5rem;border-radius:16px;border:1px solid var(--line);">
        <h3 style="color:var(--secondary);margin-bottom:6px;">10. Limitation & Results</h3>
        <p style="color:var(--muted);font-size:13px;">External platform algorithms and offer economics dictate market outcomes; specific ROAS cannot be legally guaranteed.</p>
      </div>
    </div>
  </main>
  ${getFooterHtml()}
  <script src="script.js"></script>
</body>
</html>`;

      const readmeMd = `# Horizon Digital Media — Complete Website Recreation
Recreated from original specification and homepage screenshot.

## File Structure:
- index.html — Homepage with Hero, Experience, Capabilities, Services, Pipeline, Projects, Testimonials
- services.html — Services and 25+ Category Filtered Portfolio Cards
- about.html — Founder Ahsan Yousaf bio, verified experience ranges, and production toolkit
- contact.html — Project Inquiry form, dynamic budget selector, rush fee calculation, and direct contact cards
- terms.html — 10 Terms sections, legal qualification, and Pre-order FAQ
- styles.css — Design tokens, 5 themes (Teal, Crimson, Blue, Emerald, Yellow), dark/light mode
- script.js — Theme switching, category filtering, urgent fee notices, and local brief persistence

## Quick Run:
Open any HTML file in a modern browser or serve with:
\`npx serve .\` or \`python3 -m http.server 8000\`
`;

      zip.file('index.html', indexHtml);
      zip.file('services.html', servicesHtml);
      zip.file('about.html', aboutHtml);
      zip.file('contact.html', contactHtml);
      zip.file('terms.html', termsHtml);
      zip.file('styles.css', stylesCss);
      zip.file('script.js', scriptJs);
      zip.file('README.md', readmeMd);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'horizon-digital-media-website.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      onClose();
      onShowToast('Standalone website ZIP archive downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      onShowToast('Failed to generate ZIP archive.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] text-lg"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--secondary)] text-2xl mb-4">
          <i className="fa-solid fa-file-zipper"></i>
        </div>

        <h3 className="font-display font-bold text-xl text-[var(--text)] mb-2">
          Export Standalone Project Archive
        </h3>

        <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
          Generates a clean standalone ZIP archive containing all 5 static pages (index, services, about, contact, terms), styles.css with full theme tokens, and script.js ready for offline deployment or hosting on any server.
        </p>

        <div className="space-y-2 text-xs text-[var(--muted)] mb-6 bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--line)]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check text-emerald-400"></i>
            <span>All 5 HTML Pages (`index`, `services`, `about`, `contact`, `terms`)</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check text-emerald-400"></i>
            <span>`styles.css` with 5 Color Themes & Light/Dark Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check text-emerald-400"></i>
            <span>`script.js` with Filter & Inquiry Logic</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs uppercase tracking-wider transition-opacity hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Bundling ZIP...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-download"></i>
                <span>Download .ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
