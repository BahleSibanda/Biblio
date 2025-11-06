// Application State
let currentUser = null;
let currentPage = 'home'; // Home is now the default

// DOM Elements
const homePage = document.getElementById('home-page');
const pageContent = document.getElementById('page-content');
const navLinks = document.querySelectorAll('.nav-links a, .side-menu a');
const modals = document.querySelectorAll('.modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Home page is already loaded, just initialize it
    if (typeof initHomePage === 'function') {
        initHomePage();
    }
    
    setupEventListeners();
    initAnimations();
});

// Setup event listeners
function setupEventListeners() {
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
    document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('signup-btn').addEventListener('click', () => openModal('signup-modal'));

    // Search modal button
    document.getElementById('search-modal-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('search-modal');
        setTimeout(() => {
            document.getElementById('search-modal-input').focus();
        }, 100);
    });
}

// Load page content (only for non-home pages)
function loadPage(page) {
    currentPage = page;
    
    if (page === 'home') {
        // Show home page, hide other pages
        homePage.style.display = 'block';
        pageContent.innerHTML = '';
        pageContent.style.display = 'none';
        
        // Re-initialize home page if needed
        if (typeof initHomePage === 'function') {
            initHomePage();
        }
    } else {
        // Hide home page, load other page
        homePage.style.display = 'none';
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
    document.getElementById(modalId).style.display = 'flex';
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

// Utility functions (keep the same as before)
function createBookElement(book) {
    // ... same as before
}

function createBookClubElement(club) {
    // ... same as before
}

function createActivityElement(activity) {
    // ... same as before
}

function openBookModal(book) {
    // ... same as before
}

// Form validation utility
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}
