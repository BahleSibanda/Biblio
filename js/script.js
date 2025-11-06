// Application State
let currentUser = null;
let currentPage = 'home';

// API Configuration
const API_CONFIG = {
    googleBooks: {
        baseUrl: 'https://www.googleapis.com/books/v1/volumes',
        apiKey: 'AIzaSyB1eFmP5eAiwP1dGZzWtOaY0pWwX8X8X8X8' // Demo key - replace with yours
    },
    openLibrary: {
        baseUrl: 'https://openlibrary.org',
        coversUrl: 'https://covers.openlibrary.org/b'
    }
};

// Sample data for fallback
const sampleBookClubs = [
    { id: 1, name: "Sci-Fi Enthusiasts", description: "Exploring the vast universe of science fiction literature", members: 42, image: "https://via.placeholder.com/300/143035/FFFFFF?text=Sci-Fi+Club" },
    { id: 2, name: "Historical Fiction Lovers", description: "Journeying through time with historical novels", members: 38, image: "https://via.placeholder.com/300/4C6145/FFFFFF?text=Historical+Fiction" },
    { id: 3, name: "Mystery & Thriller Club", description: "Unraveling mysteries one page at a time", members: 56, image: "https://via.placeholder.com/300/312021/FFFFFF?text=Mystery+Club" }
];

const sampleActivities = [
    { user: "BookLover23", action: "rated", target: "The Midnight Library", rating: 5, time: "2 hours ago", avatar: "https://via.placeholder.com/40/74925D/FFFFFF?text=BL" },
    { user: "PageTurner", action: "added", target: "Project Hail Mary", list: "To Be Read", time: "5 hours ago", avatar: "https://via.placeholder.com/40/4C6145/FFFFFF?text=PT" },
    { user: "LiteraryExplorer", action: "reviewed", target: "Klara and the Sun", time: "1 day ago", avatar: "https://via.placeholder.com/40/143035/FFFFFF?text=LE" }
];

// DOM Elements
const homePage = document.getElementById('home-page');
const pageContent = document.getElementById('page-content');
const navLinks = document.querySelectorAll('.nav-links a, .side-menu a');
const modals = document.querySelectorAll('.modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app');
    
    // Check authentication state
    checkAuthState();
    
    // Initialize home page immediately
    initHomePage();
    setupEventListeners();
    initAnimations();
});

// Check authentication state
function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            
            // Skip if already on home page
            if (page === 'home' && currentPage === 'home') {
                return;
            }
            
            // Check if user needs to be logged in
            if ((page === 'profile' || page === 'notifications') && !currentUser) {
                openModal('login-modal');
                return;
            }
            
            loadPage(page);
            updateActiveNav(link);
        });
    });

    // Modal handlers
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeAllModals();
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Auth buttons
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal('login-modal'));
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => openModal('signup-modal'));
    }

    // Search modal button
    const searchBtn = document.getElementById('search-modal-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('search-modal');
            setTimeout(() => {
                const searchInput = document.getElementById('search-modal-input');
                if (searchInput) searchInput.focus();
            }, 100);
        });
    }
}

// Load page content (only for non-home pages)
function loadPage(page) {
    console.log('Loading page:', page);
    currentPage = page;
    
    if (page === 'home') {
        // Show home page, hide other pages
        if (homePage) homePage.style.display = 'block';
        if (pageContent) {
            pageContent.innerHTML = '';
            pageContent.style.display = 'none';
        }
        
        // Re-initialize home page
        initHomePage();
    } else {
        // Hide home page, load other page
        if (homePage) homePage.style.display = 'none';
        if (pageContent) {
            pageContent.style.display = 'block';
            
            fetch(`pages/${page}.html`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Page not found');
                    }
                    return response.text();
                })
                .then(html => {
                    pageContent.innerHTML = html;
                    
                    // Load page-specific JavaScript
                    loadPageScript(page);
                })
                .catch(error => {
                    console.error('Error loading page:', error);
                    pageContent.innerHTML = '<div class="content-box"><h2>Page Not Found</h2><p>The requested page could not be loaded.</p></div>';
                });
        }
    }
    
    updateActiveNav();
}

