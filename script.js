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

// ============= Hottest Books Section =============
const HOTTEST_CONTAINER = document.getElementById("hottest-books");

async function loadHottestBooks() {
  if (!HOTTEST_CONTAINER) return;
  HOTTEST_CONTAINER.innerHTML = "<p class='muted'>Loading hottest books...</p>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=40`);
    const data = await res.json();

    if (!data.items) {
      HOTTEST_CONTAINER.innerHTML = "<p class='muted'>No data found.</p>";
      return;
    }

    const currentYear = new Date().getFullYear();

    // Filter: published within last 2 years and has ratings
    const filtered = data.items
      .map(i => ({
        id: i.id,
        title: i.volumeInfo.title,
        author: i.volumeInfo.authors ? i.volumeInfo.authors.join(", ") : "Unknown",
        cover: i.volumeInfo.imageLinks?.thumbnail,
        rating: i.volumeInfo.averageRating || 0,
        published: i.volumeInfo.publishedDate,
      }))
      .filter(b => {
        const year = parseInt(b.published?.substring(0, 4));
        return b.rating >= 3.5 && year >= currentYear - 2;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8); // Top 8 hottest

    HOTTEST_CONTAINER.innerHTML = "";
    if (filtered.length === 0) {
      HOTTEST_CONTAINER.innerHTML = "<p class='muted'>No recent top-rated books found.</p>";
      return;
    }

    filtered.forEach(b => {
      const card = document.createElement("a");
      card.href = `book.html?id=${b.id}&source=google`;
      card.className = "book-card";
      card.innerHTML = `
        <img src="${b.cover || "https://via.placeholder.com/128x192/FFE8C5/000000?text=No+Cover"}" alt="${b.title}">
        <p><strong>${b.title}</strong><br>
        <span style="font-size:0.8rem;">${b.author}</span><br>
        <span class="rating">⭐ ${b.rating.toFixed(1)}</span></p>
      `;
      HOTTEST_CONTAINER.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    HOTTEST_CONTAINER.innerHTML = "<p class='muted'>Error loading hottest books.</p>";
  }
}

// Load on home page
window.addEventListener("DOMContentLoaded", loadHottestBooks);



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

// ===== SOCIAL MEDIA STYLE SIGNUP / SIGNIN =====
const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");
const toSignup = document.getElementById("to-signup");
const toSignin = document.getElementById("to-signin");

// Toggle between forms
toSignup?.addEventListener("click", e => {
  e.preventDefault();
  signInForm.classList.remove("active");
  signUpForm.classList.add("active");
});

toSignin?.addEventListener("click", e => {
  e.preventDefault();
  signUpForm.classList.remove("active");
  signInForm.classList.add("active");
});

// Handle Sign Up
signUpForm?.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !email || !password) return alert("Please fill in all fields.");

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.find(u => u.email === email)) return alert("Email already registered.");

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created! You can now sign in.");
  signUpForm.reset();
  signUpForm.classList.remove("active");
  signInForm.classList.add("active");
});

// Handle Sign In
signInForm?.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value.trim();

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return alert("Invalid email or password.");

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "index.html";
});

// PAGE FADE-IN
window.addEventListener('load', () => {
  gsap.to('.page', { duration: 0.8, opacity: 1, y: 0, ease: 'power3.out' });
});

// BOOK CARD ENTRANCE ANIMATION
gsap.utils.toArray('.book-card').forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
    },
    duration: 0.6,
    opacity: 1,
    y: 0,
    delay: i * 0.05,
    ease: 'power2.out'
  });
});

// LIKE BUTTON ANIMATION
document.querySelectorAll('.btn-like').forEach(btn => {
  btn.addEventListener('click', () => {
    gsap.fromTo(btn, { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'elastic.out(1, 0.4)' });
    btn.classList.toggle('liked');
  });
});

// ADD TO SHELF BUTTON ANIMATION
document.querySelectorAll('.btn-shelf').forEach(btn => {
  btn.addEventListener('click', () => {
    gsap.to(btn, { backgroundColor: '#74925D', color: '#fff', duration: 0.3 });
    btn.classList.add('added-to-shelf');
  });
});

// STAR RATING ANIMATION
document.querySelectorAll('.btn-rate').forEach(star => {
  star.addEventListener('click', () => {
    gsap.fromTo(star, { scale: 1 }, { scale: 1.4, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut' });
  });
});

// =============== BOOK API HANDLING ====================
// Using Open Library API
const newestBooksContainer = document.getElementById('newest-books');
const searchResultsContainer = document.getElementById('search-results');
const searchInput = document.getElementById('search-input');

// Fetch newest books
async function fetchNewestBooks() {
  try {
    const res = await fetch('https://openlibrary.org/subjects/fiction.json?limit=12');
    const data = await res.json();
    displayBooks(data.works, newestBooksContainer);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

// Search for books
async function searchBooks(query) {
  if (!query) {
    searchResultsContainer.innerHTML = '';
    return;
  }
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    const data = await res.json();
    displayBooks(data.docs.slice(0, 12), searchResultsContainer);
  } catch (error) {
    console.error('Error searching books:', error);
  }
}

// Display books in grid
function displayBooks(books, container) {
  container.innerHTML = books.map(book => {
    const coverId = book.cover_id || book.cover_i;
    const imgUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : 'https://via.placeholder.com/150x220?text=No+Cover';
    const title = book.title || 'Untitled';
    return `
      <div class="book-card">
        <img src="${imgUrl}" alt="${title}">
        <p>${title}</p>
        <button class="btn-like">❤️ Like</button>
        <button class="btn-shelf">+ Shelf</button>
      </div>`;
  }).join('');

  // Re-apply GSAP animations
  gsap.from('.book-card', {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.out'
  });
}

// Event listener for search
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchBooks(e.target.value);
  });
}

// Initialize newest books on page load
if (newestBooksContainer) {
  fetchNewestBooks();
}

