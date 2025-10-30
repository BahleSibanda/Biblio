// ================= BIBLIO MAIN SCRIPT =================

// --- DOM References ---
const newestSection = document.getElementById("newest-books");
const searchResults = document.getElementById("search-results");
const searchInput = document.getElementById("search-input");
const hottestSection = document.getElementById("hottest-books");

// --- API URLs ---
const GOOGLE_BASE = "https://www.googleapis.com/books/v1/volumes";
const OPENLIB_BASE = "https://openlibrary.org/search.json";

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
    const cover = b.cover || "https://via.placeholder.com/128x192/FFE8C5/000000?text=No+Cover";
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

  // Animate new cards with GSAP
  gsap.from(container.querySelectorAll(".book-card"), {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.1,
    ease: "power2.out",
  });
}

// ================= HOME PAGE: HOTTEST BOOKS =================
async function loadHottestBooks() {
  if (!hottestSection) return;
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
    console.error(err);
    hottestSection.innerHTML = "<p class='muted'>Error loading hottest books.</p>";
  }
}

// ================= DISCOVER PAGE: NEWEST BOOKS =================
async function loadNewestBooks() {
  if (!newestSection) return;
  newestSection.innerHTML = "<p class='muted'>Loading newest books...</p>";

  try {
    const res = await fetch(`${GOOGLE_BASE}?q=subject:fiction&orderBy=newest&maxResults=12`);
    const data = await res.json();

    const books = (data.items || []).map((i) => ({
      title: i.volumeInfo.title,
      author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
      cover: i.volumeInfo.imageLinks?.thumbnail,
      published: i.volumeInfo.publishedDate,
    }));

    renderBooks(newestSection, books);
  } catch (err) {
    newestSection.innerHTML = "<p class='muted'>Failed to load newest books.</p>";
    console.error(err);
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
  } catch (e) {
    console.error("Google Books failed", e);
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
  } catch (e) {
    searchResults.innerHTML = "<p class='muted'>Open Library search failed.</p>";
  }
}

// Main search handler
async function handleSearch() {
  const query = searchInput?.value.trim();
  if (!query) return;
  searchResults.innerHTML = "<p class='muted'>Searching...</p>";

  const found = await searchGoogleBooks(query);
  if (!found) await searchOpenLibrary(query);
}

// Event listeners
searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// ================= PAGE INITIALIZERS =================
window.addEventListener("DOMContentLoaded", () => {
  loadNewestBooks();
  loadHottestBooks();
});

// ================= AUTH HANDLERS (same as before) =================
// (Keep your sign-up/sign-in code unchanged below if needed)

