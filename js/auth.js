// js/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const auth = window.auth;  

// SIGN UP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

try {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  alert(`Signup successful! Welcome, ${name}.`);
  signupForm.reset();

  // ✅ Close the modal
  const authModal = document.getElementById("auth-modal");
  if (authModal) {
    authModal.setAttribute("aria-hidden", "true");
    authModal.style.display = "none";
  }
} catch (err) {
  alert("Signup failed: " + err.message);
  console.error(err);
}

      

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      loginForm.reset();
    } catch (err) {
      alert("Login failed: " + err.message);
      console.error(err);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginFormEl = document.getElementById("login-form");
  const signupFormEl = document.getElementById("signup-form");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");

  // Tab switching
  if (tabLogin && tabSignup && loginFormEl && signupFormEl) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      loginFormEl.classList.remove("hidden");
      signupFormEl.classList.add("hidden");
    });

    tabSignup.addEventListener("click", () => {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      signupFormEl.classList.remove("hidden");
      loginFormEl.classList.add("hidden");
    });
  }
});



// LOGOUT
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Logged out!");
  });
}

// TRACK STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
  } else {
    console.log("No user logged in");
  }
});



