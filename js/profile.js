// js/profile.js
// Handles user profile rendering, bookshelf, and interactions

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const db = window.db || getFirestore();
const auth = window.auth;

// Initialize the profile page
export function initProfilePage() {
  console.log("Profile page initialized");

  const tabs = document.querySelectorAll(".profile-tab");
  const tabContents = {
    profile: document.getElementById("profile-tab-content"),
    bookshelf: document.getElementById("bookshelf-tab-content"),
    lists: document.getElementById("lists-tab-content"),
    likes: document.getElementById("likes-tab-content"),
    reviews: document.getElementById("reviews-tab-content"),
  };

  // Default user placeholders
  const usernameEl = document.querySelector(".username");
  const nameEl = document.querySelector(".name");
  const profilePicEl = document.querySelector(".profile-picture");

  // Show active tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      Object.values(tabContents).forEach((el) => (el.style.display = "none"));
      const target = tab.dataset.tab;
      if (tabContents[target]) {
        tabContents[target].style.display = "block";
      }
    });
  });

  // Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Logged in as:", user.email);

      // Populate profile details
      nameEl.textContent = user.displayName || "Biblio Reader";
      usernameEl.textContent = user.email.replace(/@.*/, "");
      profilePicEl.src = user.photoURL || "https://placehold.co/100x100?text=User";

      // Load bookshelf, lists, and reviews
      await loadBookshelf();
      await loadLists();
      await loadReviews();
      await loadActivity();
    } else {
      console.log("No user logged in — showing default profile");
      nameEl.textContent = "Guest User";
      usernameEl.textContent = "@guest";
      profilePicEl.src = "https://placehold.co/100x100?text=Guest";
    }
  });
}

// --- DEMO CONTENT LOADERS ---

async function loadBookshelf() {
  const shelf = document.getElementById("bookshelf");
  if (!shelf) return;

  shelf.innerHTML = `
    <div class="bookshelf-book">
      <img src="https://placehold.co/100x140?text=Book" class="bookshelf-cover" alt="Book">
      <p class="bookshelf-book-title">The Night Circus</p>
    </div>
    <div class="bookshelf-book">
      <img src="https://placehold.co/100x140?text=Book" class="bookshelf-cover" alt="Book">
      <p class="bookshelf-book-title">Circe</p>
    </div>
    <div class="bookshelf-book">
      <img src="https://placehold.co/100x140?text=Book" class="bookshelf-cover" alt="Book">
      <p class="bookshelf-book-title">Project Hail Mary</p>
    </div>
  `;
}

async function loadLists() {
  const lists = document.getElementById("user-lists");
  if (!lists) return;

  lists.innerHTML = `
    <div class="list-item">
      <h4>Favorites of 2025</h4>
      <p>My top-rated reads this year.</p>
    </div>
    <div class="list-item">
      <h4>To Read Next</h4>
      <p>Books waiting on my shelf.</p>
    </div>
  `;
}

async function loadReviews() {
  const reviews = document.getElementById("user-reviews");
  if (!reviews) return;

  reviews.innerHTML = `
    <div class="review-item">
      <strong>The Song of Achilles</strong>
      <p>"Heart-wrenching and beautifully written."</p>
    </div>
    <div class="review-item">
      <strong>Fourth Wing</strong>
      <p>"Fun fantasy read, though a bit overhyped."</p>
    </div>
  `;
}

async function loadActivity() {
  const activity = document.getElementById("profile-activity");
  if (!activity) return;

  activity.innerHTML = `
    <div class="activity-item">
      <img src="https://placehold.co/40x40?text=U" class="activity-avatar" alt="User">
      <div class="activity-content">
        <div class="activity-user">You</div>
        <div class="activity-text">added <strong>Tomorrow, and Tomorrow, and Tomorrow</strong> to your shelf</div>
        <div class="activity-time">1 hour ago</div>
      </div>
    </div>
  `;
}

// Initialize automatically if page loaded directly
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-page")) {
    initProfilePage();
  }
});
