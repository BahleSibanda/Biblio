// js/auth.js
// Unified, safe Firebase Authentication logic
// Works with modular Firebase SDK and your main.js

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Ensure Firebase App is already initialized in index.html
const auth = getAuth(window.firebaseApp);

// ---- DOM Elements ----
const authModal = document.getElementById("auth-modal");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const closeAuth = document.querySelector(".close-auth-modal");

// ---- State ----
let currentMode = "login"; // 'login' or 'signup'

// ---- Modal Handling ----
function openAuthModal(mode = "login") {
  if (!authModal) return;
  currentMode = mode;
  authModal.classList.add("show");
  authModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Toggle forms
  if (mode === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.classList.remove("show");
  authModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Close modal events
if (closeAuth) {
  closeAuth.addEventListener("click", () => closeAuthModal());
}

authModal?.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModal();
});

// Switch tabs between login and signup
tabLogin?.addEventListener("click", () => openAuthModal("login"));
tabSignup?.addEventListener("click", () => openAuthModal("signup"));

// ---- Form Submissions ----

// LOGIN
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) return alert("Please fill in all fields");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in successfully");
    closeAuthModal();
  } catch (error) {
    console.error("Login failed:", error.message);
    alert(getFriendlyError(error.code));
  }
});

// SIGNUP
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !email || !password) return alert("Please fill in all fields");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: name });
    console.log("Account created successfully");
    closeAuthModal();
  } catch (error) {
    console.error("Signup failed:", error.message);
    alert(getFriendlyError(error.code));
  }
});

// LOGOUT
async function logout() {
  try {
    await signOut(auth);
    console.log(" Logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}

// ---- Auth State Listener ----
function onAuthChange(callback) {
  if (typeof callback !== "function") return;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(" Auth state: logged in as", user.email);
    } else {
      console.log("Auth state: logged out");
    }
    callback(user);
  });
}

// ---- Helpers ----
function getFriendlyError(code) {
  switch (code) {
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/user-disabled": return "This account has been disabled.";
    case "auth/user-not-found": return "No account found with this email.";
    case "auth/wrong-password": return "Incorrect password.";
    case "auth/email-already-in-use": return "That email is already registered.";
    case "auth/weak-password": return "Password should be at least 6 characters.";
    default: return "Something went wrong. Please try again.";
  }
}

// ---- Expose Safe API ----
window.auth = {
  openAuthModal,
  closeAuthModal,
  logout,
  onAuthChange,
  isLoggedIn: () => !!auth.currentUser,
  getCurrentUser: () => auth.currentUser,
  authInstance: auth
};






