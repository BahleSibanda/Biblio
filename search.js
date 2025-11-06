// Search modal functionality
document.addEventListener('DOMContentLoaded', function() {
    setupSearchModal();
});

function setupSearchModal() {
    const searchInput = document.getElementById('search-modal-input');
    const searchError = document.getElementById('search-modal-error');
    
    if (searchInput) {
        // Real-time search with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 500);
        });
        
        // Form validation
        searchInput.addEventListener('blur', function() {
            if (this.value.length > 0 && this.value.length < 2) {
                showError('search-modal-error', 'Search term must be at least 2 characters');
            } else {
                hideError('search-modal-error');
            }
        });
        
        // Clear results when modal opens
        document.getElementById('search-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                clearSearchResults();
            }
        });
    }
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-modal-results');
    if (!resultsContainer) return;
    
    if (!query || query.length < 2) {
        resultsContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--dark-grey);">Enter at least 2 characters to search</p>';
        return;
    }
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--orange); margin-bottom: 1rem;"></i>
            <p>Searching for "${query}"...</p>
        </div>
    `;
    
    // Simulate API call to Google Books API
    setTimeout(() => {
        const filteredBooks = sampleBooks.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase())
        );
        
        displaySearchResults(filteredBooks, query);
    }, 1000);
}

function displaySearchResults(books, query) {
    const resultsContainer = document.getElementById('search-modal-results');
    
    if (books.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--dark-grey); margin-bottom: 1rem;"></i>
                <p>No books found for "${query}"</p>
                <p style="color: var(--dark-grey);">Try different keywords or check your spelling</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    books.forEach(book => {
        const bookElement = createBookElement(book);
        resultsContainer.appendChild(bookElement);
    });
    
    // Animate search results
    gsap.from('.book-card', {
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    });
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('search-modal-results');
    const searchInput = document.getElementById('search-modal-input');
    
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--dark-grey);">Search for books to get started</p>';
    }
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    hideError('search-modal-error');
}

// Initialize search modal animations when it opens
document.getElementById('search-modal').addEventListener('click', function() {
    if (this.style.display === 'flex') {
        initSearchAnimations();
    }
});

function initSearchAnimations() {
    // Search input animation
    gsap.from('#search-modal-input', {
        duration: 0.5,
        width: 0,
        opacity: 0,
        ease: 'power2.out'
    });
    
    // Modal content animation
    gsap.from('.modal-content', {
        duration: 0.6,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)'
    });
}