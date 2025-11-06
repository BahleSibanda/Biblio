// Notifications page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (currentPage === 'notifications') {
        loadNotificationsPage();
    }
});

function loadNotificationsPage() {
    loadNotifications();
    initNotificationsAnimations();
}

function loadNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    const notifications = [
        {
            type: 'friend',
            message: 'BookLover23 started following you',
            time: '5 minutes ago',
            read: false,
            icon: 'fas fa-user-plus'
        },
        {
            type: 'bookclub',
            message: 'New discussion started in Sci-Fi Enthusiasts',
            time: '2 hours ago',
            read: false,
            icon: 'fas fa-users'
        },
        {
            type: 'review',
            message: 'PageTurner liked your review of The Midnight Library',
            time: '1 day ago',
            read: true,
            icon: 'fas fa-heart'
        },
        {
            type: 'system',
            message: 'Welcome to BookLoom! Complete your profile to get started.',
            time: '3 days ago',
            read: true,
            icon: 'fas fa-bell'
        }
    ];
    
    container.innerHTML = notifications.map(notif => `
        <div class="activity-card ${notif.read ? '' : 'unread'}" style="border-left: ${notif.read ? 'none' : '4px solid var(--orange)'};">
            <div class="activity-header">
                <i class="${notif.icon}" style="font-size: 1.2rem; color: var(--orange); margin-right: 0.8rem;"></i>
                <div style="flex: 1;">
                    <div>${notif.message}</div>
                    <div class="activity-time">${notif.time}</div>
                </div>
                ${!notif.read ? '<div class="notification-badge" style="position: static; width: 12px; height: 12px;"></div>' : ''}
            </div>
        </div>
    `).join('');
}

function initNotificationsAnimations() {
    // Timeline animation for notifications
    const tl = gsap.timeline();
    tl.from('.section-title', {
        duration: 0.8,
        y: -30,
        opacity: 0,
        ease: 'power2.out'
    })
    .from('.activity-card', {
        duration: 0.6,
        x: -100,
        opacity: 0,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    }, '-=0.4');
    
    // Bell shake animation for unread notifications
    gsap.to('.unread .fa-bell', {
        rotation: 15,
        duration: 0.2,
        repeat: 3,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.2
    });
    
    // Pulse animation for notification badges
    gsap.to('.notification-badge', {
        scale: 1.2,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}