// js/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Initialize Firebase Auth properly
const firebaseAuth = getAuth();

// Create global auth object BEFORE anything else uses it
window.auth = {
  // Return true if logged in
  isLoggedIn() {
    return firebaseAuth.currentUser !== null;
  },

  // Expose real firebase current user
  currentUser() {
    return firebaseAuth.currentUser;
  },

  // Open auth modal (login/signup)
  openAuthModal(mode = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");

    if (mode === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    } else {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  },

  // Logout wrapper
  logout() {
    return signOut(firebaseAuth);
  },

  // Allow main.js to listen for auth changes
  onAuthChange(callback) {
    onAuthStateChanged(firebaseAuth, callback);
  }
};

// SIGNUP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      alert(`Signup successful! Welcome, ${name}.`);

      signupForm.reset();
      const modal = document.getElementById("auth-modal");
      modal.style.display = "none";

    } catch (err) {
      alert("Signup failed: " + err.message);
      console.error(err);
    }
  });
}

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      alert("Login successful!");
      loginForm.reset();

      const modal = document.getElementById("auth-modal");
      modal.style.display = "none";

    } catch (err) {
      alert("Login failed: " + err.message);
      console.error(err);
    }
  });
}

// LOGOUT BUTTON (top navbar)
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => window.auth.logout());
}

// Auth state logs
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) console.log("User logged in:", user.email);
  else console.log("No user logged in");
});




