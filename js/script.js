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

// DOM Elements
const homePage = document.getElementById('home-page');
const pageContent = document.getElementById('page-content');
const navLinks = document.querySelectorAll('.nav-links a, .side-menu a');
const modals = document.querySelectorAll('.modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app');
    
    // Initialize home page immediately
    initHomePage();
    setupEventListeners();
    initAnimations();
});

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
            genres: volumeInfo.categories || []
        };
    });
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
            description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the #1 New York Times bestselling author of The Martian."
        },
        {
            id: '3',
            title: "Klara and the Sun",
            author: "Kazuo Ishiguro",
            cover: getFallbackCover("Klara and the Sun"),
            rating: 4.2,
            description: "From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel about the unchanging nature of humanity."
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

function openBookModal(book) {
    console.log('Opening book modal:', book.title);
    
    const modalTitle = document.getElementById('book-modal-title');
    const modalContent = document.getElementById('book-modal-content');
    
    if (modalTitle) modalTitle.textContent = book.title;
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
                <img src="${book.cover}" alt="${book.title}" style="width: 150px; height: 200px; object-fit: cover;">
                <div>
                    <h4 style="margin-bottom: 0.5rem;">${book.title}</h4>
                    <p style="color: var(--dark-grey); margin-bottom: 1rem;">by ${book.author}</p>
                    ${book.rating ? `<p><strong>Rating:</strong> ${'★'.repeat(Math.floor(book.rating))}${book.rating % 1 ? '½' : ''} ${book.rating.toFixed(1)}</p>` : ''}
                    <p style="margin-top: 1rem;">${book.description}</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <button class="cta" style="background: var(--orange);"><i class="fas fa-heart"></i> Like</button>
                <button class="cta" style="background: var(--dark-azure);"><i class="fas fa-star"></i> Rate</button>
                <button class="cta" style="background: var(--grey-green);"><i class="fas fa-list"></i> Add to List</button>
            </div>
            <div class="form-group">
                <label class="form-label">Write a Review</label>
                <textarea class="form-input" rows="4" placeholder="Share your thoughts about this book..."></textarea>
            </div>
            <button class="cta" style="width: 100%;">Submit Review</button>
        `;
    }
    
    openModal('book-modal');
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
