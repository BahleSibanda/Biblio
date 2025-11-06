// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (currentPage === 'profile') {
        loadProfilePage();
    }
});

function loadProfilePage() {
    loadProfileData();
    setupProfileTabs();
    initProfileAnimations();
}

function loadProfileData() {
    // Top reads
    const topReadsContainer = document.getElementById('top-reads');
    if (topReadsContainer) {
        topReadsContainer.innerHTML = '';
        sampleBooks.slice(0, 4).forEach(book => {
            const bookElement = createBookElement(book);
            topReadsContainer.appendChild(bookElement);
        });
    }
    
    // Bookshelf
    const bookshelfContainer = document.getElementById('bookshelf');
    if (bookshelfContainer) {
        bookshelfContainer.innerHTML = '';
        sampleBooks.slice(0, 6).forEach(book => {
            const bookElement = createBookElement(book);
            bookshelfContainer.appendChild(bookElement);
        });
    }
    
    // All books for bookshelf tab
    const allBooksContainer = document.getElementById('all-books');
    if (allBooksContainer) {
        allBooksContainer.innerHTML = '';
        sampleBooks.forEach(book => {
            const bookElement = createBookElement(book);
            allBooksContainer.appendChild(bookElement);
        });
    }
    
    // Profile activity
    const profileActivityContainer = document.getElementById('profile-activity');
    if (profileActivityContainer) {
        profileActivityContainer.innerHTML = '';
        sampleActivities.slice(0, 3).forEach(activity => {
            const activityElement = createActivityElement(activity);
            profileActivityContainer.appendChild(activityElement);
        });
    }
    
    // Load other tab content
    loadUserLists();
    loadLikedContent();
    loadUserReviews();
}

function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('[id$="-tab-content"]').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-tab-content`).style.display = 'block';
        });
    });
}

function loadUserLists() {
    const container = document.getElementById('user-lists');
    if (!container) return;
    
    const lists = [
        { name: 'To Be Read', count: 12, color: '#4C6145' },
        { name: 'Favorites 2024', count: 8, color: '#143035' },
        { name: 'Summer Reading', count: 5, color: '#312021' },
        { name: 'Book Club Picks', count: 3, color: '#F08E37' }
    ];
    
    container.innerHTML = lists.map(list => `
        <div class="content-box" style="margin-bottom: 1rem; border-left: 4px solid ${list.color};">
            <h4>${list.name}</h4>
            <p>${list.count} books</p>
        </div>
    `).join('');
}

function loadLikedContent() {
    const container = document.getElementById('liked-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="content-box">
            <h4>Liked Books</h4>
            <div class="book-grid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); margin-top: 1rem;">
                ${sampleBooks.slice(0, 4).map(book => `
                    <div class="book-card">
                        <img src="${book.cover}" alt="${book.title}" class="book-cover">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function loadUserReviews() {
    const container = document.getElementById('user-reviews');
    if (!container) return;
    
    const reviews = [
        { book: sampleBooks[0], rating: 5, comment: "Absolutely loved this book! The characters were so well-developed.", date: "2 weeks ago" },
        { book: sampleBooks[1], rating: 4, comment: "Great sci-fi concepts, though the ending felt a bit rushed.", date: "1 month ago" }
    ];
    
    container.innerHTML = reviews.map(review => `
        <div class="content-box" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.5rem;">
                <img src="${review.book.cover}" alt="${review.book.title}" style="width: 60px; height: 80px; object-fit: cover; margin-right: 1rem;">
                <div style="flex: 1;">
                    <h4>${review.book.title}</h4>
                    <div>${'★'.repeat(review.rating)}${review.rating < 5 ? '☆'.repeat(5 - review.rating) : ''}</div>
                    <p style="margin: 0.5rem 0;">${review.comment}</p>
                    <small style="color: var(--dark-grey);">${review.date}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function initProfileAnimations() {
    // Profile header animation
    gsap.from('.profile-header', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power2.out'
    });
    
    // Profile picture special animation
    gsap.from('.profile-picture', {
        duration: 1,
        scale: 0,
        rotation: 360,
        ease: 'back.out(1.7)',
        delay: 0.5
    });
    
    // Tab animation
    gsap.from('.profile-tab', {
        duration: 0.6, 
        y: -20,
        opacity: 0,
        stagger: 0.1,
        delay: 0.8
    });
    
    // Content animation with ScrollTrigger
    gsap.utils.toArray('.content-box').forEach(box => {
        gsap.from(box, {
            scrollTrigger: {
                trigger: box,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            x: -100,
            opacity: 0
        });
    });
}