// js/home.js
// Handles hottest-reads fetch/render, friends activity, currently-reading, book modal content, search hookup

(function () {
  // Config
  const GOOGLE_API_KEY = window.GOOGLE_API_KEY || ''; // optional if you set globally
  const MAX_BOOKS = 12;

  // Sample fallback data (keeps UI populated if network fails)
  const sampleBooks = [
    { id: 's1', title: 'The Midnight Library', author: 'Matt Haig', cover: 'https://placehold.co/140x186/74925D/FFFFFF?text=Midnight+Library', description: 'A library of alternate lives.' },
    { id: 's2', title: 'Project Hail Mary', author: 'Andy Weir', cover: 'https://placehold.co/140x186/4C6145/FFFFFF?text=Hail+Mary', description: 'A lonely astronaut saves the world.' },
    { id: 's3', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', cover: 'https://placehold.co/140x186/143035/FFFFFF?text=Klara+and+the+Sun', description: 'An ache of memory and machine.' }
  ];

  const sampleActivities = [
    { user: "BookLover23", action: "rated", target: "The Midnight Library", rating: 5, time: "2 hours ago", avatar: "https://placehold.co/40x40/74925D/FFFFFF?text=BL" },
    { user: "PageTurner", action: "added", target: "Project Hail Mary", list: "To Be Read", time: "5 hours ago", avatar: "https://placehold.co/40x40/4C6145/FFFFFF?text=PT" },
    { user: "LiteraryExplorer", action: "reviewed", target: "Klara and the Sun", time: "1 day ago", avatar: "https://placehold.co/40x40/143035/FFFFFF?text=LE" }
  ];

  // DOM refs
  const hottestEl = document.getElementById('hottest-reads');
  const followingEl = document.getElementById('currently-reading');
  const friendsEl = document.getElementById('friends-activity');
  const bookModal = document.getElementById('book-modal');
  const bookModalContent = document.getElementById('book-modal-content');

  // Fetch newest novels from Google Books (subject:novel, orderBy=newest)
  async function fetchHottestReads() {
    const q = encodeURIComponent('subject:novel');
    const key = GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&orderBy=newest&printType=books&maxResults=${MAX_BOOKS}${key}`;

    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!res.ok) throw new Error(`Google Books fetch failed: ${res.status}`);
      const data = await res.json();
      if (!data.items || data.items.length === 0) throw new Error('No items returned');
      return data.items.map(item => {
        const v = item.volumeInfo || {};
        return {
          id: item.id,
          title: v.title || 'Untitled',
          author: (v.authors && v.authors.join(', ')) || 'Unknown',
          cover: (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail))
            ? (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail).replace(/^http:/, 'https:')
            : `https://placehold.co/140x186/CCCCCC/000000?text=${encodeURIComponent(v.title || 'No+Cover')}`,
          description: v.description || v.subtitle || 'No description available.',
          publishedDate: v.publishedDate || '',
          pageCount: v.pageCount || '',
          googleBooksUrl: v.infoLink || ''
        };
      });
    } catch (err) {
      console.warn('⚠️ Google Books API failed, using fallback data.', err.message);
      // Always return fallback data to keep UI alive
      return sampleBooks;
    }
  }

  // Create a book card element
  function createBookCard(book) {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.tabIndex = 0;
    card.dataset.id = book.id;

    const img = document.createElement('img');
    img.className = 'book-cover';
    img.src = book.cover || `https://placehold.co/140x186/CCCCCC/000000?text=${encodeURIComponent(book.title || 'No+Cover')}`;
    img.alt = book.title || 'Book cover';
    img.onerror = () => {
      img.src = `https://placehold.co/140x186/CCCCCC/000000?text=${encodeURIComponent(book.title || 'No+Cover')}`;
    };

    const info = document.createElement('div');
    info.className = 'book-info';
    info.innerHTML = `<div class="book-title">${book.title}</div>
                      <div class="book-author">${book.author || ''}</div>
                      ${book.rating ? `<div class="book-rating">${'★'.repeat(Math.round(book.rating))}</div>` : ''}`;

    card.appendChild(img);
    card.appendChild(info);

    // click or enter to open modal with animation
    function openHandler(e) {
      e.preventDefault && e.preventDefault();
      if (window.gsap) {
        window.gsap.fromTo(card, { scale: 1 }, { scale: 0.98, duration: 0.06, yoyo: true, repeat: 1, onComplete: () => showBookModal(book) });
      } else {
        showBookModal(book);
      }
    }

    card.addEventListener('click', openHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openHandler(e);
    });

    return card;
  }

  // Populate hottest reads area
  async function populateHottestReads() {
    if (!hottestEl) return;
    hottestEl.innerHTML = `<div class="book-card"><img class="book-cover" src="https://placehold.co/140x186?text=Loading" alt="loading"><div class="book-info"><div class="book-title">Loading...</div></div></div>`;
    const books = await fetchHottestReads();
    hottestEl.innerHTML = '';
    books.forEach(b => hottestEl.appendChild(createBookCard(b)));
  }

  // Populate currently reading (demo)
  function populateCurrentlyReading(items) {
    if (!followingEl) return;
    followingEl.innerHTML = '';
    (items || []).forEach(it => {
      const c = document.createElement('div');
      c.className = 'currently-reading-card';
      c.innerHTML = `
        <img class="currently-reading-cover" src="${it.cover || 'https://placehold.co/140x186?text=Book'}" alt="${it.title}">
        <div class="currently-reading-info">
          <div style="font-weight:700">${it.title}</div>
          <div style="color:var(--dark-grey);font-size:.9rem">${it.author || ''}</div>
          <div class="reading-progress"><div class="progress-bar" style="width:${it.progress || 40}%"></div></div>
          <div style="font-size:.85rem;color:var(--dark-grey);margin-top:.4rem">${it.progress || 40}% complete</div>
        </div>`;
      followingEl.appendChild(c);
    });
  }

  // Populate friends activity
  function populateFriendsActivity(items) {
    if (!friendsEl) return;
    friendsEl.innerHTML = '';
    (items || []).forEach(it => {
      const el = document.createElement('div');
      el.className = 'activity-item';
      el.innerHTML = `
        <img class="activity-avatar" src="${it.avatar}" alt="${it.user}" onerror="this.src='https://placehold.co/40x40/CCCCCC/000000?text=U'">
        <div class="activity-content">
          <div class="activity-user">${it.user}</div>
          <div class="activity-text">${renderActivityText(it)}</div>
          <div class="activity-time">${it.time}</div>
        </div>`;
      friendsEl.appendChild(el);
    });
  }

  function renderActivityText(it) {
    if (it.action === 'rated') return `rated <strong>${it.target}</strong> · ${'★'.repeat(it.rating || 0)}`;
    if (it.action === 'added') return `added <strong>${it.target}</strong> to ${it.list || 'a list'}`;
    if (it.action === 'reviewed') return `reviewed <strong>${it.target}</strong>`;
    return `${it.action} <strong>${it.target}</strong>`;
  }

  // Book modal
  function showBookModal(book) {
    if (!bookModal || !bookModalContent) return;
    const safeCover = book.cover || `https://placehold.co/140x186/CCCCCC/000000?text=${encodeURIComponent(book.title || 'No+Cover')}`;
    bookModalContent.innerHTML = `
      <div style="display:flex;gap:1rem;align-items:flex-start;">
        <img src="${safeCover}" alt="${book.title}" style="width:120px;height:auto;object-fit:cover;border-radius:6px;">
        <div style="flex:1;">
          <h3 style="margin:0 0 .25rem;">${book.title}</h3>
          <div style="color:var(--dark-grey);margin-bottom:.5rem;">${book.author || ''}</div>
          <p style="margin:.5rem 0;color:#333;">${book.description || 'No description available.'}</p>
          <div style="font-size:.9rem;color:var(--dark-grey);">Published: ${book.publishedDate || 'Unknown'} · ${book.pageCount ? book.pageCount + ' pages' : ''}</div>
        </div>
      </div>
      <div style="margin-top:1rem;display:flex;gap:.5rem;justify-content:flex-end">
        <button id="book-modal-open-ext" style="background:var(--orange);color:#fff;padding:.5rem .8rem;border-radius:6px;border:none;cursor:pointer;">Open</button>
        <button id="book-modal-close" style="background:#eee;color:#111;padding:.5rem .8rem;border-radius:6px;border:none;cursor:pointer;">Close</button>
      </div>
    `;

    if (window.app && typeof window.app.openModal === 'function') {
      window.app.openModal('book-modal');
    } else {
      bookModal.classList.add('show');
    }

    document.getElementById('book-modal-close').addEventListener('click', () => {
      if (window.app && typeof window.app.closeModal === 'function') window.app.closeModal('book-modal');
      else bookModal.classList.remove('show');
    });

    const openExt = document.getElementById('book-modal-open-ext');
    if (openExt) openExt.addEventListener('click', () => {
      const url = book.googleBooksUrl || `https://books.google.com/books?id=${book.id}`;
      window.open(url, '_blank');
    });
  }

  // Wire search modal
  function wireSearch() {
    const searchBtn = document.getElementById('search-modal-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.app && typeof window.app.openModal === 'function') window.app.openModal('search-modal');
        else document.getElementById('search-modal').classList.add('show');
        setTimeout(() => document.getElementById('search-modal-input')?.focus(), 80);
      });
    }

    document.querySelectorAll('#search-modal .close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.app && typeof window.app.closeModal === 'function') window.app.closeModal('search-modal');
        else document.getElementById('search-modal').classList.remove('show');
      });
    });
  }

  async function initHome() {
    await populateHottestReads();
    populateCurrentlyReading([
      { title: 'Where the Crawdads Sing', author: 'Delia Owens', cover: 'https://placehold.co/140x186/74925D/FFFFFF?text=Crawdads+Sing', progress: 34 },
      { title: 'Dune', author: 'Frank Herbert', cover: 'https://placehold.co/140x186/4C6145/FFFFFF?text=Dune', progress: 72 }
    ]);
    populateFriendsActivity(sampleActivities);
    wireSearch();

    const mod = document.getElementById('book-modal');
    if (mod) mod.addEventListener('click', (e) => {
      if (e.target === mod) {
        if (window.app && typeof window.app.closeModal === 'function') window.app.closeModal('book-modal');
        else mod.classList.remove('show');
      }
    });
  }

  window.home = { initHome, populateHottestReads, createBookCard, showBookModal };

  document.addEventListener('DOMContentLoaded', () => initHome());
})();

