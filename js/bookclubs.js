// js/bookclubs.js
// Handles dynamic rendering, joining/leaving clubs, and club discussion modal

window.bookclubs = {
  initBookclubs() {
    console.log("📚 Bookclubs page initialized");

    const yourClubsGrid = document.getElementById("your-bookclubs");
    const popularClubsGrid = document.getElementById("popular-bookclubs");
    const dynamicClubsGrid = document.getElementById("dynamic-bookclubs");
    const clubModal = document.getElementById("club-modal");
    const clubModalTitle = document.getElementById("club-modal-title");
    const clubPostsContainer = document.getElementById("club-posts");
    const clubPostForm = document.getElementById("club-post-form");
    const clubPostInput = document.getElementById("club-post-input");

    if (!yourClubsGrid) {
      console.warn("Bookclubs page not ready yet.");
      return;
    }

    // Mock sample data for dynamic rendering
    const sampleClubs = [
      {
        id: 4,
        name: "Historical Fiction Society",
        members: 29,
        description: "Exploring the past through gripping historical novels and biographies.",
      },
      {
        id: 5,
        name: "Fantasy Fellowship",
        members: 67,
        description: "Discussing magical worlds, quests, and legendary heroes from epic fantasies.",
      },
      {
        id: 6,
        name: "Non-Fiction Thinkers",
        members: 52,
        description: "For curious minds who love to read and discuss real-world stories and ideas.",
      },
    ];

    // Local state (temporary)
    let joinedClubs = JSON.parse(localStorage.getItem("joinedClubs") || "[]");
    let clubPosts = JSON.parse(localStorage.getItem("clubPosts") || "{}");

    function renderYourClubs() {
      yourClubsGrid.innerHTML = "";

      if (joinedClubs.length === 0) {
        yourClubsGrid.innerHTML = `<p style="color: var(--dark-grey); font-size: 0.95rem;">You haven’t joined any clubs yet. Join one below!</p>`;
        return;
      }

      joinedClubs.forEach((club) => {
        const card = document.createElement("div");
        card.className = "bookclub-card";
        card.innerHTML = `
          <div class="bookclub-header">
            <div class="bookclub-avatar" style="background: var(--light-grey); display:flex; align-items:center; justify-content:center;">
              <i class="fas fa-users"></i>
            </div>
            <div class="bookclub-info">
              <div class="bookclub-name">${club.name}</div>
              <div class="bookclub-members">${club.members} members</div>
            </div>
          </div>
          <p class="bookclub-description">${club.description}</p>
          <div class="bookclub-actions">
            <button class="btn-view" data-club-id="${club.id}">Open Club</button>
            <button class="btn-leave" data-club-id="${club.id}">Leave Club</button>
          </div>
        `;
        yourClubsGrid.appendChild(card);
      });
    }

    function renderDynamicClubs() {
      sampleClubs.forEach((club) => {
        const card = document.createElement("div");
        card.className = "bookclub-card";
        card.setAttribute("data-club-id", club.id);
        card.innerHTML = `
          <div class="bookclub-header">
            <div class="bookclub-avatar" style="background: var(--light-grey); display:flex; align-items:center; justify-content:center;">
              <i class="fas fa-book"></i>
            </div>
            <div class="bookclub-info">
              <div class="bookclub-name">${club.name}</div>
              <div class="bookclub-members">${club.members} members</div>
            </div>
          </div>
          <p class="bookclub-description">${club.description}</p>
          <div class="bookclub-actions">
            <button class="btn-view" data-club-id="${club.id}">Open Club</button>
            <button class="btn-join" data-club-id="${club.id}">Join Club</button>
          </div>
        `;
        dynamicClubsGrid.appendChild(card);
      });
    }

    function requireLogin(callback) {
      if (window.auth && auth.currentUser) {
        callback();
      } else {
        const authModal = document.getElementById("auth-modal");
        if (authModal) {
          authModal.style.display = "flex";
          authModal.setAttribute("aria-hidden", "false");
        }
      }
    }

    function handleJoinClub(club) {
      if (joinedClubs.find((c) => c.id === club.id)) return;
      joinedClubs.push(club);
      localStorage.setItem("joinedClubs", JSON.stringify(joinedClubs));
      renderYourClubs();
    }

    function handleLeaveClub(id) {
      joinedClubs = joinedClubs.filter((c) => c.id !== id);
      localStorage.setItem("joinedClubs", JSON.stringify(joinedClubs));
      renderYourClubs();
    }

    function openClubModal(clubId, clubName) {
      clubModalTitle.textContent = clubName;
      clubModal.classList.add("show");
      clubModal.setAttribute("aria-hidden", "false");

      const posts = clubPosts[clubId] || [];
      clubPostsContainer.innerHTML = posts.length
        ? posts.map((p) => `<div class="post-item"><strong>${p.user}:</strong> ${p.text}</div>`).join("")
        : `<p style="color: var(--dark-grey); font-size:0.9rem;">No posts yet. Start the conversation!</p>`;

      clubPostForm.onsubmit = (e) => {
        e.preventDefault();
        requireLogin(() => {
          const text = clubPostInput.value.trim();
          if (!text) return;
          const user = auth.currentUser ? auth.currentUser.email.split("@")[0] : "Anonymous";
          const post = { user, text };
          clubPosts[clubId] = [...(clubPosts[clubId] || []), post];
          localStorage.setItem("clubPosts", JSON.stringify(clubPosts));
          clubPostInput.value = "";
          openClubModal(clubId, clubName);
        });
      };
    }

    clubModal.addEventListener("click", (e) => {
      if (e.target.classList.contains("close-modal") || e.target === clubModal) {
        clubModal.classList.remove("show");
        clubModal.setAttribute("aria-hidden", "true");
      }
    });

    document.body.addEventListener("click", (e) => {
      const joinBtn = e.target.closest(".btn-join");
      const viewBtn = e.target.closest(".btn-view");
      const leaveBtn = e.target.closest(".btn-leave");

      if (joinBtn) {
        const card = joinBtn.closest(".bookclub-card");
        const club = {
          id: parseInt(card.dataset.clubId),
          name: card.querySelector(".bookclub-name").textContent,
          members: parseInt(card.querySelector(".bookclub-members").textContent),
          description: card.querySelector(".bookclub-description").textContent,
        };
        requireLogin(() => handleJoinClub(club));
      }

      if (leaveBtn) {
        const id = parseInt(leaveBtn.dataset.clubId);
        handleLeaveClub(id);
      }

      if (viewBtn) {
        const card = viewBtn.closest(".bookclub-card");
        const id = parseInt(card.dataset.clubId);
        const name = card.querySelector(".bookclub-name").textContent;
        openClubModal(id, name);
      }
    });

    renderYourClubs();
    renderDynamicClubs();
  }
};

// Auto-run if the page is loaded directly (not dynamically)
if (document.querySelector(".bookclubs-page")) {
  window.bookclubs.initBookclubs();
}