// Load page-specific JavaScript
function loadPageScript(page) {
    // Don't load home.js again since it's already loaded
    if (page === 'home') return;
    
    const script = document.createElement('script');
    script.src = `js/${page}.js`;
    script.onload = () => {
        console.log(`Loaded ${page} script`);
        
        // Initialize the page if the function exists
        const initFunctionName = `init${page.charAt(0).toUpperCase() + page.slice(1)}Page`;
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName]();
        }
    };
    script.onerror = () => {
        console.warn(`No script found for ${page}`);
    };
    document.head.appendChild(script);
}

// Update active navigation
function updateActiveNav(clickedLink = null) {
    // Update top nav
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });

    // Update side menu
    document.querySelectorAll('.side-menu a').forEach(link => {
        // Skip search button as it's not a page
        if (link.id === 'search-modal-btn') return;
        
        link.classList.remove('active');
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAllModals() {
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Animation functions
function initAnimations() {
    // Global animations
    gsap.from('.logo', { duration: 1, y: -50, opacity: 0, ease: 'bounce' });
    
    // Navigation animation
    gsap.from('.nav-links a', {
        duration: 0.8,
        y: -20,
        opacity: 0,
        stagger: 0.1,
        delay: 0.5
    });
}

// Initialize home page
function initHomePage() {
    console.log('Initializing home page');
    
    // Load books data
    loadHottestReads();
    loadFriendsReading();
    initHomeAnimations();
}

// API Service Functions
async function searchBooks(query, maxResults = 12) {
    try {
        const response = await fetch(
            `${API_CONFIG.googleBooks.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        return transformGoogleBooksData(data.items || []);
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to sample data
        return getFallbackBooks();
    }
}

async function getTrendingBooks() {
    // For trending books, search popular terms
    const popularSearches = ['bestselling fiction', 'new releases', 'award winning'];
    const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];
    
    try {
        return await searchBooks(randomSearch, 8);
    } catch (error) {
        console.error('Trending books error:', error);
        return getFallbackBooks();
    }
}

async function getBookDetails(bookId) {
    try {
        const response = await fetch(`${API_CONFIG.googleBooks.baseUrl}/${bookId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        
        const data = await response.json();
        return transformBookDetails(data);
    } catch (error) {
        console.error('Book details error:', error);
        return null;
    }
}

function transformGoogleBooksData(books) {
    return books.map(book => {
        const volumeInfo = book.volumeInfo;
        return {
            id: book.id,
            title: volumeInfo.title || 'Unknown Title',
            author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
            cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : getFallbackCover(volumeInfo.title),
            rating: volumeInfo.averageRating || Math.random() * 2 + 3,
            description: volumeInfo.description || 'No description available.',
            publishedDate: volumeInfo.publishedDate,
            pageCount: volumeInfo.pageCount,
            genres: volumeInfo.categories || [],
            publisher: volumeInfo.publisher,
            language: volumeInfo.language
        };
    });
}

function transformBookDetails(book) {
    const volumeInfo = book.volumeInfo;
    return {
        id: book.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : getFallbackCover(volumeInfo.title),
        rating: volumeInfo.averageRating || 0,
        description: volumeInfo.description || 'No description available.',
        publishedDate: volumeInfo.publishedDate,
        pageCount: volumeInfo.pageCount,
        genres: volumeInfo.categories || [],
        publisher: volumeInfo.publisher,
        language: volumeInfo.language,
        isbn: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers[0]?.identifier : null
    };
}

function getFallbackCover(title) {
    const colors = ['74925D', '4C6145', '143035', '312021', 'F08E37'];
    const color = colors[title.length % colors.length];
    return `https://via.placeholder.com/150/${color}/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`;
}

function getFallbackBooks() {
    return [
        {
            id: '1',
            title: "The Midnight Library",
            author: "Matt Haig",
            cover: getFallbackCover("The Midnight Library"),
            rating: 4.5,
            description: "A novel about a library that contains books that let you experience the lives you might have lived."
        },
        {
            id: '2',
            title: "Project Hail Mary",
            author: "Andy Weir",
            cover: getFallbackCover("Project Hail Mary"),
            rating: 4.7,
            description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller."
        },
        {
            id: '3',
            title: "Klara and the Sun",
            author: "Kazuo Ishiguro",
            cover: getFallbackCover("Klara and the Sun"),
            rating: 4.2,
            description: "From the bestselling author of Never Let Me Go and The Remains of the Day."
        },
        {
            id: '4',
            title: "The Invisible Life of Addie LaRue",
            author: "V.E. Schwab",
            cover: getFallbackCover("The Invisible Life of Addie LaRue"),
            rating: 4.3,
            description: "A Life No One Will Remember. A Story You Will Never Forget."
        }
    ];
}

// Book loading functions
async function loadHottestReads() {
    const container = document.getElementById('hottest-reads');
    if (!container) {
        console.error('Hottest reads container not found');
        return;
    }
    
    console.log('Loading hottest reads');
    
    // Show loading state
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--orange);"></i>
            <p>Loading hottest reads...</p>
        </div>
    `;
    
    try {
        const trendingBooks = await getTrendingBooks();
        displayBooks(container, trendingBooks);
    } catch (error) {
        console.error('Error loading hottest reads:', error);
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Failed to load books. Please try again.</p>';
    }
}

async function loadFriendsReading() {
    const container = document.getElementById('friends-reading');
    if (!container) {
        console.error('Friends reading container not found');
        return;
    }
    
    console.log('Loading friends reading');
    
    try {
        const friendsBooks = await searchBooks('popular fiction', 6);
        displayBooks(container, friendsBooks);
    } catch (error) {
        console.error('Error loading friends reading:', error);
        container.innerHTML = '<p>Unable to load friends\' reading</p>';
    }
}

function displayBooks(container, books) {
    if (!books || books.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No books found</p>`;
        return;
    }
    
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookElement = createBookElement(book);
        container.appendChild(bookElement);
    });
    
    // Animate books
    gsap.from('.book-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    });
}

// Utility functions
function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.className = 'book-card slide-up';
    bookElement.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" class="book-cover">
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            ${book.rating ? `<div class="book-rating">${'★'.repeat(Math.floor(book.rating))}${book.rating % 1 ? '½' : ''} ${book.rating.toFixed(1)}</div>` : ''}
        </div>
    `;
    
    bookElement.addEventListener('click', () => openBookModal(book));
    return bookElement;
}

function createBookClubElement(club) {
    const clubElement = document.createElement('div');
    clubElement.className = 'bookclub-card slide-up';
    clubElement.innerHTML = `
        <img src="${club.image}" alt="${club.name}" class="bookclub-image">
        <div class="bookclub-info">
            <div class="bookclub-name">${club.name}</div>
            <div class="bookclub-description">${club.description}</div>
            <div class="bookclub-members">${club.members} members</div>
        </div>
    `;
    return clubElement;
}

function createActivityElement(activity) {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-card fade-in';
    
    let actionText = '';
    if (activity.action === 'rated') {
        actionText = `rated <strong>${activity.target}</strong> ${'★'.repeat(activity.rating)}`;
    } else if (activity.action === 'added') {
        actionText = `added <strong>${activity.target}</strong> to ${activity.list}`;
    } else if (activity.action === 'reviewed') {
        actionText = `reviewed <strong>${activity.target}</strong>`;
    } else if (activity.action === 'joined') {
        actionText = `joined <strong>${activity.target}</strong>`;
    }
    
    activityElement.innerHTML = `
        <div class="activity-header">
            <img src="${activity.avatar}" alt="${activity.user}" class="activity-avatar">
            <div>
                <div class="activity-user">${activity.user}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
        <div class="activity-content">
            ${actionText}
        </div>
    `;
    return activityElement;
}

async function openBookModal(book) {
    console.log('Opening book modal:', book.title);
    
    const modalTitle = document.getElementById('book-modal-title');
    const modalContent = document.getElementById('book-modal-content');
    
    if (modalTitle) modalTitle.textContent = book.title;
    
    if (modalContent) {
        // Show loading state
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--orange);"></i>
                <p>Loading book details...</p>
            </div>
        `;
        
        openModal('book-modal');
        
        try {
            // Try to get more detailed information
            let detailedBook = book;
            if (book.id && !book.id.startsWith('fallback-')) {
                const bookDetails = await getBookDetails(book.id);
                if (bookDetails) {
                    detailedBook = bookDetails;
                }
            }
            
            displayBookDetails(detailedBook);
        } catch (error) {
            console.error('Error loading book details:', error);
            displayBookDetails(book); // Fallback to basic info
        }
    }
}

