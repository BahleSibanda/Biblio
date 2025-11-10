// js/profile.js
// Safe Firebase Profile handling — non-module version

(function () {
  if (!window.auth || !window.db) {
    console.error("Firebase not ready in profile.js");
    return;
  }

  const auth = window.auth;
  const db = window.db;

  document.addEventListener("DOMContentLoaded", initProfilePage);

  function initProfilePage() {
    console.log("👤 Initializing profile page...");
    const page = document.getElementById("profile-page");
    if (!page) return;

    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return renderLoggedOutState();

      try {
        const ref = firebase.firestore().collection("users").doc(user.uid);
        const snap = await ref.get();
        const data = snap.exists ? snap.data() : {};

        renderProfile(user, data);
        setupProfileTabs();
        setupProfileActions(user);
        gsapProfileAnimations();
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    });
  }

  function renderProfile(user, data) {
    document.getElementById("profile-avatar").src =
      user.photoURL || data.photoURL || "https://placehold.co/100x100?text=User";
    document.getElementById("profile-name").textContent =
      user.displayName || data.displayName || "Book Lover";
    document.getElementById("profile-username").textContent =
      "@" + (data.username || "new_user");
    document.getElementById("profile-bio").textContent =
      data.bio || "No bio yet. Share your favorite books!";

    document.getElementById("stat-books").textContent = data.booksRead || 0;
    document.getElementById("stat-followers").textContent = data.followers?.length || 0;
    document.getElementById("stat-following").textContent = data.following?.length || 0;
  }

  function setupProfileActions(user) {
    const editBtn = document.getElementById("edit-profile-btn");
    if (!editBtn) return;
    editBtn.addEventListener("click", () => openEditModal(user));
  }

  function openEditModal(user) {
    const modal = document.createElement("div");
    modal.className = "modal show";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:420px;">
        <span class="close-modal">&times;</span>
        <h3>Edit Profile</h3>
        <form id="edit-profile-form">
          <input type="text" id="edit-name" class="form-input" value="${user.displayName || ""}" placeholder="Display Name" required>
          <input type="text" id="edit-username" class="form-input" placeholder="Username">
          <input type="text" id="edit-photo" class="form-input" value="${user.photoURL || ""}" placeholder="Profile Picture URL">
          <textarea id="edit-bio" class="form-input" placeholder="Bio..."></textarea>
          <button type="submit" class="cta" style="margin-top:1rem;">Save Changes</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close-modal").addEventListener("click", () => modal.remove());

    modal.querySelector("#edit-profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("edit-name").value.trim();
      const photoURL = document.getElementById("edit-photo").value.trim();
      const bio = document.getElementById("edit-bio").value.trim();
      const username = document.getElementById("edit-username").value.trim();

      try {
        await firebase.auth().currentUser.updateProfile({ displayName: name, photoURL });
        await firebase.firestore().collection("users").doc(user.uid).set(
          { displayName: name, photoURL, bio, username },
          { merge: true }
        );

        alert("✅ Profile updated successfully!");
        modal.remove();
        location.reload();
      } catch (err) {
        alert("Error updating profile: " + err.message);
      }
    });

    if (window.gsap) {
      gsap.from(".modal-content", { duration: 0.4, scale: 0.9, opacity: 0, ease: "back.out(1.7)" });
    }
  }

  function setupProfileTabs() {
    const tabs = document.querySelectorAll(".profile-tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const target = document.getElementById(`${tab.dataset.tab}-tab-content`);
        if (target) target.classList.add("active");
      });
    });
  }

  function renderLoggedOutState() {
    document.getElementById("profile-name").textContent = "Guest User";
    document.getElementById("profile-username").textContent = "@guest";
    document.getElementById("profile-bio").textContent = "Please log in to view your profile.";
    document.getElementById("edit-profile-btn").textContent = "Log In";
    document.getElementById("edit-profile-btn").addEventListener("click", () => {
      document.getElementById("auth-modal").classList.add("show");
    });
  }

  function gsapProfileAnimations() {
    if (!window.gsap) return;
    gsap.from(".profile-banner", { y: -40, opacity: 0, duration: 0.8, ease: "power2.out" });
    gsap.from(".profile-avatar", { scale: 0, opacity: 0, delay: 0.4, duration: 0.5 });
    gsap.from(".profile-details", { x: -20, opacity: 0, delay: 0.6, duration: 0.6 });
    gsap.from(".profile-tabs", { y: 20, opacity: 0, delay: 0.8, duration: 0.5 });
  }
})();





