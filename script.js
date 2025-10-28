// ============= BIBLIO DISCOVER PAGE ENHANCEMENT =============

// DOM elements
const newestSection = document.getElementById("newest-books");
const searchResults = document.getElementById("search-results");
const searchInput = document.getElementById("search-query");
const searchBtn = document.getElementById("search-btn");

// Google Books API base URL
const GOOGLE_BASE = "https://www.googleapis.com/books/v1/volumes";
const OPENLIB_BASE = "https://openlibrary.org/search.json";

// --- Utility: create element ---
function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

// --- Render book cards ---
function renderBooks(container, books) {
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
      </div>
    `);
    container.appendChild(card);
  });
}

// --- Fetch newest books from Google Books ---
async function loadNewestBooks() {
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

// --- Google Books search ---
async function searchGoogleBooks(query) {
  try {
    const res = await fetch(`${GOOGLE_BASE}?q=${encodeURIComponent(query)}&maxResults=12`);
    const data = await res.json();
    if (data.totalItems > 0) {
      const books = data.items.map((i) => ({
        title: i.volumeInfo.title,
        author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
        cover: i.volumeInfo.imageLinks?.thumbnail,
        published: i.volumeInfo.publishedDate,
      }));
      renderBooks(searchResults, books);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Google Books failed", e);
    return false;
  }
}

// --- Fallback: Open Library search ---
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

// --- Main search handler ---
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  searchResults.innerHTML = "<p class='muted'>Searching...</p>";

  const found = await searchGoogleBooks(query);
  if (!found) await searchOpenLibrary(query);
}

// --- Event Listeners ---
searchBtn?.addEventListener("click", handleSearch);
searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// --- Initial load ---
window.addEventListener("DOMContentLoaded", loadNewestBooks);
