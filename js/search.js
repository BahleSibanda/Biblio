// js/search.js
// Google Books API live search with GSAP animation and fixed modal behavior

document.addEventListener("DOMContentLoaded", () => {
  setupSearchModal();
});

function setupSearchModal() {
  const searchInput = document.getElementById("search-modal-input");
  const modal = document.getElementById("search-modal");
  const resultsContainer = document.getElementById("search-modal-results");

  if (!searchInput || !modal || !resultsContainer) return;

  let searchTimeout;

  // Debounced search input
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    searchTimeout = setTimeout(() => performSearch(query), 500);
  });

  // ✅ Only clear results when the modal *actually closes*,
  // not when you click inside it or while results are visible.
  modal.addEventListener("click", function (e) {
    if (e.target.classList.contains("close-modal")) {
      clearSearchResults();
    }
  });
}

// Actual Google Books API search
async function performSearch(query) {
  const resultsContainer = document.getElementById("search-modal-results");
  if (!resultsContainer) return;

  if (!query || query.length < 2) {
    resultsContainer.innerHTML = `<p style="padding:2rem;text-align:center;color:var(--dark-grey);">Enter at least 2 characters to search</p>`;
    return;
  }

  // Show loading
  resultsContainer.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--orange);margin-bottom:1rem;"></i>
      <p>Searching for "<strong>${query}</strong>"...</p>
    </div>
  `;

  try {
    const GOOGLE_API_KEY = window.GOOGLE_API_KEY || "";
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&printType=books&maxResults=12${GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch results");

    const data = await response.json();
    const items = (data.items || []).map((item) => {
      const v = item.volumeInfo || {};
      return {
        id: item.id,
        title: v.title || "Untitled",
        author: (v.authors && v.authors.join(", ")) || "Unknown Author",
        description: v.description || "No description available.",
        cover:
          (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail))
            ?.replace(/^http:/, "https:") ||
          "https://placehold.co/128x180?text=No+Cover",
        infoLink: v.infoLink || "#",
      };
    });

    if (!items.length) {
      resultsContainer.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <i class="fas fa-search" style="font-size:3rem;color:var(--dark-grey);margin-bottom:1rem;"></i>
          <p>No books found for "${query}"</p>
          <p style="color:var(--dark-grey);">Try different keywords</p>
        </div>
      `;
      return;
    }

    displaySearchResults(items);
  } catch (err) {
    console.error("Search failed:", err);
    resultsContainer.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--dark-grey);">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--orange);margin-bottom:1rem;"></i>
        <p>Could not load search results.</p>
        <p style="font-size:.9rem;">Check your internet connection or try again later.</p>
      </div>
    `;
  }
}

function displaySearchResults(books) {
  const resultsContainer = document.getElementById("search-modal-results");
  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  books.forEach((book) => {
    const bookEl = document.createElement("div");
    bookEl.className = "book-card";
    bookEl.innerHTML = `
      <img src="${book.cover}" alt="${book.title}" class="book-cover" />
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
        <button class="cta view-book" style="margin-top:0.5rem;">View</button>
      </div>
    `;

    bookEl.querySelector(".view-book").addEventListener("click", (e) => {
      e.stopPropagation();
      if (book.infoLink && book.infoLink.startsWith("http")) {
        window.open(book.infoLink, "_blank");
      }
    });

    resultsContainer.appendChild(bookEl);
  });

  // GSAP animation
  if (window.gsap) {
    gsap.from(".book-card", {
      duration: 0.5,
      y: 25,
      opacity: 0,
      stagger: 0.08,
      ease: "power2.out",
    });
  }
}

// Reset results properly
function clearSearchResults() {
  const resultsContainer = document.getElementById("search-modal-results");
  const searchInput = document.getElementById("search-modal-input");

  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <p style="padding:2rem;text-align:center;color:var(--dark-grey);">
        Search for books or authors to get started
      </p>`;
  }
  if (searchInput) searchInput.value = "";
}

// Smooth intro animation for modal
document.getElementById("search-modal").addEventListener("transitionend", (e) => {
  if (e.target.id === "search-modal" && e.target.classList.contains("show")) {
    if (window.gsap) {
      gsap.from("#search-modal-input", { duration: 0.5, opacity: 0, y: -10, ease: "power2.out" });
      gsap.from(".modal-content", { duration: 0.5, scale: 0.9, opacity: 0, ease: "back.out(1.7)" });
    }
  }
});

