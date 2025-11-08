// js/auth.js
// Simple client-side auth stub: login/signup UI, session saved to localStorage.
// This is NOT secure auth for production — it's a local stub to gate UI.

(function () {
  const AUTH_KEY = 'biblio_current_user_v1';
  const authModal = document.getElementById('auth-modal');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const closeAuthBtns = document.querySelectorAll('.close-auth-modal');

  // Local event listeners array for auth change
  let listeners = [];

  function notify(user) {
    listeners.forEach(fn => {
      try { fn(user); } catch (e) { console.warn(e); }
    });
  }

  function saveUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    notify(user);
  }

  function clearUser() {
    localStorage.removeItem(AUTH_KEY);
    notify(null);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getUser();
  }

  // Show auth modal; optional tab param 'login'|'signup'
  function openAuthModal(tab) {
    if (!authModal) return;
    authModal.classList.add('show');
    authModal.setAttribute('aria-hidden', 'false');
    if (tab === 'signup') showSignup();
    else showLogin();
    // focus first input
    setTimeout(() => {
      const first = authModal.querySelector('input');
      if (first) first.focus();
    }, 50);
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('show');
    authModal.setAttribute('aria-hidden', 'true');
  }

  // Tab controls
  function showLogin() {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
  }
  function showSignup() {
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabSignup) tabSignup.classList.add('active');
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.remove('hidden');
  }

  // Form handlers (simple client-side stubs)
  function handleLoginSubmit(e) {
    e.preventDefault();
    const email = (document.getElementById('login-email') || {}).value || '';
    const pass = (document.getElementById('login-password') || {}).value || '';
    if (!email || !pass) {
      alert('Please enter email and password (this demo uses any credentials).');
      return;
    }
    // In demo, we accept any combo and store a simple user object
    const user = { email, name: email.split('@')[0] || 'Reader' };
    saveUser(user);
    closeAuthModal();
    // call any UI refresh (main.js listens)
  }

  function handleSignupSubmit(e) {
    e.preventDefault();
    const name = (document.getElementById('signup-name') || {}).value || '';
    const email = (document.getElementById('signup-email') || {}).value || '';
    const pass = (document.getElementById('signup-password') || {}).value || '';
    if (!name || !email || !pass) {
      alert('Please complete the sign up form.');
      return;
    }
    // Demo: pretend account created and log in
    const user = { email, name };
    saveUser(user);
    closeAuthModal();
  }

  // Logout
  function logout() {
    clearUser();
    // optionally refresh UI
  }

  // Public API: onAuthChange(fn)
  function onAuthChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  // Boot: wire UI events
  function init() {
    // restore session and notify
    const existing = getUser();
    notify(existing);

    // tab clicks
    if (tabLogin) tabLogin.addEventListener('click', showLogin);
    if (tabSignup) tabSignup.addEventListener('click', showSignup);

    // form submits
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (signupForm) signupForm.addEventListener('submit', handleSignupSubmit);

    // close auth modal buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.close-auth-modal')) closeAuthModal();
    });

    // click outside content closes
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }
  }

  // Expose API
  window.auth = {
    init,
    openAuthModal,
    closeAuthModal,
    isLoggedIn,
    getUser,
    logout,
    onAuthChange,
  };

  // Auto-init
  document.addEventListener('DOMContentLoaded', init);
})();

