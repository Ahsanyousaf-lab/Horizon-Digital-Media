/* =========================================================================
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
