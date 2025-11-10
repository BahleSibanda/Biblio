// js/auth.js
// Handles login, signup, and auth state updates with Firebase

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const auth = window.auth;

// ===== Modal Helpers =====
function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
}

function openAuthModal(tab = "login") {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (tab === "signup") {
    tabSignup?.classList.add("active");
    tabLogin?.classList.remove("active");
    signupForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");
  } else {
    tabLogin?.classList.add("active");
    tabSignup?.classList.remove("active");
    loginForm?.classList.remove("hidden");
    signupForm?.classList.add("hidden");
  }
}

// ===== Navbar Updater =====
function updateNavbarForUser(user) {
  const ua = document.querySelector(".user-actions");
  if (!ua) return;

  if (user) {
    ua.innerHTML = `
      <span style="font-weight:700;color:var(--dark-azure);margin-right:.6rem;">
        ${user.displayName || user.email}
      </span>
      <button id="logout-btn" class="cta">LOG OUT</button>
    `;
  } else {
    ua.innerHTML = `
      <button id="open-login-modal" class="cta">LOG IN</button>
      <button id="open-signup-modal" class="cta">SIGN UP</button>
    `;
  }

  // Notify other scripts that .user-actions changed
  window.dispatchEvent(new CustomEvent("userActionsUpdated"));

  // Bind logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
    });
  }
}

// ===== Signup =====
const signupForm = document.getElementById("signup-form");
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    alert(`Signup successful! Welcome, ${name || email}.`);
    closeAuthModal();
    updateNavbarForUser(cred.user);
    signupForm.reset();
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
});

// ===== Login =====
const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    alert(`Welcome back, ${cred.user.displayName || cred.user.email}!`);
    closeAuthModal();
    updateNavbarForUser(cred.user);
    loginForm.reset();
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// ===== Track Auth Changes =====
onAuthStateChanged(auth, (user) => {
  console.log(user ? `User logged in: ${user.email}` : "No user logged in");
  updateNavbarForUser(user);
});

// Expose helpers globally
window.authHelpers = { closeAuthModal, openAuthModal, updateNavbarForUser };





