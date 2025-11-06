// Bookclubs page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (currentPage === 'bookclubs') {
        loadBookClubsPage();
    }
});

function loadBookClubsPage() {
    loadYourBookClubs();
    loadPopularBookClubs();
    setupBookClubEvents();
    initBookClubAnimations();
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
        
        // Show success message
        alert('Book club created successfully!');
    }
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
}