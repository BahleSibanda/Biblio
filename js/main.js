// js/main.js
// Core app: modal helpers, routing, login-gate wiring, basic page loader

import {
  auth,
  onAuthStateChanged
} from "./auth.js"; // ✅ make sure path is correct (relative to index.html)


function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "flex";
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => (modal.style.display = "none"),
    });
  }
}

// ----------------------
// Navigation logic
// ----------------------
const navLinks = document.querySelectorAll(".nav-links a");
const userActions = document.querySelector(".user-actions");
const openLoginBtn = document.getElementById("open-login-modal");
const openSignupBtn = document.getElementById("open-signup-modal");
const logoutBtn = document.getElementById("logout-btn");

function loadPage(pageName) {
  console.log(`Loading page: ${pageName}`);

  // ✅ Check if protected page
  const protectedPages = ["profile", "settings", "following", "notifications"];
  if (protectedPages.includes(pageName) && !auth.currentUser) {
    openModal("auth-modal");
    return;
  }

  // Load the page content (your normal logic here)
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.remove("active");
  });
  const activeLink = document.querySelector(`[data-page='${pageName}']`);
  if (activeLink) activeLink.classList.add("active");
}

// ----------------------
// Update navbar on login/logout
// ----------------------
function updateNavbar(user) {
  if (user) {
    // ✅ Logged in
    userActions.innerHTML = `
      <span class="welcome">Hey, ${user.displayName || "User"}!</span>
      <button id="logout-btn" class="cta">LOG OUT</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await auth.signOut();
      alert("Logged out!");
    });
  } else {
    // ✅ Logged out
    userActions.innerHTML = `
      <button id="open-login-modal" class="cta">LOG IN</button>
      <button id="open-signup-modal" class="cta">SIGN UP</button>
    `;
    document.getElementById("open-login-modal").addEventListener("click", () => openModal("auth-modal"));
    document.getElementById("open-signup-modal").addEventListener("click", () => openModal("auth-modal"));
  }
}

// ----------------------
// Event listeners
// ----------------------
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const pageName = link.dataset.page;
    loadPage(pageName);
  });
});

// ----------------------
// Auth state listener
// ----------------------
onAuthStateChanged(auth, (user) => {
  updateNavbar(user);
});

// ----------------------
// Initial setup
// ----------------------
updateNavbar(auth.currentUser);


