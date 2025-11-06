// Home page functionality
function initHomePage() {
    loadHottestReads();
    loadFriendsReading();
    initHomeAnimations();
}

function loadHottestReads() {
    const container = document.getElementById('hottest-reads');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleBooks.forEach(book => {
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

function loadFriendsReading() {
    const container = document.getElementById('friends-reading');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Use first 4 books for demonstration
    sampleBooks.slice(0, 4).forEach(book => {
        const bookElement = createBookElement(book);
        container.appendChild(bookElement);
    });
}

function initHomeAnimations() {
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