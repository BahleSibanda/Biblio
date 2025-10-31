// ================= BIBLIO MAIN SCRIPT =================

// --- DOM References ---
const newestSection = document.getElementById("newest-books");
const searchResults = document.getElementById("search-results");
const searchInput = document.getElementById("search-input");
const hottestSection = document.getElementById("hottest-books");

// --- API URLs ---
const GOOGLE_BASE = "https://www.googleapis.com/books/v1/volumes";
const OPENLIB_BASE = "https://openlibrary.org/search.json";

// ========== ACCESS CONTROL HELPERS ==========

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem("currentUser");
}

// Restrict access to certain pages
function requireLogin(redirectPage = "signin.html") {
  if (!isLoggedIn()) {
    alert("You need to sign in to access this page.");
    window.location.href = redirectPage;
  }
}


// --- Utility: Create element ---
function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

// --- Render Book Cards ---
function renderBooks(container, books) {
  if (!container) return;
  container.innerHTML = "";

  if (!books.length) {
    container.innerHTML = "<p class='muted'>No books found.</p>";
    return;
  }

  books.forEach((b) => {
    const cover =
      b.cover ||
      "https://via.placeholder.com/128x192/FFE8C5/000000?text=No+Cover";
    const title = b.title || "Untitled";
    const author = b.author || "Unknown Author";
    const published = b.published ? `(${b.published})` : "";

    const card = el(`
      <div class="book-card">
        <img src="${cover}" alt="${title}">
        <p><strong>${title}</strong><br><span style="font-size:0.8rem;">${author} ${published}</span></p>
        <button class="btn-like">❤️ Like</button>
        <button class="btn-shelf">+ Shelf</button>
      </div>
    `);
    container.appendChild(card);
  });

  // Animate new cards with GSAP safely
  if (window.gsap) {
    gsap.from(container.querySelectorAll(".book-card"), {
      duration: 0.6,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: "power2.out",
    });
  }
}

// ================= HOME PAGE: HOTTEST BOOKS =================
async function loadHottestBooks() {
  if (!hottestSection) return;
  console.log("🔥 Loading hottest books...");
  hottestSection.innerHTML = "<p class='muted'>Loading hottest books...</p>";

  try {
    const res = await fetch(`${GOOGLE_BASE}?q=subject:fiction&orderBy=newest&maxResults=40`);
    const data = await res.json();
    if (!data.items) throw new Error("No items found");

    const currentYear = new Date().getFullYear();

    const filtered = data.items
      .map((i) => ({
        id: i.id,
        title: i.volumeInfo.title,
        author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
        cover: i.volumeInfo.imageLinks?.thumbnail,
        rating: i.volumeInfo.averageRating || 0,
        published: i.volumeInfo.publishedDate,
      }))
      .filter((b) => {
        const year = parseInt(b.published?.substring(0, 4));
        return b.rating >= 3.5 && year >= currentYear - 2;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    renderBooks(hottestSection, filtered);
  } catch (err) {
    console.warn("Google Books failed for hottest. Trying Open Library...");
    hottestSection.innerHTML = "<p class='muted'>Using backup source...</p>";
    // fallback to Open Library
    const res = await fetch("https://openlibrary.org/subjects/fiction.json?limit=8");
    const data = await res.json();
    const books = data.works.map((b) => ({
      title: b.title,
      author: b.authors?.map((a) => a.name).join(", "),
      cover: b.cover_id ? `https://covers.openlibrary.org/b/id/${b.cover_id}-L.jpg` : null,
      published: b.first_publish_year,
    }));
    renderBooks(hottestSection, books);
  }
}

// ================= DISCOVER PAGE: NEWEST BOOKS =================
async function loadNewestBooks() {
  if (!newestSection) return;
  console.log("📚 Loading newest books...");
  newestSection.innerHTML = "<p class='muted'>Loading newest books...</p>";

  try {
    const res = await fetch(`${GOOGLE_BASE}?q=subject:fiction&orderBy=newest&maxResults=12`);
    const data = await res.json();

    if (!data.items) throw new Error("No Google Books found");

    const books = data.items.map((i) => ({
      title: i.volumeInfo.title,
      author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
      cover: i.volumeInfo.imageLinks?.thumbnail,
      published: i.volumeInfo.publishedDate,
    }));

    renderBooks(newestSection, books);
  } catch (err) {
    console.warn("Google Books failed for newest. Trying Open Library...");
    // fallback to Open Library
    try {
      const res = await fetch("https://openlibrary.org/subjects/fiction.json?limit=12");
      const data = await res.json();
      const books = data.works.map((b) => ({
        title: b.title,
        author: b.authors?.map((a) => a.name).join(", "),
        cover: b.cover_id ? `https://covers.openlibrary.org/b/id/${b.cover_id}-L.jpg` : null,
        published: b.first_publish_year,
      }));
      renderBooks(newestSection, books);
    } catch (e) {
      newestSection.innerHTML = "<p class='muted'>Error loading newest books.</p>";
    }
  }
}

// ================= SEARCH FUNCTIONALITY =================
async function searchGoogleBooks(query) {
  try {
    const res = await fetch(`${GOOGLE_BASE}?q=${encodeURIComponent(query)}&maxResults=12`);
    const data = await res.json();
    if (!data.items) return false;

    const books = data.items.map((i) => ({
      title: i.volumeInfo.title,
      author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
      cover: i.volumeInfo.imageLinks?.thumbnail,
      published: i.volumeInfo.publishedDate,
    }));

    renderBooks(searchResults, books);
    return true;
  } catch {
    return false;
  }
}

async function searchOpenLibrary(query) {
  try {
    const res = await fetch(`${OPENLIB_BASE}?q=${encodeURIComponent(query)}&limit=12`);
    const data = await res.json();
    const books = (data.docs || []).map((i) => ({
      title: i.title,
      author: i.author_name ? i.author_name.join(", ") : "Unknown",
      cover: i.cover_i ? `https://covers.openlibrary.org/b/id/${i.cover_i}-L.jpg` : null,
      published: i.first_publish_year,
    }));
    renderBooks(searchResults, books);
  } catch {
    searchResults.innerHTML = "<p class='muted'>Search failed.</p>";
  }
}

// --- Main search handler ---
async function handleSearch() {
  const query = searchInput?.value.trim();
  if (!query) return;
  searchResults.innerHTML = "<p class='muted'>Searching...</p>";
  const found = await searchGoogleBooks(query);
  if (!found) await searchOpenLibrary(query);
}

// --- Event Listeners ---
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });
}

// ================= INITIALIZATION =================
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Script initialized");
  if (newestSection) loadNewestBooks();
  if (hottestSection) loadHottestBooks();
});


