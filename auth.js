// =============================================
// ✅ BIBLIO AUTH SYSTEM — CLEAN & FIXED
// =============================================

// -------------------------
// ✅ GSAP Intro Animation
// -------------------------
window.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".auth-wrapper");
  const activeForm = document.querySelector(".auth-form.active");

  if (wrapper && activeForm && window.gsap) {
    gsap.from(wrapper, { opacity: 0, y: 30, duration: 0.8 });

    gsap.from(activeForm.querySelectorAll("input, .btn"), {
      opacity: 0,
      y: 10,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.2
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
// ✅ Switch Forms
// -------------------------
toSignup?.addEventListener("click", (e) => {
  e.preventDefault();

  signInForm.classList.remove("active");
  signUpForm.classList.add("active");
});

toSignin?.addEventListener("click", (e) => {
  e.preventDefault();

  signUpForm.classList.remove("active");
  signInForm.classList.add("active");
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
    alert("Please fill in all fields.");
    return;
  }

  const users = getUsers();

  if (users.some(u => u.email === email)) {
    alert("This email is already registered.");
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);

  alert("Account created successfully!");

  signUpForm.reset();
  signUpForm.classList.remove("active");
  signInForm.classList.add("active");
});

// -------------------------
// ✅ SIGN IN
// -------------------------
signInForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signin-email").value.trim().toLowerCase();
  const password = document.getElementById("signin-password").value.trim();

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  // ✅ Smooth exit transition
  gsap.to(".auth-wrapper", {
    opacity: 0,
    y: -20,
    duration: 0.5,
    onComplete: () => {
      window.location.href = "profile.html";
    }
  });
});

// -------------------------
// ✅ AUTH PROTECTION (for pages like profile.html)
// -------------------------
function requireAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("You must sign in first.");
    window.location.href = "signin.html";
  }
  return user;
}

// -------------------------
// ✅ LOG OUT (runs only IF logout button exists)
// -------------------------
const logoutBtn = document.getElementById("logout-btn");
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  alert("Logged out.");
  window.location.href = "signin.html";
});

// -------------------------
// ✅ NAVBAR PROFILE LINK UPDATE
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

