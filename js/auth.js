// js/auth.js
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  // put your Firebase config keys here
};

// ✅ Initialize Firebase app and get auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Export what other files need
export {
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
};



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

      // ✅ Update display name
      await updateProfile(user, { displayName: name });

      alert(`Signup successful! Welcome, ${name}.`);
      signupForm.reset();

      // ✅ Hide modal smoothly
      gsap.to("#auth-modal", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          document.getElementById("auth-modal").style.display = "none";
        }
      });
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

import { auth } from "./firebase.js"; // make sure auth is imported correctly
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const signupLink = document.getElementById("signup-link");
const loginLink = document.getElementById("login-link");
const userGreeting = document.getElementById("user-greeting");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // ✅ Someone is logged in
    const userName = user.displayName || user.email.split('@')[0];

    // Hide login/signup links
    signupLink.style.display = "none";
    loginLink.style.display = "none";

    // Show greeting
    userGreeting.style.display = "inline";
    userGreeting.textContent = `Hey, ${userName}! 👋`;
  } else {
    // ❌ User signed out
    signupLink.style.display = "inline";
    loginLink.style.display = "inline";
    userGreeting.style.display = "none";
  }
});

//LOGOUT
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("You've logged out successfully!");
      // Optionally hide the greeting immediately:
      document.getElementById("user-greeting")?.classList.add("hidden");
      document.getElementById("open-login-modal")?.classList.remove("hidden");
      document.getElementById("open-signup-modal")?.classList.remove("hidden");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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



