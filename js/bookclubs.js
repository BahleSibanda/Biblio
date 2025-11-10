// js/bookclubs.js
(function () {
  const STORAGE_KEY = 'biblio_user_bookclubs_v1';
  const INITIAL_VISIBLE = 4; // how many to show initially in each section

  // Sample library of clubs (you can expand)
  const masterClubs = [
    { id: 'c1', name: 'Sci-Fi Explorers', members: 42, desc: 'Futuristic worlds and intergalactic adventures.', icon: 'fa-rocket' },
    { id: 'c2', name: 'Romantic Reads', members: 58, desc: 'Heartwarming stories and timeless love tales.', icon: 'fa-heart' },
    { id: 'c3', name: 'Mystery Minds', members: 73, desc: 'Unraveling mysteries and detective thrillers.', icon: 'fa-search' },
    { id: 'c4', name: 'Historical Fiction Lovers', members: 38, desc: 'Journey through time with historical novels.', icon: 'fa-landmark' },
    { id: 'c5', name: 'Fantasy Fans United', members: 120, desc: 'Epic fantasy and world-building masterpieces.', icon: 'fa-dragon' },
    { id: 'c6', name: 'Non-Fiction Book Society', members: 845, desc: 'Biographies, history, science, and more.', icon: 'fa-book' },
    { id: 'c7', name: 'Young Adult Corner', members: 230, desc: 'YA favorites and coming-of-age stories.', icon: 'fa-user-graduate' },
    { id: 'c8', name: 'Poetry & Short Stories', members: 95, desc: 'Verse and short fiction collectors.', icon: 'fa-feather' },
    { id: 'c9', name: 'Graphic Novels Guild', members: 66, desc: 'Comics, manga, and graphic storytelling.', icon: 'fa-mask' },
    { id: 'c10', name: 'BookTok Favorites', members: 2400000, desc: 'Books trending on social media.', icon: 'fa-fire' }
  ];

  // DOM refs
  const container = document.querySelector('.bookclubs-page') || document.querySelector('.container') || document.body;
  const yourGrid = document.getElementById('your-bookclubs');
  const popularGrid = document.getElementById('popular-bookclubs');
  const dynamicGrid = document.getElementById('dynamic-bookclubs');

  // Local data
  let yourClubs = []; // user's joined clubs
  let suggestedClubs = []; // remaining clubs we can show in Popular/Dynamic
  let popularVisibleCount = INITIAL_VISIBLE;
  let dynamicVisibleCount = INITIAL_VISIBLE;

  // Load persisted user clubs
  function loadUserClubs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        yourClubs = JSON.parse(raw);
      } else {
        yourClubs = [];
      }
    } catch (e) {
      console.warn('Failed to load user clubs', e);
      yourClubs = [];
    }
  }

  function saveUserClubs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(yourClubs));
    } catch (e) {
      console.warn('Failed to save user clubs', e);
    }
  }

  // Prepare suggested clubs list (master minus yourClubs)
  function prepareSuggested() {
    const yourIds = new Set(yourClubs.map(c => c.id));
    suggestedClubs = masterClubs.filter(c => !yourIds.has(c.id));
  }

  // Build a club card element
  function createClubCard(club, isYourClub = false) {
    const card = document.createElement('div');
    card.className = 'bookclub-card';
    card.dataset.clubId = club.id;

    card.innerHTML = `
      <div class="bookclub-header">
        <div class="bookclub-avatar" style="background: var(--light-grey); display:flex;align-items:center;justify-content:center;">
          <i class="fas ${club.icon || 'fa-book'}"></i>
        </div>
        <div class="bookclub-info">
          <div class="bookclub-name">${escapeHtml(club.name)}</div>
          <div class="bookclub-members">${formatMembers(club.members)}</div>
        </div>
      </div>
      <p class="bookclub-description">${escapeHtml(club.desc || '')}</p>
      <div class="bookclub-actions">
        ${isYourClub ? '<button class="btn-view" disabled>Member</button>' : '<button class="btn-view" disabled>Open Club</button>'}
        ${isYourClub ? '<button class="btn-join leave">Leave Club</button>' : '<button class="btn-join join">Join Club</button>'}
      </div>
    `;
    return card;
  }

  // helpers
  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }
  function formatMembers(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M members';
    if (n >= 1000) return (n/1000).toFixed(1) + 'k members';
    return n + ' members';
  }

  // render helpers
  function renderYourClubs() {
    if (!yourGrid) return;
    yourGrid.innerHTML = '';
    if (yourClubs.length === 0) {
      yourGrid.innerHTML = `<p style="color: var(--dark-grey); font-size: 0.95rem;">You haven’t joined any clubs yet. Join one below!</p>`;
      return;
    }
    yourClubs.forEach(c => {
      const card = createClubCard(c, true);
      yourGrid.appendChild(card);
    });
  }

  function renderPopularClubs() {
    if (!popularGrid) return;
    popularGrid.innerHTML = '';
    const visible = suggestedClubs.slice(0, popularVisibleCount);
    visible.forEach(c => popularGrid.appendChild(createClubCard(c, false)));
    // See All button handling: ensure only one See All per section
    let footer = popularGrid.querySelector('.see-all-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'see-all-footer';
      footer.style.gridColumn = '1 / -1';
      footer.style.textAlign = 'center';
      footer.style.marginTop = '0.5rem';
      footer.innerHTML = `<a href="#" class="see-more-popular">See All</a>`;
      popularGrid.parentElement.appendChild(footer);
      footer.querySelector('.see-more-popular').addEventListener('click', (e) => {
        e.preventDefault();
        popularVisibleCount += INITIAL_VISIBLE;
        renderPopularClubs();
      });
    }
  }

  function renderDynamicClubs() {
    if (!dynamicGrid) return;
    dynamicGrid.innerHTML = '';
    const visible = suggestedClubs.slice(popularVisibleCount, popularVisibleCount + dynamicVisibleCount);
    visible.forEach(c => dynamicGrid.appendChild(createClubCard(c, false)));
    // See All for dynamic
    let footer = dynamicGrid.querySelector('.see-all-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'see-all-footer';
      footer.style.gridColumn = '1 / -1';
      footer.style.textAlign = 'center';
      footer.style.marginTop = '0.5rem';
      footer.innerHTML = `<a href="#" class="see-more-dynamic">See All</a>`;
      dynamicGrid.parentElement.appendChild(footer);
      footer.querySelector('.see-more-dynamic').addEventListener('click', (e) => {
        e.preventDefault();
        dynamicVisibleCount += INITIAL_VISIBLE;
        renderDynamicClubs();
      });
    }
  }

  // join/leave handler (delegated)
  function handleClubActions(e) {
    const joinBtn = e.target.closest('.btn-join');
    if (!joinBtn) return;
    const card = joinBtn.closest('.bookclub-card');
    if (!card) return;
    const clubId = card.dataset.clubId;
    if (!clubId) return;

    // If join
    if (joinBtn.classList.contains('join')) {
      const club = suggestedClubs.find(c => c.id === clubId) || masterClubs.find(c => c.id === clubId);
      if (!club) return;
      // add to top of yourClubs
      yourClubs.unshift(Object.assign({}, club));
      // Remove from suggested list
      suggestedClubs = suggestedClubs.filter(c => c.id !== clubId);
      saveUserClubs();
      renderYourClubs();
      renderPopularClubs();
      renderDynamicClubs();
      // Optionally animate (if gsap)
      if (window.gsap) {
        const node = document.querySelector(`.bookclub-card[data-club-id="${clubId}"]`);
        if (node) window.gsap.fromTo(node, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
      }
      return;
    }

    // If leave
    if (joinBtn.classList.contains('leave')) {
      // remove from yourClubs and add back to suggested (end)
      yourClubs = yourClubs.filter(c => c.id !== clubId);
      const club = masterClubs.find(c => c.id === clubId);
      if (club) suggestedClubs.push(club);
      saveUserClubs();
      renderYourClubs();
      renderPopularClubs();
      renderDynamicClubs();
      return;
    }
  }

  // Search feature injected below navbar
  function injectSearchBar() {
    // if nav exists, inject search after nav
    const nav = document.querySelector('.top-nav') || document.querySelector('nav.top-nav');
    if (!nav) return;
    // avoid multiple inserts
    if (document.getElementById('bookclubs-search')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'bookclubs-search';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = '0.8rem';
    wrapper.innerHTML = `
      <input id="bookclub-search-input" type="search" placeholder="Search book clubs..." aria-label="Search book clubs"
        style="max-width:900px;width:100%;padding:.75rem 1rem;border-radius:999px;border:1px solid var(--medium-grey);font-size:1rem;">
    `;
    // insert after nav
    nav.insertAdjacentElement('afterend', wrapper);

    // wire input
    const input = document.getElementById('bookclub-search-input');
    input.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        prepareSuggested();
        renderPopularClubs();
        renderDynamicClubs();
        return;
      }
      // filter suggested and master for dynamic result
      const filtered = masterClubs.filter(c => c.name.toLowerCase().includes(q) || (c.desc || '').toLowerCase().includes(q));
      suggestedClubs = filtered.filter(c => !yourClubs.find(y => y.id === c.id));
      // re-render
      renderPopularClubs();
      renderDynamicClubs();
    });
  }

  // initial render flow
  function init() {
    // find grids (if missing, create them)
    if (!yourGrid || !popularGrid || !dynamicGrid) {
      console.warn('bookclubs grids missing in DOM, aborting render');
      return;
    }
    // load
    loadUserClubs();
    prepareSuggested();

    // initial visible counts
    popularVisibleCount = Math.min(INITIAL_VISIBLE, suggestedClubs.length);
    dynamicVisibleCount = Math.min(INITIAL_VISIBLE, Math.max(0, suggestedClubs.length - popularVisibleCount));

    renderYourClubs();
    renderPopularClubs();
    renderDynamicClubs();
    injectSearchBar();

    // delegate join/leave buttons
    document.addEventListener('click', handleClubActions);

    // re-populate if window.localStorage changed elsewhere
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        loadUserClubs();
        prepareSuggested();
        renderYourClubs();
        renderPopularClubs();
        renderDynamicClubs();
      }
    });
  }

  // Expose a safe API for debugging
  window.bookclubsApp = {
    init,
    getYourClubs: () => yourClubs,
    getSuggested: () => suggestedClubs
  };

  // Auto init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();

