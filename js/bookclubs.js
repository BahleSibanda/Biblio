// js/bookclubs.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Bookclubs page loaded ");

  // === DOM REFS ===
  const yourClubsGrid = document.getElementById("your-bookclubs");
  const popularGrid = document.getElementById("popular-bookclubs");
  const suggestedGrid = document.getElementById("suggested-bookclubs");

  if (!yourClubsGrid || !popularGrid) {
    console.warn("Bookclub containers not found in DOM.");
    return;
  }

  // === SAMPLE DATA ===
  const demoClubs = [
    {
      id: 1,
      name: "Sci-Fi Explorers",
      members: 42,
      desc: "Dive into futuristic worlds and intergalactic adventures.",
      icon: "fa-rocket",
    },
    {
      id: 2,
      name: "Romantic Reads",
      members: 58,
      desc: "Share heartwarming stories and timeless love tales.",
      icon: "fa-heart",
    },
    {
      id: 3,
      name: "Mystery Minds",
      members: 73,
      desc: "For those who love unraveling thrilling mysteries.",
      icon: "fa-search",
    },
    {
      id: 4,
      name: "Fantasy Fellowship",
      members: 61,
      desc: "Where dragons soar and legends are born.",
      icon: "fa-dragon",
    },
    {
      id: 5,
      name: "Non-Fiction Nation",
      members: 50,
      desc: "Discover the truths and tales of real lives.",
      icon: "fa-book-open",
    },
    {
      id: 6,
      name: "Historical Hearts",
      members: 35,
      desc: "Travel through time and fall in love with the past.",
      icon: "fa-landmark",
    },
    {
      id: 7,
      name: "Crime Scene Readers",
      members: 40,
      desc: "Solve mysteries and catch killers through gripping thrillers.",
      icon: "fa-fingerprint",
    },
  ];

  let joinedClubs = [];

  // === FUNCTIONS ===
  function createClubCard(club, showJoin = true) {
    const card = document.createElement("div");
    card.className = "bookclub-card";
    card.dataset.id = club.id;

    card.innerHTML = `
      <div class="bookclub-header">
        <div class="bookclub-avatar"><i class="fas ${club.icon}"></i></div>
        <div class="bookclub-info">
          <div class="bookclub-name">${club.name}</div>
          <div class="bookclub-members">${club.members} members</div>
        </div>
      </div>
      <p class="bookclub-description">${club.desc}</p>
      <div class="bookclub-actions">
        ${showJoin ? `<button class="btn-join">Join Club</button>` : ""}
      </div>
    `;

    if (showJoin) {
      const joinBtn = card.querySelector(".btn-join");
      joinBtn.addEventListener("click", () => joinClub(club, card));
    }

    return card;
  }

  function renderSection(container, clubs, showJoin) {
    container.innerHTML = "";
    clubs.forEach((c) => container.appendChild(createClubCard(c, showJoin)));

    // optional GSAP animation
    if (window.gsap) {
      gsap.from(container.children, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }

  function joinClub(club, card) {
    if (!joinedClubs.find((c) => c.id === club.id)) {
      joinedClubs.push(club);
      renderSection(yourClubsGrid, joinedClubs, false);

      // Fade out joined club from popular/suggested
      if (window.gsap) {
        gsap.to(card, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          onComplete: () => card.remove(),
        });
      } else {
        card.remove();
      }
    }
  }

  // === INITIAL RENDER ===
  const popularSubset = demoClubs.slice(0, 4);
  const suggestedSubset = demoClubs.slice(4);

  renderSection(popularGrid, popularSubset, true);

  // If you have a "Suggested" section in HTML
  if (suggestedGrid) renderSection(suggestedGrid, suggestedSubset, true);

  console.log("Bookclubs rendered successfully ");
});


