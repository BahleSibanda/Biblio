// js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  console.log(" profile.js loaded");

  const auth = window.auth;
  if (!auth) {
    console.error(" Firebase Auth not found — make sure it's initialized before profile.js");
    return;
  }

  // Cache DOM elements
  const profileName = document.getElementById("profile-name");
  const profileUsername = document.getElementById("profile-username");
  const profileBio = document.getElementById("profile-bio");
  const profileAvatar = document.getElementById("profile-avatar");
  const tabs = document.querySelectorAll(".profile-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  //  Update Profile Info
  import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js")
    .then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const displayName = user.displayName || user.email?.split("@")[0];
          if (profileName) profileName.textContent = displayName;
          if (profileUsername) profileUsername.textContent = `@${displayName}`;
          if (profileAvatar)
            profileAvatar.src = user.photoURL || "https://placehold.co/100x100?text=User";
          if (profileBio)
            profileBio.textContent = "Welcome back! This is your reading space.";
        } else {
          if (profileName) profileName.textContent = "Guest User";
          if (profileUsername) profileUsername.textContent = "@guest";
          if (profileAvatar)
            profileAvatar.src = "https://placehold.co/100x100?text=Guest";
          if (profileBio)
            profileBio.textContent = "Please sign in to personalize your profile.";
        }
      });
    })
    .catch((err) => console.error("Error loading Firebase Auth:", err));

  //  Tab switching functionality
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetTab = tab.dataset.tab;

      // Hide all tab contents
      tabContents.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the matching one
      const match = document.getElementById(`${targetTab}-tab-content`);
      if (match) {
        match.classList.add("active");

        // Optional GSAP animation for smoothness
        if (window.gsap) {
          gsap.fromTo(
            match,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
          );
        }
      }
    });
  });

  //  Edit profile button (for later expansion)
  const editBtn = document.getElementById("edit-profile-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      alert("Edit profile feature coming soon!");
    });
  }
});