function displayBookDetails(book) {
    const modalContent = document.getElementById('book-modal-content');
    
    modalContent.innerHTML = `
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <img src="${book.cover}" alt="${book.title}" style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1; min-width: 250px;">
                <h4 style="margin-bottom: 0.5rem; color: var(--dark-azure);">${book.title}</h4>
                <p style="color: var(--dark-grey); margin-bottom: 1rem;">by ${book.author}</p>
                
                ${book.rating ? `<p><strong>Rating:</strong> ${'★'.repeat(Math.floor(book.rating))}${book.rating % 1 >= 0.5 ? '½' : ''} ${book.rating.toFixed(1)}/5</p>` : ''}
                ${book.publishedDate ? `<p><strong>Published:</strong> ${new Date(book.publishedDate).getFullYear()}</p>` : ''}
                ${book.pageCount ? `<p><strong>Pages:</strong> ${book.pageCount}</p>` : ''}
                ${book.publisher ? `<p><strong>Publisher:</strong> ${book.publisher}</p>` : ''}
                ${book.language ? `<p><strong>Language:</strong> ${book.language.toUpperCase()}</p>` : ''}
                
                ${book.genres && book.genres.length > 0 ? `
                    <p><strong>Genres:</strong> ${book.genres.slice(0, 3).join(', ')}</p>
                ` : ''}
            </div>
        </div>
        
        ${book.description && book.description !== 'No description available.' ? `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem;">Description</h4>
                <p style="line-height: 1.6; max-height: 200px; overflow-y: auto; padding: 1rem; background: var(--light-grey); border-radius: 4px;">
                    ${book.description}
                </p>
            </div>
        ` : ''}
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button class="cta" style="background: var(--orange);"><i class="fas fa-heart"></i> Like</button>
            <button class="cta" style="background: var(--dark-azure);"><i class="fas fa-star"></i> Rate</button>
            <button class="cta" style="background: var(--grey-green);"><i class="fas fa-list"></i> Add to List</button>
        </div>
        
        <div class="form-group">
            <label class="form-label">Write a Review</label>
            <textarea class="form-input" rows="4" placeholder="Share your thoughts about this book..."></textarea>
        </div>
        <button class="cta" style="width: 100%; background: var(--dark-grey-brown);">Submit Review</button>
    `;
}

