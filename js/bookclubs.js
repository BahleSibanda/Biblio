// Bookclubs page functionality
function initBookclubsPage() {
    console.log('Initializing bookclubs page');
    loadBookClubsPage();
    initBookClubAnimations();
}

function loadBookClubsPage() {
    loadYourBookClubs();
    loadPopularBookClubs();
    setupBookClubEvents();
}

function loadYourBookClubs() {
    const container = document.getElementById('your-bookclubs');
    if (!container) return;
    
    container.innerHTML = '';
    
    // First two clubs as "your clubs"
    sampleBookClubs.slice(0, 2).forEach(club => {
        const clubElement = createBookClubElement(club);
        container.appendChild(clubElement);
    });
    
    if (sampleBookClubs.length === 0) {
        container.innerHTML = '<p>You haven\'t joined any book clubs yet.</p>';
    }
}

function loadPopularBookClubs() {
    const container = document.getElementById('popular-bookclubs');
    if (!container) return;
    
    container.innerHTML = '';
    
    // All clubs as "popular clubs"
    sampleBookClubs.forEach(club => {
        const clubElement = createBookClubElement(club);
        container.appendChild(clubElement);
    });
}

function setupBookClubEvents() {
    const createBtn = document.getElementById('create-bookclub-btn');
    if (createBtn) {
        createBtn.addEventListener('click', createNewBookClub);
    }
}

function createNewBookClub() {
    const clubName = prompt('Enter book club name:');
    if (clubName) {
        const newClub = {
            id: sampleBookClubs.length + 1,
            name: clubName,
            description: 'Your new book club description',
            members: 1,
            image: 'https://via.placeholder.com/300/74925D/FFFFFF?text=New+Club'
        };
        
        sampleBookClubs.unshift(newClub);
        loadYourBookClubs();
        loadPopularBookClubs();
        
        // Show success message
        showBookClubSuccess('Book club created successfully!');
    }
}

function showBookClubSuccess(message) {
    // Create a temporary success message
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
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

function initBookClubAnimations() {
    // Timeline animation
    const tl = gsap.timeline();
    tl.from('.section-title', {
        duration: 0.8,
        y: -30,
        opacity: 0,
        stagger: 0.2
    })
    .from('.bookclub-card', {
        duration: 0.6,
        x: -50,
        opacity: 0,
        stagger: 0.1
    }, '-=0.3');
    
    // ScrollTrigger for book clubs
    gsap.utils.toArray('.bookclub-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            rotationY: 90,
            opacity: 0,
            delay: i * 0.1
        });
    });
    
    // Floating animation for create button
    const createBtn = document.getElementById('create-bookclub-btn');
    if (createBtn) {
        gsap.to(createBtn, {
            y: -5,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}