// js/safe-auth.js
// Lightweight safe auth wrapper so the rest of the app won't break
// If your real Firebase auth sets window.auth later, it will replace this stub — that's fine.

(function () {
  // if there is already an auth object, do nothing (we assume it's the real one)
  if (window.auth && typeof window.auth.isLoggedIn === 'function') {
    return;
  }

  // Create a safe fallback stub
  const stubAuth = {
    // returns boolean (false initially)
    isLoggedIn() {
      try {
        return !!(window._firebaseAuthInstance && window._firebaseAuthInstance.currentUser);
      } catch (e) { return false; }
    },

    // Accepts a callback; immediately calls with `null` (no user)
    onAuthChange(cb) {
      if (typeof cb === 'function') {
        try { cb(null); } catch (e) { console.error(e); }
      }
    },

    // Open your auth modal (fallback)
    openAuthModal(tab) {
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.classList.add('show');
        authModal.setAttribute('aria-hidden', 'false');
        // toggle login/signup tabs if available
        if (tab === 'signup') {
          document.getElementById('tab-signup')?.click();
        } else {
          document.getElementById('tab-login')?.click();
        }
      }
    },

    // Logout no-op fallback
    async logout() {
      // If Firebase later sets window.auth, call its logout
      if (window._firebaseAuthInstance && typeof window._firebaseAuthInstance.signOut === 'function') {
        try {
          await window._firebaseAuthInstance.signOut();
        } catch (e) {
          console.warn('Fallback logout failed', e);
        }
      }
    }
  };

  // Install the stub only if window.auth is not set yet
  window.auth = window.auth || stubAuth;

  // Also provide a helper for Firebase module to register the real auth instance:
  // e.g. in your firebase init you can set window._firebaseAuthInstance = getAuth(app);
  // This file won't overwrite window.auth if Firebase sets it later.
  window.__registerFirebaseAuthInstance = function (instance) {
    try {
      window._firebaseAuthInstance = instance;
    } catch (e) {
      console.warn('registerFirebaseAuthInstance failed', e);
    }
  };

})();
