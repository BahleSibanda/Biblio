// Enhanced bookclubs.js with advanced GSAP features
function initBookclubsPage() {
    console.log('Initializing Book Clubs page with advanced animations');
    loadBookClubs();
    initAdvancedBookClubsAnimations();
    initBookClubsInteractions();
    createAnimatedBackground();
}

function initAdvancedBookClubsAnimations() {
    // Animation 1: ScrollTrigger - Cards slide in on scroll
    gsap.utils.toArray('.bookclub-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                markers: false // Set to true to see trigger positions
            },
            duration: 1,
            y: 100,
            opacity: 0,
            rotationY: -10,
            stagger: index * 0.1,
            ease: "power3.out"
        });
    });

    // Animation 2: SVG Icon Animation Timeline
    const svgTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.bookclubs-page',
            start: "top 60%",
            end: "bottom 40%",
            toggleActions: "play none none none"
        }
    });

    // Create animated SVG elements
    createAnimatedSVGs();

    svgTimeline
        .from('.floating-book', {
            duration: 1.5,
            scale: 0,
            rotation: 360,
            stagger: 0.2,
            ease: "elastic.out(1, 0.5)"
        })
        .from('.pulsing-circle', {
            duration: 1,
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=1")
        .from('.animated-path', {
            duration: 2,
            strokeDashoffset: 1000,
            strokeDasharray: 1000,
            ease: "power2.inOut"
        }, "-=1.5");

    // Animation 3: Motion Path Animation for Featured Club
    createMotionPathAnimation();

    // Animation 4: Complex Timeline with Multiple Elements
    const pageLoadTimeline = gsap.timeline();

    pageLoadTimeline
        .from('.bookclubs-page h1', {
            duration: 1,
            y: -100,
            opacity: 0,
            rotationX: 90,
            transformOrigin: "top",
            ease: "power4.out"
        })
        .from('.search-input', {
            duration: 0.8,
            width: 0,
            opacity: 0,
            scaleX: 0,
            ease: "expo.out"
        }, "-=0.5")
        .from('.section-subtitle', {
            duration: 0.6,
            x: -50,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.3");

    // Animation 5: Hover effects with GSAP
    initHoverAnimations();

    // Animation 6: ScrollTrigger for stats counter
    initStatsCounter();
}

function createAnimatedSVGs() {
    const svgContainer = document.createElement('div');
    svgContainer.className = 'animated-svgs';
    svgContainer.innerHTML = `
        <svg class="floating-svgs" width="100%" height="120" viewBox="0 0 1200 120">
            <!-- Floating Book SVG -->
            <g class="floating-book">
                <path d="M200,50 L250,30 L300,50 L300,100 L250,120 L200,100 Z" 
                      fill="var(--orange)" opacity="0.8"/>
                <path d="M200,50 L300,50 L300,100 L200,100 Z" 
                      fill="var(--orange)" opacity="0.6"/>
                <line x1="250" y1="30" x2="250" y2="120" 
                      stroke="var(--dark-grey-brown)" stroke-width="2"/>
            </g>
            
            <!-- Pulsing Circles -->
            <circle class="pulsing-circle" cx="400" cy="60" r="15" 
                    fill="var(--orange)" opacity="0.7"/>
            <circle class="pulsing-circle" cx="450" cy="60" r="12" 
                    fill="var(--light-orange)" opacity="0.7"/>
            <circle class="pulsing-circle" cx="500" cy="60" r="10" 
                    fill="var(--orange)" opacity="0.7"/>
            
            <!-- Animated Path -->
            <path class="animated-path" d="M600,30 Q700,10 800,50 T1000,30" 
                  stroke="var(--orange)" stroke-width="3" fill="none" 
                  stroke-dasharray="1000" stroke-dashoffset="1000"/>
        </svg>
    `;
    
    document.querySelector('.bookclubs-page').insertBefore(svgContainer, document.querySelector('.bookclubs-grid'));
}

function createMotionPathAnimation() {
    // Create a motion path element
    const motionPathSVG = document.createElement('div');
    motionPathSVG.className = 'motion-path-container';
    motionPathSVG.innerHTML = `
        <svg width="100%" height="200" viewBox="0 0 1200 200" class="motion-path-svg">
            <path id="bookMotionPath" d="M100,180 Q300,50 500,100 Q700,150 900,50 Q1100,-50 1100,100" 
                  fill="none" stroke="rgba(240,142,55,0.3)" stroke-width="2" stroke-dasharray="5,5"/>
            
            <!-- Animated Book following the path -->
            <g id="animatedBook">
                <rect x="-15" y="-10" width="30" height="20" rx="3" fill="var(--orange)"/>
                <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--dark-grey-brown)" stroke-width="1"/>
            </g>
        </svg>
    `;
    
    document.querySelector('.bookclubs-page').appendChild(motionPathSVG);

    // Motion Path Animation
    gsap.to("#animatedBook", {
        duration: 10,
        repeat: -1,
        ease: "none",
        motionPath: {
            path: "#bookMotionPath",
            align: "#bookMotionPath",
            alignOrigin: [0.5, 0.5],
            autoRotate: true
        }
    });
}

function initHoverAnimations() {
    document.querySelectorAll('.bookclub-card').forEach(card => {
        const image = card.querySelector('.bookclub-image');
        const joinBtn = card.querySelector('.btn-join');
        
        // Hover timeline for each card
        const hoverTimeline = gsap.timeline({ paused: true });
        
        hoverTimeline
            .to(card, {
                duration: 0.3,
                y: -15,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                ease: "power2.out"
            })
            .to(image, {
                duration: 0.3,
                scale: 1.1,
                ease: "power2.out"
            }, 0)
            .to(joinBtn, {
                duration: 0.2,
                scale: 1.1,
                backgroundColor: "var(--orange-dark)",
                ease: "power2.out"
            }, 0);

        card.addEventListener('mouseenter', () => hoverTimeline.play());
        card.addEventListener('mouseleave', () => hoverTimeline.reverse());
    });
}

function initStatsCounter() {
    // Create stats section
    const statsSection = document.createElement('div');
    statsSection.className = 'bookclub-stats-section';
    statsSection.innerHTML = `
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-number" data-count="50">0</div>
                <div class="stat-label">Active Clubs</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" data-count="12500">0</div>
                <div class="stat-label">Total Members</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" data-count="245">0</div>
                <div class="stat-label">Books Discussed</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" data-count="98">0</div>
                <div class="stat-label">% Satisfaction</div>
            </div>
        </div>
    `;

    document.querySelector('.bookclubs-page').appendChild(statsSection);

    // ScrollTrigger for counter animation
    gsap.to('.stat-number', {
        scrollTrigger: {
            trigger: '.bookclub-stats-section',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            onEnter: () => animateCounters()
        }
    });
}

function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2;
        
        gsap.to(stat, {
            duration: duration,
            innerText: target,
            snap: { innerText: 1 },
            ease: "power2.out",
            onUpdate: function() {
                stat.textContent = Math.floor(this.targets()[0].innerText);
            }
        });
    });
}

