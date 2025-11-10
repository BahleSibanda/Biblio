// js/main.js
// Robust main app: nav injection was handled elsewhere (or not) — this file wires nav, modals, routing and auth-safe UI updates.

(function () {
  'use strict';

  // ---- Utility: safe DOM query helpers ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---- Cached DOM that may exist or be injected dynamically ----
  let pageContent = null;
  let homePage = null;

  // selector used to mark links that require login
  const authRequiredSelector = window.REQUIRES_LOGIN_SELECTORS || '.requires-login';

  // ---- Modal helpers ----
  function openModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    // focus first focusable item
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalOrId) {
    const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    $$('.modal.show, .auth-modal.show').forEach(m => closeModal(m));
  }

  // ---- Small helper: safe check if user is logged in ----
  // Supports multiple possible shapes:
  // - if auth wrapper exposes isLoggedIn() -> use that
  // - else if window.auth && window.auth.currentUser -> use that (firebase)
  function isUserLoggedIn() {
    try {
      if (window.auth && typeof window.auth.isLoggedIn === 'function') {
        return !!window.auth.isLoggedIn();
      }
      if (window.auth && 'currentUser' in window.auth) {
        return !!window.auth.currentUser;
      }
    } catch (err) {
      console.warn('isUserLoggedIn check failed', err);
    }
    return false;
  }

  // ---- Page loader (client side fragment loader) ----
  async function loadPage(pageName) {
    // ensure cached references exist (nav might be injected later)
    refreshCachedEls();

    // default home behaviour
    if (!pageName || pageName === 'home') {
      if (homePage) homePage.style.display = '';
      if (pageContent) pageContent.innerHTML = '';
      updateActiveNav('home');
      return;
    }

    // protected pages check
    const protectedPages = ['profile', 'settings', 'following', 'notifications'];
    if (protectedPages.includes(pageName) && !isUserLoggedIn()) {
      // Prefer an auth wrapper open function if available
      if (window.auth && typeof window.auth.openAuthModal === 'function') {
        window.auth.openAuthModal();
      } else {
        openModal('auth-modal');
      }
      return;
    }

    // hide home if present
    if (homePage) homePage.style.display = 'none';

    // attempt to fetch page fragment
    try {
      const resp = await fetch(`pages/${pageName}.html`, { cache: 'no-store' });
      if (!resp.ok) throw new Error('Page not found');
      const text = await resp.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = text;
      // prefer specific container class/id inside fragment
      const fragment = tmp.querySelector(`.${pageName}-page`) || tmp.querySelector(`#${pageName}-page`) || tmp;
      if (pageContent) pageContent.innerHTML = fragment ? fragment.innerHTML : text;
      updateActiveNav(pageName);

      // try to load page-specific script safely
      const scriptSrc = `js/${pageName}.js`;
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const s = document.createElement('script');
        s.src = scriptSrc;
        s.defer = true;
        s.onload = () => console.log(`${pageName} script loaded`);
        s.onerror = () => console.warn(`Failed to load script ${scriptSrc}`);
        document.body.appendChild(s);
      }
    } catch (err) {
      console.warn('Load page error', err);
      if (pageContent) pageContent.innerHTML = `<div class="content-box"><h2>Page Not Found</h2><p>We couldn't load that page.</p></div>`;
    }
  }

  // ---- Nav active state updater ----
  function updateActiveNav(page) {
    // top links
    $$('.nav-links a').forEach(a => {
      const dp = a.dataset.page;
      if (dp && dp === page) a.classList.add('active');
      else a.classList.remove('active');
    });
    // side menu links
    $$('.side-menu .side-item').forEach(a => {
      const dp = a.dataset.page;
      if (dp && dp === page) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  // ---- Re-query important elements (nav may be injected after script load) ----
  function refreshCachedEls() {
    pageContent = document.getElementById('page-content') || pageContent;
    homePage = document.getElementById('home-page') || homePage;
  }

  // ---- Bind nav links (top and side). Safe: only intercept if data-page exists ----
  function bindNavLinks() {
    // ensure nav exists
    const topLinks = $$('.nav-links a');
    topLinks.forEach(link => {
      // remove previous listeners (safe)
      link.replaceWith(link.cloneNode(true));
    });

    // reselect after clone
    $$('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        // if element has data-page, intercept and do client side nav
        const page = link.dataset.page;
        if (page) {
          e.preventDefault();
          loadPage(page);
        } else {
          // allow normal href navigation
        }
      });
    });

    // side menu
    $$('.side-menu .side-item').forEach(item => {
      // ensure click handlers are fresh
      item.replaceWith(item.cloneNode(true));
    });

    $$('.side-menu .side-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        // special: search button (it may have id)
        if (item.id === 'search-modal-btn') {
          e.preventDefault();
          if (window.app && typeof window.app.openModal === 'function') window.app.openModal('search-modal');
          else openModal('search-modal');
          return;
        }

        // auth-protected check: if requires-login class present, block if not signed in
        if (item.classList.contains('requires-login') && !isUserLoggedIn()) {
          e.preventDefault();
          if (window.auth && typeof window.auth.openAuthModal === 'function') {
            window.auth.openAuthModal();
          } else {
            openModal('auth-modal');
          }
          return;
        }

        // if data-page present, client navigate
        if (page) {
          e.preventDefault();
          loadPage(page);
        } else {
          // otherwise let default action occur
        }
      });
    });
  }

  // ---- Bind modal close behaviour and outside click/esc ----
  function wireModalControls() {
    // Close by elements with .close-modal or .close-auth-modal
    document.addEventListener('click', (e) => {
      // close-modal
      if (e.target.matches('.close-modal') || e.target.closest('.close-modal')) {
        const modalEl = e.target.closest('.modal');
        if (modalEl) closeModal(modalEl);
      }
      // close-auth-modal
      if (e.target.matches('.close-auth-modal') || e.target.closest('.close-auth-modal')) {
        const authEl = document.querySelector('.auth-modal');
        if (authEl) closeModal(authEl);
      }
    });

    // click outside content closes modal
    $$('.modal, .auth-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // escape key closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  // ---- Auth openers (top nav buttons) ----
  function bindAuthOpeners() {
    // safe re-query elements
    const openLogin = document.getElementById('open-login-modal');
    const openSignup = document.getElementById('open-signup-modal');

    if (openLogin) {
      openLogin.replaceWith(openLogin.cloneNode(true));
    }
    if (openSignup) {
      openSignup.replaceWith(openSignup.cloneNode(true));
    }

    const newOpenLogin = document.getElementById('open-login-modal');
    const newOpenSignup = document.getElementById('open-signup-modal');

    if (newOpenLogin) {
      newOpenLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.auth && typeof window.auth.openAuthModal === 'function') window.auth.openAuthModal('login');
        else openModal('auth-modal');
      });
    }
    if (newOpenSignup) {
      newOpenSignup.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.auth && typeof window.auth.openAuthModal === 'function') window.auth.openAuthModal('signup');
        else openModal('auth-modal');
      });
    }
  }

  // ---- Setup a UI refresh when auth changes
  // This will attempt a few safe methods:
  // 1) if auth wrapper exposes onAuthChange -> subscribe to that
  // 2) else if a custom window.auth.onAuthStateChangedWrapper exists -> use it
  // If none exist, we do not attempt to hook Firebase directly (avoids modular API errors).
  function setupAuthChangeListener() {
    // If an "onAuthChange" helper exists on window.auth, use it
    if (window.auth && typeof window.auth.onAuthChange === 'function') {
      try {
        window.auth.onAuthChange(handleAuthStateChange);
        return;
      } catch (err) {
        console.warn('window.auth.onAuthChange failed', err);
      }
    }

    // If there's a custom global helper (some projects add this)
    if (typeof window.onAuthChange === 'function') {
      try {
        window.onAuthChange(handleAuthStateChange);
        return;
      } catch (err) {
        console.warn('window.onAuthChange failed', err);
      }
    }

    // No safe hook found. We'll still ensure UI reflects currentUser if present.
    refreshAuthUI();
  }

  // Called by the auth change wrapper above (if available)
  function handleAuthStateChange(user) {
    // user might be null or an object with displayName/email
    refreshAuthUI(user);
  }

  // Update top-right user actions area depending on login state
  function refreshAuthUI(userFromEvent) {
    // prefer userFromEvent if provided, else try to read from wrapper
    let user = userFromEvent || null;
    try {
      if (!user && window.auth && 'currentUser' in window.auth) user = window.auth.currentUser || null;
      if (!user && window.auth && typeof window.auth.getCurrentUser === 'function') user = window.auth.getCurrentUser() || null;
    } catch (err) {
      console.warn('refreshAuthUI read failed', err);
    }

    const ua = document.querySelector('.user-actions, #global-user-actions');
    if (!ua) return;

    if (user) {
      // show username + logout
      const nameOrEmail = user.displayName || user.email || (user.name ? user.name : 'User');
      ua.innerHTML = `
        <span style="font-weight:700;color:var(--dark-azure);margin-right:.6rem;">${escapeHtml(nameOrEmail)}</span>
        <button id="logout-btn" class="cta">LOG OUT</button>
      `;
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            if (window.auth && typeof window.auth.logout === 'function') {
              await window.auth.logout();
            } else if (window.auth && typeof window.auth.signOut === 'function') {
              // firebase modular `signOut(auth)` is not available here — expect auth wrapper to handle signOut
              await window.auth.signOut();
            } else {
              console.warn('No logout method found on window.auth');
            }
          } catch (err) {
            console.error('Logout failed', err);
          } finally {
            // revert UI
            ua.innerHTML = `<button id="open-login-modal" class="cta">LOG IN</button><button id="open-signup-modal" class="cta">SIGN UP</button>`;
            bindAuthOpeners();
          }
        });
      }
    } else {
      // show default login/signup
      ua.innerHTML = `<button id="open-login-modal" class="cta">LOG IN</button><button id="open-signup-modal" class="cta">SIGN UP</button>`;
      bindAuthOpeners();
    }
  }

  // small helper to escape displayed strings
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;', '=': '&#61;', '/': '&#47;'
    })[s]);
  }

  // ---- Initializer: called on DOMContentLoaded ----
  function init() {
    refreshCachedEls();
    bindNavLinks();
    wireModalControls();
    bindAuthOpeners();
    setupAuthChangeListener();

    // auto show content-box elements (light reveal) — if you use GSAP elsewhere it can override
    $$('.content-box').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 80 + i * 40);
    });
  }

  // Kick off after DOM ready (nav might be injected earlier)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Expose app for other modules to call ----
  window.app = {
    openModal,
    closeModal,
    closeAllModals,
    loadPage,
    updateActiveNav,
    isUserLoggedIn
  };

})();


