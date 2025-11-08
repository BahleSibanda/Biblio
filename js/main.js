// js/main.js
// Core app: modal helpers, routing, login-gate wiring, basic page loader

(function () {
  // Cached DOM
  const pageContent = document.getElementById('page-content');
  const homePage = document.getElementById('home-page');
  const authSelector = window.REQUIRES_LOGIN_SELECTORS || '.requires-login';

  // Utility: open a modal by id (adds .show and aria)
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    // trap focus lightly (simple)
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  // Utility: close modal element (by element or id)
  function closeModal(modalOrId) {
    const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Close all modals (generic)
  function closeAllModals() {
    document.querySelectorAll('.modal.show, .auth-modal.show').forEach(m => {
      closeModal(m);
    });
  }

  // Simple page loader: if pageName === 'home' show home, else try to fetch pages/<page>.html
  async function loadPage(pageName) {
    if (!pageName || pageName === 'home') {
      // show home
      if (homePage) homePage.style.display = '';
      if (pageContent) pageContent.innerHTML = '';
      // update nav active classes
      updateActiveNav(pageName || 'home');
      return;
    }

    // For protected pages, check auth (auth.js exports isLoggedIn)
    if (['profile','settings','following','notifications'].includes(pageName) && window.auth && !window.auth.isLoggedIn()) {
      // open login modal instead
      if (window.auth && typeof window.auth.openAuthModal === 'function') {
        window.auth.openAuthModal();
      } else {
        openModal('auth-modal');
      }
      return;
    }

    // hide home
    if (homePage) homePage.style.display = 'none';

    // try to load page fragment
    try {
      const resp = await fetch(`pages/${pageName}.html`);
      if (!resp.ok) throw new Error('Page not found');
      const text = await resp.text();
      // parse and extract meaningful fragment
      const tmp = document.createElement('div');
      tmp.innerHTML = text;
      const fragment = tmp.querySelector(`.${pageName}-page`) || tmp.querySelector(`#${pageName}-page`) || tmp;
      pageContent.innerHTML = fragment ? fragment.innerHTML : text;
      updateActiveNav(pageName);
      // attempt to load page-specific script
      const scriptSrc = `js/${pageName}.js`;
      // avoid duplicate insertion
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const s = document.createElement('script');
        s.src = scriptSrc;
        s.defer = true;
        s.onload = () => { console.log(`${pageName} script loaded`); };
        document.body.appendChild(s);
      }
    } catch (err) {
      console.warn('Load page error', err);
      pageContent.innerHTML = `<div class="content-box"><h2>Page Not Found</h2><p>We couldn't load that page.</p></div>`;
    }
  }

  // Update nav active states - both top nav and side menu
  function updateActiveNav(page) {
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.dataset.page === page) a.classList.add('active');
      else a.classList.remove('active');
    });
    document.querySelectorAll('.side-menu .side-item').forEach(a => {
      if (a.dataset.page === page) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function bindNavLinks() {
    // top nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        loadPage(page);
      });
    });

    // side menu links
    document.querySelectorAll('.side-menu .side-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        // special: search button has id
        if (link.id === 'search-modal-btn') {
          openModal('search-modal');
          return;
        }
        // check requires-login by class
        if (link.classList.contains('requires-login')) {
          // check auth
          if (window.auth && !window.auth.isLoggedIn()) {
            window.auth.openAuthModal();
            return;
          }
        }
        if (page) loadPage(page);
      });
    });
  }

  // Wire modal close buttons (elements with .close-modal and .close-auth-modal)
  function wireModalControls() {
    document.addEventListener('click', (e) => {
      // close-modal buttons
      if (e.target.matches('.close-modal') || e.target.closest('.close-modal')) {
        const modal = e.target.closest('.modal');
        if (modal) closeModal(modal);
      }
      // close auth modal
      if (e.target.matches('.close-auth-modal') || e.target.closest('.close-auth-modal')) {
        const auth = document.querySelector('.auth-modal');
        if (auth) closeModal(auth);
      }
    });

    // click outside modal content closes it
    document.querySelectorAll('.modal, .auth-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Escape closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  // Init app on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    bindNavLinks();
    wireModalControls();

    // If auth module exists, set a simple listener to update nav when login state changes
    if (window.auth && typeof window.auth.onAuthChange === 'function') {
      window.auth.onAuthChange((user) => {
        if (user) {
          // show quick UI change: replace login buttons with user name + logout (if you want)
          const ua = document.querySelector('.user-actions');
          if (ua) {
            ua.innerHTML = `<span style="font-weight:700;color:var(--dark-azure);margin-right:.6rem;">${user.name || user.email}</span>
                            <button id="logout-btn" class="cta">LOG OUT</button>`;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', () => {
              window.auth.logout();
              // refresh UI back to login/signup
              const ua2 = document.querySelector('.user-actions');
              if (ua2) ua2.innerHTML = `<button id="open-login-modal" class="cta">LOG IN</button><button id="open-signup-modal" class="cta">SIGN UP</button>`;
              // re-bind auth buttons
              bindAuthOpeners();
            });
          }
        } else {
          // clear to default
          const ua = document.querySelector('.user-actions');
          if (ua) ua.innerHTML = `<button id="open-login-modal" class="cta">LOG IN</button><button id="open-signup-modal" class="cta">SIGN UP</button>`;
          bindAuthOpeners();
        }
      });
    }

    bindAuthOpeners();

    // If a global home initializer exists, call it
    if (window.home && typeof window.home.initHome === 'function') {
      window.home.initHome();
    }
  });

  // Bind openers for the auth modal (buttons in top nav)
  function bindAuthOpeners() {
    const openLogin = document.getElementById('open-login-modal');
    const openSignup = document.getElementById('open-signup-modal');
    if (openLogin) openLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.auth && typeof window.auth.openAuthModal === 'function') {
        window.auth.openAuthModal('login');
      } else openModal('auth-modal');
    });
    if (openSignup) openSignup.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.auth && typeof window.auth.openAuthModal === 'function') {
        window.auth.openAuthModal('signup');
      } else openModal('auth-modal');
    });
  }

  // Expose certain functions globally for other modules
  window.app = {
    openModal,
    closeModal,
    closeAllModals,
    loadPage,
    updateActiveNav,
  };
})();

