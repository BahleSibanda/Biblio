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
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const auth = window.auth || getAuth();
const db = window.db || getFirestore();

let currentUser = null;

// Initialize
document.addEventListener("DOMContentLoaded", initSettingsPage);

function initSettingsPage() {
  console.log("Initializing settings page");
  onAuthStateChanged(auth, async (user) => {
    const container = document.getElementById("settings-content");
    if (!user) {
      showLoginPrompt(container);
      return;
    }

    currentUser = user;
    const docRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(docRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    showSettingsForm(container, user, userData);
    setupSettingsForm(user, userData);
  });
}

// --- UI RENDERING ---

function showLoginPrompt(container) {
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-user-lock" style="font-size: 3rem; color: var(--dark-grey); margin-bottom: 1rem;"></i>
      <h3>Please log in to manage your settings.</h3>
      <button class="cta" style="margin-top: 1rem;" onclick="document.getElementById('auth-modal').style.display='flex'">
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

      <button type="submit" class="cta" style="background: var(--orange); margin-top: 1rem;">Save Changes</button>
      <div class="success-message" id="settings-success"></div>
    </form>

    <div style="margin-top: 2rem; border-top: 1px solid var(--medium-grey); padding-top: 1rem;">
      <button class="cta" style="background: var(--dark-grey-brown);" id="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Log Out
      </button>
      <button class="cta" style="background: #d32f2f;" id="delete-account-btn">
        <i class="fas fa-trash"></i> Delete Account
      </button>
    </div>
  `;
}

// --- FORM HANDLERS ---

function setupSettingsForm(user, userData) {
  const form = document.getElementById("settings-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("display-name").value.trim();
    const username = document.getElementById("username").value.trim();
    const photoURL = document.getElementById("profile-pic").value.trim();
    const headerPic = document.getElementById("header-pic").value.trim();

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name, photoURL });

      // Update Firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        username,
        photoURL,
        headerPic,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      document.getElementById("settings-success").textContent = "Profile updated successfully!";
      document.getElementById("settings-success").style.color = "green";

      setTimeout(() => {
        document.getElementById("settings-success").textContent = "";
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + err.message);
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/";
  });

  // Delete Account
  const deleteBtn = document.getElementById("delete-account-btn");
  deleteBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to permanently delete your account?")) {
      try {
        await deleteUser(user);
        alert("Your account has been deleted.");
        window.location.href = "/";
      } catch (err) {
        alert("Error deleting account: " + err.message);
      }
    }
  });
}
