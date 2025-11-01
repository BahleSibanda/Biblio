// =========================
// BIBLIO AUTH SYSTEM (FIXED)
// =========================

// -------------------------
// ✅ GSAP Intro Animation
// -------------------------
window.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".auth-wrapper");
  const activeForm = document.querySelector(".auth-form.active");

  if (wrapper && activeForm) {
    gsap.from(wrapper, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });
    gsap.from(activeForm.querySelectorAll("input, .btn"), {
      opacity: 0,
      y: 10,
      stagger: 0.1,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out",
    });
  }
});

// -------------------------
// ✅ Form Elements
// -------------------------
const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");
const toSignup = document.getElementById("to-signup");
const toSignin = document.getElementById("to-signin");

// -------------------------
// ✅ Switch Forms with GSAP
// -------------------------
toSignup?.addEventListener("click", (e) => {
  e.preventDefault();
  gsap.to(signInForm, {
    opacity: 0,
    x: -30,
    duration: 0.3,
    onComplete: () => {
      signInForm.classList.remove("active");
      signUpForm.classList.add("active");
      gsap.from(signUpForm, { opacity: 0, x: 30, duration: 0.4 });
    },
  });
});

toSignin?.addEventListener("click", (e) => {
  e.preventDefault();
  gsap.to(signUpForm, {
    opacity: 0,
    x: 30,
    duration: 0.3,
    onComplete: () => {
      signUpForm.classList.remove("active");
      signInForm.classList.add("active");
      gsap.from(signInForm, { opacity: 0, x: -30, duration: 0.4 });
    },
  });
});

// -------------------------
// ✅ LocalStorage Helpers
// -------------------------
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// -------------------------
// ✅ SIGN UP
// -------------------------
signUpForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !email || !password) {
    return alert("Please fill in all fields.");
  }

  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return alert("This email is already registered.");
  }

  users.push({ name, email, password });
  saveUsers(users);

  alert("Account created successfully!");
  signUpForm.reset();
  toSignin.click();
});

// -------------------------
// ✅ SIGN IN
// -------------------------
signInForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signin-email").value.trim().toLowerCase();
  const password = document.getElementById("signin-password").value.trim();
  const users = getUsers();

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return alert("Invalid email or password.");

  // Save current user for profile page
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Exit animation
  gsap.to(".auth-wrapper", {
    opacity: 0,
    y: -20,
    duration: 0.6,
    onComplete: () => (window.location.href = "profile.html"),
  });
});

// -------------------------
// ✅ LOGOUT (profile.html)
// -------------------------
const logoutBtn = document.getElementById("logout-btn");
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  alert("Logged out.");
  window.location.href = "signin.html";
});

// -------------------------
// ✅ REQUIRE AUTH (page protection)
// -------------------------
function requireAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Please sign in to access this page.");
    window.location.href = "signin.html";
  }
  return user;
}

// -------------------------
// ✅ UPDATE PROFILE NAVBAR LINK
// -------------------------
const profileNav = document.getElementById("nav-profile-link");
if (profileNav) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    profileNav.textContent = "Sign In";
    profileNav.href = "signin.html";
  } else {
    profileNav.textContent = `Hi, ${user.name}`;
    profileNav.href = "profile.html";
  }
}
