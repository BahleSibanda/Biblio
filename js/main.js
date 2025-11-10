// js/main.js
// Core app: modal helpers, routing, login-gate wiring, basic page loader

// Inject shared top + side navigation if missing
(function injectNav() {
  const navHtml = `
  <nav class="top-nav" role="navigation" aria-label="Main Navigation">
    <div class="logo" id="site-logo">
      <i class="fas fa-book-open" aria-hidden="true"></i>
      <span>Biblio</span>
    </div>
    <div class="nav-links" role="menubar">
      <a href="#" role="menuitem" data-page="home">HOME</a>
      <a href="#" role="menuitem" class="requires-login" data-page="bookclubs">BOOKCLUBS</a>
      <a href="#" role="menuitem" class="requires-login" data-page="following">FOLLOWING</a>
    </div>
    <div class="user-actions" id="global-user-actions">
      <button id="open-login-modal" class="cta">LOG IN</button>
      <button id="open-signup-modal" class="cta">SIGN UP</button>
    </div>
  </nav>

  <div class="side-menu" role="navigation" aria-label="Side">
    <a href="#" class="side-item" data-page="home" title="Home"><i class="fas fa-home icon"></i></a>
    <a href="#" id="search-modal-btn" class="side-item" title="Search"><i class="fas fa-search icon"></i></a>
    <a href="#" class="side-item requires-login" data-page="notifications" title="Notifications"><i class="fas fa-bell icon"></i><span class="notification-badge">3</span></a>
    <a href="#" class="side-item requires-login" data-page="profile" title="Profile"><i class="fas fa-user icon"></i></a>
    <a href="#" class="side-item requires-login" data-page="settings" title="Settings"><i class="fas fa-cog icon"></i></a>
  </div>
  `;

  if (!document.querySelector(".top-nav")) {
    document.body.insertAdjacentHTML("afterbegin", navHtml);
  }
})();

