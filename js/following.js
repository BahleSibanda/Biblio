// js/following.js
// Displays a placeholder or feed for followed users

(function () {
  const auth = window.auth || null;
  const db = window.db || null;

  document.addEventListener("DOMContentLoaded", () => {
    console.log("📡 Initializing following page...");
    const el = document.getElementById("following-page");
    if (!el) return;

    el.innerHTML = `
      <div class="content-box" style="text-align:center;">
        <i class="fas fa-users" style="font-size:3rem;color:#74925D;margin-bottom:1rem;"></i>
        <h3>No followed users yet</h3>
        <p>Start following friends from bookclubs or profiles!</p>
      </div>
    `;
  });
})();
