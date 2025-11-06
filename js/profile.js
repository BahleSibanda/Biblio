// Profile page functionality
function initProfilePage() {
    console.log('Initializing profile page');
    loadProfileData();
    setupProfileTabs();
    initProfileAnimations();
}

async function loadProfileData() {
    // Load user's books from API
    const userBooks = await getUserBooks();
    
    // Update profile stats if user is logged in
    if (currentUser) {
        updateProfileStats();
    }
    
    // Top reads
    const topReadsContainer = document.getElementById('top-reads');
    if (topReadsContainer) {
        topReadsContainer.innerHTML = '';
        if (userBooks.length > 0) {
            userBooks.slice(0, 4).forEach(book => {
                const bookElement = createBookElement(book);
                topReadsContainer.appendChild(bookElement);
            });
        } else {
            topReadsContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grey); padding: 2rem;">No books added yet</p>';
        }
    }
    
    // Bookshelf
    const bookshelfContainer = document.getElementById('bookshelf');
    if (bookshelfContainer) {
        bookshelfContainer.innerHTML = '';
        const bookshelfBooks = userBooks.length > 0 ? userBooks.slice(0, 6) : await getFallbackBooks();
        if (bookshelfBooks.length > 0) {
            bookshelfBooks.forEach(book => {
                const bookElement = createBookElement(book);
                bookshelfContainer.appendChild(bookElement);
            });
        } else {
            bookshelfContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grey); padding: 2rem;">Your bookshelf is empty</p>';
        }
    }
    
    // All books for bookshelf tab
    const allBooksContainer = document.getElementById('all-books');
    if (allBooksContainer) {
        allBooksContainer.innerHTML = '';
        const allBooks = userBooks.length > 0 ? userBooks : await getFallbackBooks();
        if (allBooks.length > 0) {
            allBooks.forEach(book => {
                const bookElement = createBookElement(book);
                allBooksContainer.appendChild(bookElement);
            });
        } else {
            allBooksContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grey); padding: 2rem;">No books in your collection</p>';
        }
    }
    
    // Profile activity
    const profileActivityContainer = document.getElementById('profile-activity');
    if (profileActivityContainer) {
        profileActivityContainer.innerHTML = '';
        if (sampleActivities.length > 0) {
            sampleActivities.slice(0, 3).forEach(activity => {
                const activityElement = createActivityElement(activity);
                profileActivityContainer.appendChild(activityElement);
            });
        } else {
            profileActivityContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grey); padding: 1rem;">No recent activity</p>';
        }
    }
    
    // Load other tab content
    loadUserLists();
    loadLikedContent();
    loadUserReviews();
}

function updateProfileStats() {
    if (!currentUser) return;
    
    // Update follower and following counts
    const followerElements = document.querySelectorAll('.stat-value');
    if (followerElements.length >= 2) {
        followerElements[0].textContent = currentUser.followers || '0';
        followerElements[1].textContent = currentUser.following || '0';
    }
    
    // Update username and display name
    const usernameElement = document.querySelector('.username');
    const nameElement = document.querySelector('.name');
    
    if (usernameElement) usernameElement.textContent = currentUser.username || 'Bookworm42';
    if (nameElement) nameElement.textContent = currentUser.name || 'Alex Johnson';
}

async function getUserBooks() {
    // For demo, return recently searched books or fallback
    try {
        // You could store user's books in localStorage or get from your backend
        const userBookIds = JSON.parse(localStorage.getItem('userBooks') || '[]');
        
        if (userBookIds.length > 0) {
            // Fetch details for user's books
            const bookPromises = userBookIds.map(id => getBookDetails(id));
            return await Promise.all(bookPromises);
        } else {
            // Return some popular books as fallback
            return await searchBooks('popular fiction', 10);
        }
    } catch (error) {
        console.error('Error loading user books:', error);
        return getFallbackBooks();
    }
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
            const tabContent = document.getElementById(`${tabName}-tab-content`);
            if (tabContent) {
                tabContent.style.display = 'block';
                
                // Initialize tab content if needed
                if (tabName === 'bookshelf') {
                    initBookshelfTab();
                } else if (tabName === 'lists') {
                    loadUserLists();
                } else if (tabName === 'likes') {
                    loadLikedContent();
                } else if (tabName === 'reviews') {
                    loadUserReviews();
                }
            }
        });
    });
}

