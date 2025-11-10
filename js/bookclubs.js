// js/bookclubs.js
// Displays user's bookclubs and suggested bookclubs safely

(function () {
  if (!window.db) {
    console.error("Firestore not initialized.");
    return;
  }

  const db = window.db;

  document.addEventListener("DOMContentLoaded", async () => {
    const yourEl = document.getElementById("your-bookclubs");
    const popularEl = document.getElementById("popular-bookclubs");

    if (!yourEl || !popularEl) return;

    yourEl.innerHTML = `<p>Loading your bookclubs...</p>`;
    popularEl.innerHTML = `<p>Loading suggestions...</p>`;

    try {
      // 🔹 Example Firestore reads — replace with your own collections later
      const yourClubsSnap = await firebase.firestore().collection("bookclubs").limit(3).get();
      const popularClubsSnap = await firebase.firestore().collection("bookclubs").limit(6).get();

      if (yourClubsSnap.empty && popularClubsSnap.empty) {
        yourEl.innerHTML = `<p>You haven't joined any clubs yet.</p>`;
        popularEl.innerHTML = `<p>No suggested bookclubs available.</p>`;
        return;
      }

      yourEl.innerHTML = "";
      yourClubsSnap.forEach(doc => {
        const c = doc.data();
        yourEl.insertAdjacentHTML("beforeend", `
          <div class="bookclub-card">
            <h3>${c.name || "Untitled Club"}</h3>
            <p>${c.description || "No description"}</p>
            <button class="btn-join" disabled>Joined</button>
          </div>`);
      });

      popularEl.innerHTML = "";
      popularClubsSnap.forEach(doc => {
        const c = doc.data();
        popularEl.insertAdjacentHTML("beforeend", `
          <div class="bookclub-card">
            <h3>${c.name || "Unnamed Club"}</h3>
            <p>${c.description || "Join this club to start reading together!"}</p>
            <button class="btn-join">Join</button>
          </div>`);
      });

      console.log(" Bookclubs loaded");
    } catch (err) {
      console.error(" Error fetching bookclubs:", err);
      yourEl.innerHTML = `<p style="color:red;">Failed to load bookclubs.</p>`;
      popularEl.innerHTML = `<p style="color:red;">Failed to load suggestions.</p>`;
    }
  });
})();