(function () {
  // Cached DOM
  const pageContent = document.getElementById("page-content");
  const homePage = document.getElementById("home-page");

  // ===== MODAL HELPERS =====
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    const focusable = modal.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (focusable) focusable.focus();
  }

  function closeModal(modalOrId) {
    const modal =
      typeof modalOrId === "string"
        ? document.getElementById(modalOrId)
        : modalOrId;
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  function closeAllModals() {
    document
      .querySelectorAll(".modal.show, .auth-modal.show")
      .forEach((m) => closeModal(m));
  }

  // ===== PAGE LOADER =====
  async function loadPage(pageName) {
    if (!pageName || pageName === "home") {
      if (homePage) homePage.style.display = "";
      if (pageContent) pageContent.innerHTML = "";
      updateActiveNav(pageName || "home");
      return;
    }

    // Protected pages
    if (
      ["profile", "settings", "following", "notifications"].includes(pageName) &&
      window.auth &&
      !window.auth.currentUser
    ) {
      openModal("auth-modal");
      return;
    }

    if (homePage) homePage.style.display = "none";

    try {
      const resp = await fetch(`pages/${pageName}.html`);
      if (!resp.ok) throw new Error("Page not found");
      const text = await resp.text();
      const tmp = document.createElement("div");
      tmp.innerHTML = text;
      const fragment =
        tmp.querySelector(`.${pageName}-page`) ||
        tmp.querySelector(`#${pageName}-page`) ||
        tmp;
      pageContent.innerHTML = fragment ? fragment.innerHTML : text;
      updateActiveNav(pageName);

      const scriptSrc = `js/${pageName}.js`;
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const s = document.createElement("script");
        s.src = scriptSrc;
        s.defer = true;
        s.onload = () => console.log(`${pageName} script loaded`);
        document.body.appendChild(s);
      }
    } catch (err) {
      console.warn("Load page error", err);
      pageContent.innerHTML = `<div class="content-box"><h2>Page Not Found</h2><p>We couldn't load that page.</p></div>`;
    }
  }

  // ===== NAV STATE =====
  function updateActiveNav(page) {
    document.querySelectorAll(".nav-links a").forEach((a) => {
      if (a.dataset.page === page) a.classList.add("active");
      else a.classList.remove("active");
    });
    document.querySelectorAll(".side-menu .side-item").forEach((a) => {
      if (a.dataset.page === page) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  // ===== NAVIGATION BINDINGS =====
  function bindNavLinks() {
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        loadPage(page);
      });
    });

    document.querySelectorAll(".side-menu .side-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;

        if (link.id === "search-modal-btn") {
          openModal("search-modal");
          return;
        }

        if (link.classList.contains("requires-login") && !auth.currentUser) {
          openModal("auth-modal");
          return;
        }

        if (page) loadPage(page);
      });
    });
  }

  // ===== MODAL EVENT WIRING =====
  function wireModalControls() {
    document.addEventListener("click", (e) => {
      if (e.target.matches(".close-modal") || e.target.closest(".close-modal")) {
        const modal = e.target.closest(".modal");
        if (modal) closeModal(modal);
      }
      if (
        e.target.matches(".close-auth-modal") ||
        e.target.closest(".close-auth-modal")
      ) {
        const auth = document.querySelector(".auth-modal");
        if (auth) closeModal(auth);
      }
    });

    document.querySelectorAll(".modal, .auth-modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllModals();
    });
  }

  // ===== AUTH MODAL BUTTONS =====
  function bindAuthOpeners() {
    const openLogin = document.getElementById("open-login-modal");
    const openSignup = document.getElementById("open-signup-modal");
    if (openLogin)
      openLogin.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("auth-modal");
        const tabLogin = document.getElementById("tab-login");
        const tabSignup = document.getElementById("tab-signup");
        const loginForm = document.getElementById("login-form");
        const signupForm = document.getElementById("signup-form");
        if (tabLogin && tabSignup && loginForm && signupForm) {
          tabLogin.classList.add("active");
          tabSignup.classList.remove("active");
          loginForm.classList.remove("hidden");
          signupForm.classList.add("hidden");
        }
      });

    if (openSignup)
      openSignup.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("auth-modal");
        const tabLogin = document.getElementById("tab-login");
        const tabSignup = document.getElementById("tab-signup");
        const loginForm = document.getElementById("login-form");
        const signupForm = document.getElementById("signup-form");
        if (tabLogin && tabSignup && loginForm && signupForm) {
          tabSignup.classList.add("active");
          tabLogin.classList.remove("active");
          signupForm.classList.remove("hidden");
          loginForm.classList.add("hidden");
        }
      });
  }

  // ===== INIT =====
  // Init app on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    bindNavLinks();
    wireModalControls();
    bindAuthOpeners();

    // Rebind auth openers when .user-actions changes
    window.addEventListener("userActionsUpdated", () => {
      bindAuthOpeners();
    });

    // If auth module exposes onAuthChange (e.g., from Firebase wrapper)
    if (window.auth && typeof window.auth.onAuthChange === "function") {
      window.auth.onAuthChange((user) => {
        const ua = document.querySelector(".user-actions");
        if (!ua) return;

        if (user) {
          ua.innerHTML = `
            <span style="font-weight:700;color:var(--dark-azure);margin-right:.6rem;">
              ${user.displayName || user.email}
            </span>
            <button id="logout-btn" class="cta">LOG OUT</button>
          `;
          const logoutBtn = document.getElementById("logout-btn");
          logoutBtn?.addEventListener("click", () => {
            if (window.auth.logout) window.auth.logout();
            ua.innerHTML = `
              <button id="open-login-modal" class="cta">LOG IN</button>
              <button id="open-signup-modal" class="cta">SIGN UP</button>
            `;
            bindAuthOpeners();
          });
        } else {
          ua.innerHTML = `
            <button id="open-login-modal" class="cta">LOG IN</button>
            <button id="open-signup-modal" class="cta">SIGN UP</button>
          `;
          bindAuthOpeners();
        }
      });
    }

    // If a global home initializer exists, call it
    if (window.home && typeof window.home.initHome === "function") {
      window.home.initHome();
    }
  });


  // Expose functions globally
  window.app = {
    openModal,
    closeModal,
    closeAllModals,
    loadPage,
    updateActiveNav,
  };
})();