function createAnimatedBackground() {
    // Create background animation elements
    const backgroundElements = document.createElement('div');
    backgroundElements.className = 'animated-background';
    backgroundElements.innerHTML = `
        <svg width="100%" height="100%" class="floating-shapes">
            <circle class="shape-1" cx="10%" cy="20%" r="8" fill="var(--orange)" opacity="0.1"/>
            <circle class="shape-2" cx="85%" cy="30%" r="12" fill="var(--light-orange)" opacity="0.1"/>
            <circle class="shape-3" cx="15%" cy="70%" r="6" fill="var(--orange)" opacity="0.1"/>
            <circle class="shape-4" cx="90%" cy="80%" r="10" fill="var(--light-orange)" opacity="0.1"/>
        </svg>
    `;

    document.querySelector('.bookclubs-page').style.position = 'relative';
    document.querySelector('.bookclubs-page').appendChild(backgroundElements);

    // Animate background shapes
    gsap.to('.shape-1', {
        duration: 4,
        y: -20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to('.shape-2', {
        duration: 3,
        y: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
    });

    gsap.to('.shape-3', {
        duration: 5,
        x: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
    });

    gsap.to('.shape-4', {
        duration: 4,
        x: -15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5
    });
}

// Enhanced join function with animation
function joinBookClub(clubId) {
    const club = sampleBookClubs.find(c => c.id === clubId);
    if (!club) return;

    const clubCard = document.querySelector(`[data-club-id="${clubId}"]`);
    const joinBtn = clubCard.querySelector('.btn-join');
    
    // Complex join animation timeline
    const joinTimeline = gsap.timeline();
    
    joinTimeline
        .to(clubCard, {
            duration: 0.2,
            scale: 0.95,
            y: -5,
            ease: "power2.inOut"
        })
        .to(joinBtn, {
            duration: 0.3,
            scale: 1.2,
            backgroundColor: "#4CAF50",
            color: "white",
            ease: "back.out(1.7)"
        })
        .to(joinBtn, {
            duration: 0.2,
            scale: 1,
            ease: "power2.out"
        })
        .to(clubCard, {
            duration: 0.3,
            scale: 1,
            y: 0,
            ease: "elastic.out(1, 0.5)"
        });

    // Create celebration particles
    createCelebrationParticles(clubCard);
    
    showToast(`🎉 Welcome to ${club.name}!`);
}

function createCelebrationParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: var(--orange);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
        `;
        
        document.body.appendChild(particle);
        
        gsap.to(particle, {
            duration: 1,
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: 0,
            scale: 0,
            ease: "power2.out",
            onComplete: () => particle.remove()
        });
    }
}

// Add to your bookclubs.js
function createPageTransitionSVG() {
    const transitionSVG = document.createElement('div');
    transitionSVG.className = 'page-transition-svg';
    transitionSVG.innerHTML = `
        <svg width="100%" height="100" viewBox="0 0 1200 100" class="transition-wave">
            <path id="wavePath" d="M0,50 Q300,0 600,50 Q900,100 1200,50 L1200,100 L0,100 Z" 
                  fill="var(--orange)" opacity="0.1"/>
        </svg>
    `;
    
    document.querySelector('.bookclubs-page').insertBefore(transitionSVG, document.querySelector('.bookclubs-grid'));

    // Animate the wave path
    gsap.to("#wavePath", {
        scrollTrigger: {
            trigger: ".transition-wave",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        attr: {
            d: "M0,50 Q300,100 600,50 Q900,0 1200,50 L1200,100 L0,100 Z"
        },
        ease: "none"
    });
}

// bookclubs.js
function initBookclubsPage() {
    console.log('Initializing Book Clubs page with ScrollTrigger animations');
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize animations
    initPageAnimations();
    initCardAnimations();
    initSectionAnimations();
}

function initPageAnimations() {
    // Page title animation
    gsap.from('.page-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: "back.out(1.7)"
    });
    
    // Search input animation
    gsap.from('.search-input', {
        duration: 0.8,
        width: 0,
        opacity: 0,
        ease: "power2.out",
        delay: 0.3
    });
}

function initCardAnimations() {
    // Your Book Clubs section cards
    gsap.utils.toArray('#your-bookclubs .bookclub-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                markers: false
            },
            duration: 0.8,
            y: 60,
            opacity: 0,
            rotationY: -5,
            stagger: index * 0.1,
            ease: "power2.out"
        });
    });
    
    // Popular Book Clubs section cards
    gsap.utils.toArray('#popular-bookclubs .bookclub-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                markers: false
            },
            duration: 0.8,
            y: 60,
            opacity: 0,
            rotationY: 5,
            stagger: index * 0.1,
            ease: "power2.out",
            delay: index * 0.05
        });
    });
    
    // Newsletter cards animation
    gsap.utils.toArray('.newsletter-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "bottom 10%",
                toggleActions: "play none none reverse",
                markers: false
            },
            duration: 0.6,
            y: 40,
            opacity: 0,
            scale: 0.9,
            stagger: index * 0.2,
            ease: "back.out(1.7)"
        });
    });
}

function initSectionAnimations() {
    // Section headers animation
    gsap.utils.toArray('.section-header').forEach((header, index) => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                markers: false
            },
            duration: 0.8,
            x: -50,
            opacity: 0,
            ease: "power2.out",
            delay: index * 0.1
        });
    });
    
    // See All links animation
    gsap.utils.toArray('.see-all').forEach((link, index) => {
        gsap.from(link, {
            scrollTrigger: {
                trigger: link,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                markers: false
            },
            duration: 0.6,
            x: 50,
            opacity: 0,
            ease: "power2.out",
            delay: index * 0.1
        });
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initBookclubsPage();
});

// Re-initialize animations when navigating to this page
if (typeof window.initBookclubsPage === 'function') {
    window.initBookclubsPage();
}