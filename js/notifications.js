// Notifications page functionality
function initNotificationsPage() {
    console.log('Initializing notifications page');
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
            icon: 'fas fa-user-plus',
            color: '#74925D'
        },
        {
            type: 'bookclub',
            message: 'New discussion started in Sci-Fi Enthusiasts',
            time: '2 hours ago',
            read: false,
            icon: 'fas fa-users',
            color: '#4C6145'
        },
        {
            type: 'review',
            message: 'PageTurner liked your review of The Midnight Library',
            time: '1 day ago',
            read: true,
            icon: 'fas fa-heart',
            color: '#F08E37'
        },
        {
            type: 'system',
            message: 'Welcome to BookLoom! Complete your profile to get started.',
            time: '3 days ago',
            read: true,
            icon: 'fas fa-bell',
            color: '#143035'
        }
    ];
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="content-box" style="text-align: center;">
                <i class="fas fa-bell-slash" style="font-size: 3rem; color: var(--dark-grey); margin-bottom: 1rem;"></i>
                <h3>No Notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="activity-card ${notif.read ? '' : 'unread'}" style="border-left: 4px solid ${notif.color};">
            <div class="activity-header">
                <i class="${notif.icon}" style="font-size: 1.2rem; color: ${notif.color}; margin-right: 0.8rem;"></i>
                <div style="flex: 1;">
                    <div>${notif.message}</div>
                    <div class="activity-time">${notif.time}</div>
                </div>
                ${!notif.read ? '<div class="notification-badge" style="position: static; width: 12px; height: 12px;"></div>' : ''}
            </div>
        </div>
    `).join('');
    
    // Add click handlers to mark as read
    container.querySelectorAll('.unread').forEach(notification => {
        notification.addEventListener('click', function() {
            this.classList.remove('unread');
            const badge = this.querySelector('.notification-badge');
            if (badge) badge.remove();
            updateNotificationCount();
        });
    });
}

function updateNotificationCount() {
    const badge = document.querySelector('.side-menu .notification-badge');
    if (badge) {
        const unreadCount = document.querySelectorAll('.unread').length;
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
        } else {
            badge.remove();
        }
    }
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
    gsap.to('.unread .fa-bell, .unread .fa-user-plus, .unread .fa-users', {
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
    
    // Floating animation for notification icons
    gsap.to('.activity-card i', {
        y: -5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.1
    });
}