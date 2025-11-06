// Following page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (currentPage === 'following') {
        loadFollowingPage();
    }
});

function loadFollowingPage() {
    loadActivityFeed();
    initFollowingAnimations();
}

function loadActivityFeed() {
    const container = document.getElementById('activity-feed');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleActivities.forEach(activity => {
        const activityElement = createActivityElement(activity);
        container.appendChild(activityElement);
    });
}

function initFollowingAnimations() {
    // Timeline animation
    const tl = gsap.timeline();
    tl.from('.section-title', {
        duration: 1,
        x: -100,
        opacity: 0,
        ease: 'power2.out'
    })
    .from('.activity-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'back.out(1.7)'
    }, '-=0.5');
    
    // ScrollTrigger for infinite scroll effect
    gsap.utils.toArray('.activity-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.6,
            x: -100,
            opacity: 0
        });
    });
    
    // Floating animation for activity icons
    gsap.to('.activity-avatar', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
    });
}