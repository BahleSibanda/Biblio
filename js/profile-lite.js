// js/profile-lite.js
(function () {
  function setUserUI(user) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl) nameEl.textContent = user?.displayName || user?.name || 'Your name';
    if (emailEl) emailEl.textContent = user?.email || '';
  }

  // wire logout button
  function wireButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('#profile-logout') || e.target.closest('#profile-logout')) {
        e.preventDefault();
        if (window.auth && typeof window.auth.logout === 'function') {
          window.auth.logout();
        } else {
          console.log('No auth.logout available');
        }
      }
      if (e.target.matches('#profile-edit') || e.target.closest('#profile-edit')) {
        e.preventDefault();
        // open settings or show inline edit
        const modal = document.getElementById('settings-modal') || document.getElementById('auth-modal');
        if (modal) {
          modal.classList.add('show');
          modal.setAttribute('aria-hidden', 'false');
        }
      }
    });
  }

  function init() {
    wireButtons();
    // subscribe to auth changes (stub-friendly)
    if (window.auth && typeof window.auth.onAuthChange === 'function') {
      window.auth.onAuthChange((user) => {
        setUserUI(user || null);
      });
    } else {
      setUserUI(null);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
