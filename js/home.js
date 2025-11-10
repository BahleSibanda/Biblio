
// js/home.js
// Handles hottest reads, friends activity, currently reading, and book modal with GSAP animations

(function () {
  const GOOGLE_API_KEY = window.GOOGLE_API_KEY || "";
  const MAX_BOOKS = 12;

  // Fallback books for UI continuity
  const fallbackBooks = [
    {
      id: "s1",
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "https://placehold.co/140x186/74925D/FFFFFF?text=Midnight+Library",
      description: "A library of alternate lives.",
    },
    {
      id: "s2",
      title: "Project Hail Mary",
      author: "Andy Weir",
      cover: "https://placehold.co/140x186/4C6145/FFFFFF?text=Hail+Mary",
      description: "A lonely astronaut saves the world.",
    },
    {
      id: "s3",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      cover: "https://placehold.co/140x186/143035/FFFFFF?text=Klara+and+the+Sun",
      description: "An ache of memory and machine.",
    },
  ];

  const sampleActivities = [
    {
      user: "BookLover23",
      action: "rated",
      target: "The Midnight Library",
      rating: 5,
      time: "2 hours ago",
      avatar: "https://placehold.co/40x40/74925D/FFFFFF?text=BL",
    },
    {
      user: "PageTurner",
      action: "added",
      target: "Project Hail Mary",
      list: "To Be Read",
      time: "5 hours ago",
      avatar: "https://placehold.co/40x40/4C6145/FFFFFF?text=PT",
    },
    {
      user: "LiteraryExplorer",
      action: "reviewed",
      target: "Klara and the Sun",
      time: "1 day ago",
      avatar: "https://placehold.co/40x40/143035/FFFFFF?text=LE",
    },
  ];

  const hottestEl = document.getElementById("hottest-reads");
  const followingEl = document.getElementById("currently-reading");
  const friendsEl = document.getElementById("friends-activity");
  const bookModal = document.getElementById("book-modal");
  const bookModalContent = document.getElementById("book-modal-content");

  // 🔥 Fetch books from Google Books API
  async function fetchHottestReads() {
    try {
      const q = encodeURIComponent("subject:novel");
      const key = GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : "";
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&orderBy=newest&printType=books&maxResults=${MAX_BOOKS}${key}`;

      const res = await fetch(url, { method: "GET", mode: "cors" });
      if (!res.ok) throw new Error(`Google Books fetch failed: ${res.status}`);

      const data = await res.json();
      if (!data.items?.length) throw new Error("No items found");

      return data.items.map((item) => {
        const v = item.volumeInfo || {};
        return {
          id: item.id,
          title: v.title || "Untitled",
          author: (v.authors && v.authors.join(", ")) || "Unknown",
          cover:
            (v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail)
              ?.replace(/^http:/, "https:")
              || `https://placehold.co/140x186/CCCCCC/000000?text=${encodeURIComponent(
                v.title || "No+Cover"
              )}`,
          description: v.description || v.subtitle || "No description available.",
          publishedDate: v.publishedDate || "",
          pageCount: v.pageCount || "",
          googleBooksUrl: v.infoLink || "#",
        };
      });
    } catch (err) {
      console.warn("⚠️ Google Books API failed, using fallback data.", err.message);
      return fallbackBooks;
    }
  }

  // 🧱 Create book card
  function createBookCard(book) {
    const card = document.createElement("article");
    card.className = "book-card";
    card.tabIndex = 0;

    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}" class="book-cover">
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
      </div>
    `;

    card.addEventListener("click", () => showBookModal(book));
    return card;
  }

  // 🔁 Populate Hottest Reads
  async function populateHottestReads() {
    if (!hottestEl) return;
    hottestEl.innerHTML = `
      <div class="book-card loading"><div class="book-info"><div class="book-title">Loading...</div></div></div>`;
    const books = await fetchHottestReads();
    hottestEl.innerHTML = "";
    books.forEach((b) => hottestEl.appendChild(createBookCard(b)));

    // Animate book cards
    if (window.gsap) {
      gsap.from(".book-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }

  // 📚 Populate Currently Reading
  function populateCurrentlyReading(items) {
    if (!followingEl) return;
    followingEl.innerHTML = "";
    items.forEach((it) => {
      followingEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="currently-reading-card">
          <img class="currently-reading-cover" src="${it.cover}" alt="${it.title}">
          <div class="currently-reading-info">
            <div class="currently-reading-title">${it.title}</div>
            <div class="currently-reading-author">${it.author}</div>
            <div class="reading-progress">
              <div class="progress-bar" style="width:${it.progress}%"></div>
            </div>
            <div class="progress-text">${it.progress}% complete</div>
          </div>
        </div>`
      );
    });

    if (window.gsap) {
      gsap.from(".currently-reading-card", {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power1.out",
      });
    }
  }

  // 👥 Populate Friends Activity
  function populateFriendsActivity(items) {
    if (!friendsEl) return;
    friendsEl.innerHTML = items
      .map(
        (it) => `
      <div class="activity-item">
        <img class="activity-avatar" src="${it.avatar}" alt="${it.user}">
        <div class="activity-content">
          <div class="activity-user">${it.user}</div>
          <div class="activity-text">${renderActivityText(it)}</div>
          <div class="activity-time">${it.time}</div>
        </div>
      </div>`
      )
      .join("");

    if (window.gsap) {
      gsap.from(".activity-item", {
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }

  function renderActivityText(it) {
    if (it.action === "rated")
      return `rated <strong>${it.target}</strong> · ${"★".repeat(it.rating || 0)}`;
    if (it.action === "added")
      return `added <strong>${it.target}</strong> to ${it.list || "a list"}`;
    if (it.action === "reviewed") return `reviewed <strong>${it.target}</strong>`;
    return `${it.action} <strong>${it.target}</strong>`;
  }

  // 📖 Book Modal with Animation
  function showBookModal(book) {
    if (!bookModal || !bookModalContent) return;

    bookModalContent.innerHTML = `
      <div style="display:flex;gap:1rem;">
        <img src="${book.cover}" alt="${book.title}" style="width:120px;border-radius:6px;">
        <div style="flex:1;">
          <h3>${book.title}</h3>
          <p><strong>${book.author}</strong></p>
          <p>${book.description}</p>
          <button class="cta" id="book-modal-open-ext">Open</button>
          <button class="cta" id="book-modal-close" style="background:#eee;color:#111;">Close</button>
        </div>
      </div>`;

    bookModal.classList.add("show");

    const closeBtn = document.getElementById("book-modal-close");
    const openExtBtn = document.getElementById("book-modal-open-ext");

    closeBtn.addEventListener("click", () => closeModal());
    openExtBtn.addEventListener("click", () => window.open(book.googleBooksUrl, "_blank"));

    if (window.gsap) {
      gsap.from(".modal-content", {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    }
  }

  function closeModal() {
    if (window.gsap) {
      gsap.to(".modal-content", {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => bookModal.classList.remove("show"),
      });
    } else {
      bookModal.classList.remove("show");
    }
  }

  // 🌟 Initialize Home Page
  async function initHome() {
    console.log("🏠 Initializing home...");
    await populateHottestReads();
    populateCurrentlyReading([
      {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        cover: "https://placehold.co/140x186/74925D/FFFFFF?text=Crawdads+Sing",
        progress: 34,
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        cover: "https://placehold.co/140x186/4C6145/FFFFFF?text=Dune",
        progress: 72,
      },
    ]);
    populateFriendsActivity(sampleActivities);
  }

  window.home = { initHome, populateHottestReads, createBookCard, showBookModal };

  document.addEventListener("DOMContentLoaded", initHome);
})();