function initHomeAnimations() {
    console.log('Initializing home animations');
    
    // Timeline animation for section headers
    const tl = gsap.timeline();
    tl.from('.section-title', {
        duration: 1,
        x: -100,
        opacity: 0,
        stagger: 0.3
    });
    
    // ScrollTrigger animation for content boxes
    gsap.utils.toArray('.content-box').forEach(box => {
        gsap.from(box, {
            scrollTrigger: {
                trigger: box,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        });
    });
    
    // Motion path animation for floating books icon
    const floatingBook = document.createElement('div');
    floatingBook.innerHTML = '<i class="fas fa-book" style="font-size: 2rem; color: var(--orange);"></i>';
    floatingBook.style.position = 'fixed';
    floatingBook.style.bottom = '20px';
    floatingBook.style.right = '20px';
    floatingBook.style.zIndex = '1000';
    document.body.appendChild(floatingBook);
    
    gsap.to(floatingBook, {
        motionPath: {
            path: [{x: 0, y: 0}, {x: -10, y: -20}, {x: 0, y: -40}, {x: 10, y: -20}, {x: 0, y: 0}],
            curviness: 1.5
        },
        duration: 3,
        repeat: -1,
        ease: 'sine.inOut'
    });
}

// Form validation utility
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

// Update UI based on user authentication
function updateUIForUser() {
    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;
    
    if (currentUser) {
        userActions.innerHTML = `
            <span style="margin-right: 1rem;">Hello, ${currentUser.name}</span>
            <button id="logout-btn">LOG OUT</button>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        userActions.innerHTML = `
            <button id="login-btn">LOG IN</button>
            <button id="signup-btn">SIGN UP</button>
        `;
        
        // Re-attach event listeners
        document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
        document.getElementById('signup-btn').addEventListener('click', () => openModal('signup-modal'));
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    loadPage('home');
}
