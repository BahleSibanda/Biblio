// js/settings.js
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
// Always create modular instances directly (not from window)
const auth = getAuth();
const db = getFirestore();

let currentUser = null;

// Initialize once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Settings page initializing...");
  initSettingsPage();
});

function initSettingsPage() {
  const container = document.getElementById("settings-content");
  if (!container) {
    console.warn("⚠️ No #settings-content element found in DOM");
    return;
  }

  // Modular syntax
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showLoginPrompt(container);
      return;
    }

    currentUser = user;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      showSettingsForm(container, user, userData);
      setupSettingsForm(user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      container.innerHTML = `<p style="color:red;">Failed to load settings. Please refresh.</p>`;
    }
  });
}

// --- UI RENDERING ---

function showLoginPrompt(container) {
  container.innerHTML = `
    <div style="text-align:center; padding:2rem;">
      <i class="fas fa-user-lock" style="font-size:3rem;color:var(--dark-grey);margin-bottom:1rem;"></i>
      <h3>Please log in to manage your settings.</h3>
      <button class="cta" style="margin-top:1rem;" onclick="document.getElementById('auth-modal').classList.add('show')">
        Log In / Sign Up
      </button>
    </div>`;
}

function showSettingsForm(container, user, userData) {
  container.innerHTML = `
    <form id="settings-form">
      <div class="form-group">
        <label>Display Name</label>
        <input type="text" id="display-name" class="form-input" value="${user.displayName || userData.displayName || ""}" required>
      </div>

      <div class="form-group">
        <label>Username</label>
        <input type="text" id="username" class="form-input" value="${userData.username || ""}" required>
      </div>

      <div class="form-group">
        <label>Profile Picture URL</label>
        <input type="text" id="profile-pic" class="form-input" value="${user.photoURL || userData.photoURL || "https://placehold.co/100x100?text=User"}">
      </div>

      <div class="form-group">
        <label>Header Image URL</label>
        <input type="text" id="header-pic" class="form-input" value="${userData.headerPic || "https://placehold.co/1200x200?text=Header"}">
      </div>

      <button type="submit" class="cta" style="background:var(--orange);margin-top:1rem;">Save Changes</button>
      <div class="success-message" id="settings-success"></div>
    </form>

    <div style="margin-top:2rem;border-top:1px solid var(--medium-grey);padding-top:1rem;">
      <button class="cta" style="background:var(--dark-grey-brown);" id="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Log Out
      </button>
      <button class="cta" style="background:#d32f2f;" id="delete-account-btn">
        <i class="fas fa-trash"></i> Delete Account
      </button>
    </div>`;
}

// --- FORM HANDLERS ---

function setupSettingsForm(user) {
  const form = document.getElementById("settings-form");
  const logoutBtn = document.getElementById("logout-btn");
  const deleteBtn = document.getElementById("delete-account-btn");
  const successMsg = document.getElementById("settings-success");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("display-name").value.trim();
    const username = document.getElementById("username").value.trim();
    const photoURL = document.getElementById("profile-pic").value.trim();
    const headerPic = document.getElementById("header-pic").value.trim();

    try {
      // Update Auth profile
      await updateProfile(user, { displayName: name, photoURL });

      // Update Firestore doc
      await setDoc(
        doc(db, "users", user.uid),
        { displayName: name, username, photoURL, headerPic, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      successMsg.textContent = "Profile updated successfully!";
      successMsg.style.color = "green";

      setTimeout(() => (successMsg.textContent = ""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + err.message);
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  });

  deleteBtn?.addEventListener("click", async () => {
    if (confirm("Are you sure you want to permanently delete your account?")) {
      try {
        await deleteUser(user);
        alert("Your account has been deleted.");
        window.location.href = "index.html";
      } catch (err) {
        alert("Error deleting account: " + err.message);
      }
    }
  });
}