function initBookshelfTab() {
    console.log('Bookshelf tab initialized');
    
    // Add "View All Books" button functionality
    const viewAllBtn = document.querySelector('#profile-tab-content .cta');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            // Switch to bookshelf tab
            document.querySelectorAll('.profile-tab').forEach(tab => {
                if (tab.dataset.tab === 'bookshelf') {
                    tab.click();
                }
            });
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Add search functionality to bookshelf
    const bookshelfContainer = document.getElementById('all-books');
    if (bookshelfContainer && !bookshelfContainer.querySelector('.bookshelf-search')) {
        const searchHtml = `
            <div class="bookshelf-search" style="margin-bottom: 1.5rem;">
                <input type="text" placeholder="Search your bookshelf..." class="form-input" style="margin-bottom: 0;">
            </div>
        `;
        bookshelfContainer.insertAdjacentHTML('afterbegin', searchHtml);
        
        const searchInput = bookshelfContainer.querySelector('input');
        searchInput.addEventListener('input', function() {
            filterBookshelf(this.value);
        });
    }
}

function filterBookshelf(query) {
    const bookshelfContainer = document.getElementById('all-books');
    if (!bookshelfContainer) return;
    
    const bookCards = bookshelfContainer.querySelectorAll('.book-card');
    const searchTerm = query.toLowerCase().trim();
    
    bookCards.forEach(card => {
        const title = card.querySelector('.book-title').textContent.toLowerCase();
        const author = card.querySelector('.book-author').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'block';
            gsap.to(card, { duration: 0.3, scale: 1, opacity: 1 });
        } else {
            gsap.to(card, { 
                duration: 0.3, 
                scale: 0.8, 
                opacity: 0.3,
                onComplete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });
}

function loadUserLists() {
    const container = document.getElementById('user-lists');
    if (!container) return;
    
    const lists = [
        { 
            name: 'To Be Read', 
            count: 12, 
            color: '#4C6145', 
            description: 'Books I plan to read soon',
            created: '2 months ago'
        },
        { 
            name: 'Favorites 2024', 
            count: 8, 
            color: '#143035', 
            description: 'My favorite reads this year',
            created: '6 months ago'
        },
        { 
            name: 'Summer Reading', 
            count: 5, 
            color: '#312021', 
            description: 'Perfect books for summer',
            created: '1 month ago'
        },
        { 
            name: 'Book Club Picks', 
            count: 3, 
            color: '#F08E37', 
            description: 'Books selected for book club discussions',
            created: '3 weeks ago'
        }
    ];
    
    if (lists.length === 0) {
        container.innerHTML = `
            <div class="content-box" style="text-align: center;">
                <i class="fas fa-list" style="font-size: 3rem; color: var(--dark-grey); margin-bottom: 1rem;"></i>
                <h3>No Lists Yet</h3>
                <p>Create your first reading list to organize your books!</p>
                <button class="cta" style="margin-top: 1rem; background: var(--orange);" onclick="createNewList()">Create List</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = lists.map(list => `
        <div class="content-box list-item" style="margin-bottom: 1rem; border-left: 4px solid ${list.color}; cursor: pointer;" 
             onclick="viewList('${list.name}')"
             onmouseenter="animateListHover(this)" 
             onmouseleave="animateListLeave(this)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.5rem; color: ${list.color};">${list.name}</h4>
                    <p style="color: var(--dark-grey); margin-bottom: 0.5rem;">${list.description}</p>
                    <div style="display: flex; gap: 1.5rem; font-size: 0.9rem;">
                        <span><strong>${list.count}</strong> books</span>
                        <span>Created ${list.created}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--dark-grey); margin-left: 1rem; margin-top: 0.5rem;"></i>
            </div>
        </div>
    `).join('');
    
    // Add create list button
    container.innerHTML += `
        <div style="text-align: center; margin-top: 2rem;">
            <button class="cta" style="background: var(--grey-green);" onclick="createNewList()">
                <i class="fas fa-plus"></i> Create New List
            </button>
        </div>
    `;
}

function loadLikedContent() {
    const container = document.getElementById('liked-content');
    if (!container) return;
    
    const likedBooks = getFallbackBooks().slice(0, 6);
    const likedLists = [
        { name: 'Classic Literature', owner: 'BookLover23', books: 24 },
        { name: 'Science Fiction Masterpieces', owner: 'SciFiFan', books: 18 }
    ];
    
    container.innerHTML = `
        <div class="content-box">
            <h3 style="margin-bottom: 1rem;"><i class="fas fa-heart" style="color: var(--orange);"></i> Liked Books</h3>
            ${likedBooks.length > 0 ? `
                <div class="book-grid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
                    ${likedBooks.map(book => `
                        <div class="book-card" onclick="openBookModal(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                            <img src="${book.cover}" alt="${book.title}" class="book-cover">
                            <div class="book-info">
                                <div class="book-title">${book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="text-align: center; color: var(--dark-grey); padding: 2rem;">No liked books yet</p>
            `}
        </div>
        
        <div class="content-box" style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1rem;"><i class="fas fa-list-heart" style="color: var(--orange);"></i> Liked Lists</h3>
            ${likedLists.length > 0 ? `
                <div class="lists-grid">
                    ${likedLists.map(list => `
                        <div class="list-preview" style="border-left: 3px solid var(--dark-azure); padding: 1rem; background: var(--light-grey); border-radius: 4px; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 0.5rem;">${list.name}</h4>
                            <p style="color: var(--dark-grey); margin-bottom: 0.5rem;">by ${list.owner}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.9rem;">${list.books} books</span>
                                <button class="cta" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View List</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="text-align: center; color: var(--dark-grey); padding: 1rem;">No liked lists yet</p>
            `}
        </div>
    `;
}

function loadUserReviews() {
    const container = document.getElementById('user-reviews');
    if (!container) return;
    
    const reviews = [
        { 
            book: getFallbackBooks()[0], 
            rating: 5, 
            comment: "Absolutely loved this book! The characters were so well-developed and the concept was incredibly creative. Couldn't put it down! The way the author explores the different life paths is both thought-provoking and emotionally resonant.", 
            date: "2 weeks ago",
            likes: 12,
            comments: 3
        },
        { 
            book: getFallbackBooks()[1], 
            rating: 4, 
            comment: "Great sci-fi concepts and fascinating scientific accuracy. The problem-solving scenes were particularly engaging. Though the ending felt a bit rushed compared to the meticulous build-up throughout the book.", 
            date: "1 month ago",
            likes: 8,
            comments: 1
        },
        { 
            book: getFallbackBooks()[2], 
            rating: 4, 
            comment: "A beautiful and haunting exploration of artificial intelligence and what it means to be human. Ishiguro's subtle storytelling creates an atmosphere that stays with you long after finishing the book.", 
            date: "2 months ago",
            likes: 15,
            comments: 5
        }
    ];
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="content-box" style="text-align: center;">
                <i class="fas fa-pen" style="font-size: 3rem; color: var(--dark-grey); margin-bottom: 1rem;"></i>
                <h3>No Reviews Yet</h3>
                <p>Start reviewing books to share your thoughts with the community!</p>
                <button class="cta" style="margin-top: 1rem; background: var(--orange);" onclick="startReviewing()">Write Your First Review</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="content-box review-item" style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <img src="${review.book.cover}" alt="${review.book.title}" 
                     style="width: 80px; height: 120px; object-fit: cover; border-radius: 4px; cursor: pointer;"
                     onclick="openBookModal(${JSON.stringify(review.book).replace(/"/g, '&quot;')})">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.5rem; cursor: pointer;" 
                        onclick="openBookModal(${JSON.stringify(review.book).replace(/"/g, '&quot;')})">
                        ${review.book.title}
                    </h4>
                    <p style="color: var(--dark-grey); margin-bottom: 0.5rem;">by ${review.book.author}</p>
                    <div style="color: var(--orange); font-size: 1.1rem; margin: 0.5rem 0;">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        <span style="color: var(--dark-grey); font-size: 0.9rem; margin-left: 0.5rem;">${review.rating}/5</span>
                    </div>
                </div>
            </div>
            
            <div style="background: var(--light-grey); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="line-height: 1.6; margin: 0;">${review.comment}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1.5rem; color: var(--dark-grey); font-size: 0.9rem;">
                    <span>${review.date}</span>
                    <span><i class="fas fa-heart" style="color: var(--orange);"></i> ${review.likes}</span>
                    <span><i class="fas fa-comment"></i> ${review.comments}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="cta" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--light-orange); color: var(--black);">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="cta" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--dark-grey-brown);">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add review statistics
    const totalReviews = reviews.length;
    const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1);
    const totalLikes = reviews.reduce((sum, review) => sum + review.likes, 0);
    
    container.innerHTML = `
        <div class="content-box" style="margin-bottom: 1.5rem;">
            <h3>Review Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div style="text-align: center; padding: 1rem; background: var(--light-grey); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--dark-azure);">${totalReviews}</div>
                    <div style="color: var(--dark-grey);">Total Reviews</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: var(--light-grey); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--orange);">${averageRating}</div>
                    <div style="color: var(--dark-grey);">Average Rating</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: var(--light-grey); border-radius: 8px;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--grey-green);">${totalLikes}</div>
                    <div style="color: var(--dark-grey);">Total Likes</div>
                </div>
            </div>
        </div>
    ` + container.innerHTML;
}

// Helper functions for profile page
function animateListHover(element) {
    gsap.to(element, {
        duration: 0.3,
        y: -5,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        ease: 'power2.out'
    });
}

function animateListLeave(element) {
    gsap.to(element, {
        duration: 0.3,
        y: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ease: 'power2.out'
    });
}

function viewList(listName) {
    // In a real app, this would navigate to the list detail page
    console.log(`Viewing list: ${listName}`);
    
    // Show a modal or alert for demo
    const modalContent = `
        <div style="text-align: center;">
            <h3>${listName}</h3>
            <p>This would show all books in the "${listName}" list in a real implementation.</p>
            <p>Features would include:</p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>View all books in the list</li>
                <li>Reorder books</li>
                <li>Add/remove books</li>
                <li>Share the list</li>
                <li>See who else follows this list</li>
            </ul>
            <button class="cta" style="background: var(--orange); margin-top: 1rem;" onclick="closeAllModals()">Close</button>
        </div>
    `;
    
    // You would need to implement a custom modal or use the existing book modal
    alert(`Viewing list: ${listName}\n\nThis would show the detailed list view in the actual application.`);
}

function createNewList() {
    const listName = prompt('Enter a name for your new reading list:');
    if (listName && listName.trim()) {
        // In a real app, this would make an API call to create the list
        console.log(`Creating new list: ${listName}`);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--orange);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        successDiv.textContent = `Created list: ${listName}`;
        document.body.appendChild(successDiv);
        
        // Animate the success message
        gsap.fromTo(successDiv, 
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
        
        setTimeout(() => {
            gsap.to(successDiv, {
                y: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    if (document.body.contains(successDiv)) {
                        document.body.removeChild(successDiv);
                    }
                }
            });
        }, 3000);
        
        // Reload lists to show the new one
        setTimeout(() => {
            loadUserLists();
        }, 500);
    }
}

function startReviewing() {
    // Navigate to home page and open search to find a book to review
    loadPage('home');
    setTimeout(() => {
        openModal('search-modal');
    }, 500);
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
    
    // Stats counter animation
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach((stat, index) => {
        const targetValue = parseInt(stat.textContent) || 0;
        gsap.fromTo(stat,
            { innerText: 0 },
            {
                duration: 2,
                innerText: targetValue,
                snap: { innerText: 1 },
                delay: 1 + (index * 0.3),
                ease: "power2.out"
            }
        );
    });
    
    // Content animation with ScrollTrigger
    gsap.utils.toArray('.content-box').forEach((box, index) => {
        gsap.from(box, {
            scrollTrigger: {
                trigger: box,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            x: -100,
            opacity: 0,
            delay: index * 0.1
        });
    });
    
    // Book cards animation
    gsap.utils.toArray('.book-card').forEach((card, index) => {
        gsap.from(card, {
            duration: 0.6,
            scale: 0.8,
            rotationY: 90,
            opacity: 0,
            delay: 1.5 + (index * 0.1),
            ease: 'back.out(1.7)'
        });
    });
    
    // Floating animation for profile elements
    gsap.to('.profile-picture', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 3
    });
}

// Make functions globally available for HTML onclick handlers
window.viewList = viewList;
window.createNewList = createNewList;
window.startReviewing = startReviewing;
window.animateListHover = animateListHover;
window.animateListLeave = animateListLeave;